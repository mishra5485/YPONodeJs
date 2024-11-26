import express from "express";
const router = express.Router();

import { getPromocodesForEventsWebsite } from "../../../controllers/CustomerController/Promocode/index.js";

router.post("/getPromocodesForEventsWebsite", getPromocodesForEventsWebsite);

export default router;
