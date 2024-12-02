import express from "express";
const router = express.Router();

import {
  createUser,
  userLogin,
  getAllSuperAdmins,
  getAllMembers,
  getAllSpousePartners,
  getAllChapterManagers,
  deleteUser,
  renderUserCard,
} from "../../controllers/AdminControllers/UserController.js";

router.post("/create", createUser);

router.post("/login", userLogin);

router.get("/getallSuperAdmins", getAllSuperAdmins);

router.get("/getAllMembers", getAllMembers);

router.get("/getAllSpousePartners", getAllSpousePartners);

router.get("/getAllChapterManagers", getAllChapterManagers);

router.post("/deletebyId", deleteUser);

router.get("/rndcard/:user_id", renderUserCard);

export default router;
