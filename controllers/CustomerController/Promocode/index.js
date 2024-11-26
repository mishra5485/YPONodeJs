import sendResponse from "../../../helpers/sendResponse.js";
import {
  PromocodeCanbeUsedIn,
  PromocodeUnit,
  PromocodeOneTimePerCustomerFlag,
  PromocodeValid,
  EventStatus,
  Status,
  PromocodeStatus,
  BookingStatus,
} from "../../../helpers/Enum.js";
import { getPromocodeDataService } from "../../../services/PromocodeServices.js";
import {
  getEventDataService,
  findOneEventDataService,
} from "../../../services/EventServices.js";
import { findOneCustomerDataService } from "../../../services/CustomerServices.js";
import { findOneEventBookingsDataService } from "../../../services/EventBookingServices.js";

const getPromocodesForEventsWebsite = async (req, res) => {
  try {
    console.log("Get Promocodes for Events Website API Called");
    console.log("Request Body: ", req.body);

    const { event_id, customer_id } = req.body;

    if (!event_id) return sendResponse(res, 404, true, "Provide Event Id");

    if (!customer_id)
      return sendResponse(res, 404, true, "Provide Customer Id");

    const isCustomerExists = await findOneCustomerDataService({
      _id: customer_id,
      status: Status.Active,
    });

    if (!isCustomerExists)
      return sendResponse(res, 404, true, "Customer Not Found");

    const isEventExists = await findOneEventDataService({
      _id: event_id,
    });

    if (!isEventExists) return sendResponse(res, 404, true, "Event Not Found");

    // Fetching active promocodes
    const promocodes = await getPromocodeDataService({
      status: PromocodeStatus.Active,
    });

    if (!promocodes.length)
      return sendResponse(res, 404, true, "Promocodes not found");

    // Filter applicable promocodes

    const applicablePromocodes = await Promise.all(
      promocodes.map(async ({ _doc }) => {
        const {
          _id,
          CanBeUsed,
          PromocodeValidFor,
          CustomerIds,
          Events,
          PromoCodeName,
          TermsCondition,
          Value,
          PromocodeType,
          MinCheckoutAmount,
          OneTimeUseFlag,
        } = _doc;

        if (OneTimeUseFlag == PromocodeOneTimePerCustomerFlag.Yes) {
          const IsPromocodeAlreadyUsed = await findOneEventBookingsDataService({
            customer_id: customer_id,
            Promocode_id: _id,
            status: BookingStatus.Booked,
          });
          if (IsPromocodeAlreadyUsed) {
            return null; // Return null if the promo code was already used
          }
          return {
            _id: _id,
            PromoCodeName: PromoCodeName.toUpperCase(),
            TermsCondition: TermsCondition,
            MinAmount: MinCheckoutAmount,
            PromType: PromocodeType,
            Value: Value,
          };
        }

        // 1) All Events case
        if (CanBeUsed == PromocodeCanbeUsedIn.AllEvents) {
          // (a) If Promocode is for Specific Customer
          if (PromocodeValidFor == PromocodeValid.SpecificCustomers) {
            if (
              CustomerIds.some(
                (customer) => customer.customer_id == customer_id
              )
            ) {
              return {
                _id: _id,
                PromoCodeName: PromoCodeName.toUpperCase(),
                TermsCondition: TermsCondition,
                MinAmount: MinCheckoutAmount,
                PromType: PromocodeType,
                Value: Value,
              };
            }
            return null; // No match for customer, discard this promocode
          }

          // (b) If Promocode is for All Customers
          if (PromocodeValidFor == PromocodeValid.AllCustomers) {
            return {
              _id: _id,
              PromoCodeName: PromoCodeName.toUpperCase(),
              TermsCondition: TermsCondition,
              MinAmount: MinCheckoutAmount,
              PromType: PromocodeType,
              Value: Value,
            };
          }
        }

        // 2) Specific Events case
        if (CanBeUsed == PromocodeCanbeUsedIn.SpecificEvents) {
          // Check if the event_id exists in the promocode's Events
          const isEventSpecific = Events.some(
            (event) => event.event_id == event_id
          );

          if (isEventSpecific) {
            // (a) If Promocode is for Specific Customers
            if (PromocodeValidFor == PromocodeValid.SpecificCustomers) {
              if (
                CustomerIds.some(
                  (customer) => customer.customer_id == customer_id
                )
              ) {
                return {
                  _id: _id,
                  PromoCodeName: PromoCodeName.toUpperCase(),
                  TermsCondition: TermsCondition,
                  MinAmount: MinCheckoutAmount,
                  PromType: PromocodeType,
                  Value: Value,
                };
              }
              return null; // No match for customer, discard this promocode
            }

            // (b) If Promocode is for All Customers
            if (PromocodeValidFor == PromocodeValid.AllCustomers) {
              return {
                _id: _id,
                PromoCodeName: PromoCodeName.toUpperCase(),
                TermsCondition: TermsCondition,
                MinAmount: MinCheckoutAmount,
                PromType: PromocodeType,
                Value: Value,
              };
            }
          }
        }

        return null;
      })
    );

    // Filter out null values after Promise.all is resolved
    const filteredPromocodes = applicablePromocodes.filter(
      (promocode) => promocode != null
    );

    if (!filteredPromocodes.length) {
      return sendResponse(
        res,
        404,
        true,
        "No applicable promocodes found for this event"
      );
    }

    const respObj = {
      applicablePromocodes: filteredPromocodes,
      ConfeeUnit: isEventExists._doc.ConvinienceFeeUnit,
      ConFeeValue: isEventExists._doc.ConvinienceFeeValue,
    };

    return sendResponse(
      res,
      200,
      false,
      "Applicable Promocodes fetched successfully",
      respObj
    );
  } catch (error) {
    console.error("Error in fetching Promocodes Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

export { getPromocodesForEventsWebsite };
