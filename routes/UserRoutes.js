import express from "express";
const router = express.Router();

import {
  createUser,
  userLogin,
  getAllUser,
  getUserById,
  deleteUser,
  getPaginatedUsersData,
} from "../controllers/UserController.js";

router.post("/create", createUser);

router.post("/login", userLogin);

router.get("/getall", getAllUser);

router.post("/getbyId", getUserById);

router.post("/deletebyId", deleteUser);

router.post("/getallpaginatedData", getPaginatedUsersData);

export default router;
