import express from "express";
const router = express.Router();

import {
  createUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  getPaginatedUsersData,
} from "../controllers/UserController.js";

router.post("/create", createUser);

router.get("/getall", getAllUser);

router.post("/getbyId", getUserById);

router.post("/updatebyId", updateUser);

router.post("/deletebyId", deleteUser);

router.post("/getallpaginatedData", getPaginatedUsersData);

export default router;
