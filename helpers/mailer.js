import nodemailer from "nodemailer";
import { Smtp } from "../models/AllModels.js";
import { DefaultPasswordTemplate } from "../EmailTemplates/DefaultPasswordTemplate.js";
import { ResetPasswordTemplate } from "../EmailTemplates/ResetPasswordTemplate.js";
import ejs from "ejs";
import path from "path";
import { ImagesUrls } from "./Enum.js";

const SendDefaultPasswordEmail = async (
  UserFullName,
  UserName,
  UserEmail,
  UserPassword,
  Role,
  LoginUrlLink
) => {
  try {
    console.log("Send DefaultPassword Email Function Called");
    // Retrieve SmtpData from the Smtp model
    const SmtpData = await Smtp.find({});

    if (SmtpData.length == 0) {
      return "SmtpDetails Not Found in Database";
    }

    const { Port, Host, Username, Password, Encryption } = SmtpData[0];

    const transporter = nodemailer.createTransport({
      host: Host,
      port: Port,
      secure: false,
      auth: {
        user: Username,
        pass: Password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const TextParagraph = `Welcome to Eventing Club, Your account has been created as ${Role}, please log in to your account using the Username & Password below.`;
    const EventingClubLogo = ImagesUrls.EventingClubLogo;

    const mailOptions = {
      from: process.env.EMAIL_SENDER_NAME,
      to: UserEmail,
      subject: "Default Password",
      html: DefaultPasswordTemplate(
        UserFullName,
        TextParagraph,
        UserName,
        UserPassword,
        LoginUrlLink,
        EventingClubLogo
      ),
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error("Error:", error);
      }
      console.log("Message sent:", info.messageId);
    });
  } catch (error) {
    console.log("Error in SendMail Function" + error);
  }
};

const sendMailForgotPasswordLink = async (
  resetPasswordLink,
  UserEmail,
  UserName
) => {
  try {
    console.log("Send Forgot PasswordEmail Function Called");
    // Retrieve SmtpData from the Smtp model
    const SmtpData = await Smtp.find({});

    if (SmtpData.length == 0) {
      return "SmtpDetails Not Found in Database";
    }

    const { Port, Host, Username, Password, Encryption } = SmtpData[0];

    const transporter = nodemailer.createTransport({
      host: Host,
      port: Port,
      secure: false,
      auth: {
        user: Username,
        pass: Password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // const Data = ` ${process.env.BASE_URL_PATH}/resetpassword/${token}`;
    const TextParagraph = `Hello ${UserName}, We have got the Request to reset the password,Please click the below button to reset your password.If you Didn't request for this please change your password`;
    const EventingClubLogo = ImagesUrls.EventingClubLogo;

    const mailOptions = {
      to: UserEmail,
      from: process.env.EMAIL_SENDER_NAME,
      subject: "Reset Password",
      html: ResetPasswordTemplate(
        resetPasswordLink,
        UserName,
        UserEmail,
        TextParagraph,
        EventingClubLogo
      ),
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error("Error:", error);
      }
      console.log("Message sent:", info.messageId);
    });
  } catch (error) {
    console.log("Error in SendMail Function" + error);
  }
};

const sendEventTicketToCustomerEmail = async (
  UserEmail,
  eventName,
  bookingId,
  logoUrl,
  dateIconUrl,
  timeIconUrl,
  eventDate,
  eventTime,
  BookedEventTicketType,
  ticketName,
  ticketQuantity,
  venueName,
  venueCity,
  qrCodeUrl,
  ticketDownloadLink,
  termsAndConditions,
  TicketDescription
) => {
  try {
    console.log("Send Event Ticket Email Function Called");

    // Retrieve SmtpData from the Smtp model
    const SmtpData = await Smtp.find({});
    if (SmtpData.length == 0) {
      return "SmtpDetails Not Found in Database";
    }

    const { Port, Host, Username, Password } = SmtpData[0];

    // Create reusable transporter object
    const transporter = nodemailer.createTransport({
      host: Host,
      port: Port,
      secure: false,
      auth: {
        user: Username,
        pass: Password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const html = await ejs.renderFile(
      path.join(process.cwd(), "templates", "Emailticket.ejs"),
      {
        eventName,
        bookingId,
        logoUrl,
        dateIconUrl,
        timeIconUrl,
        eventDate,
        eventTime,
        BookedEventTicketType,
        ticketName,
        ticketQuantity,
        venueName,
        venueCity,
        qrCodeUrl,
        downloadLink: ticketDownloadLink,
        termsAndConditions,
        TicketDescription,
      }
    );

    const mailOptions = {
      to: UserEmail,
      from: process.env.EMAIL_SENDER_NAME,
      subject: `${eventName} Event Ticket`,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error in SendMail Function:", error);
  }
};

export {
  SendDefaultPasswordEmail,
  sendMailForgotPasswordLink,
  sendEventTicketToCustomerEmail,
};
