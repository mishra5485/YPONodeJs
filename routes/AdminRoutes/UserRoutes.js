import express from "express";
const router = express.Router();

import {
  createUser,
  userLogin,
  getAllUser,
  getAllSuperAdmins,
  getAllMembers,
  getAllSpousePartners,
  getAllChapterManagers,
  getUserById,
  deleteUser,
  getPaginatedUsersData,
  renderUserCard,
} from "../../controllers/AdminControllers/UserController.js";

router.post("/create", createUser);

router.post("/login", userLogin);

router.get("/getall", getAllUser);

router.get("/getallSuperAdmins", getAllSuperAdmins);

router.get("/getAllMembers", getAllMembers);

router.get("/getAllSpousePartners", getAllSpousePartners);

router.get("/getAllChapterManagers", getAllChapterManagers);

router.post("/getbyId", getUserById);

router.post("/deletebyId", deleteUser);

router.post("/getallpaginatedData", getPaginatedUsersData);

router.get("/rndcard/:user_id", renderUserCard);

export default router;
