import express from "express";
const router = express.Router();

import {
  createUser,
  userLogin,
  getSuperAdminDashBoardData,
  updateUserName,
  userChangePassword,
  getAllSuperAdmins,
  downloadUserData,
  getAllMembers,
  getAllSpousePartners,
  getAllChapterManagers,
  getAllChapterUsers,
  deleteUser,
  renderUserCard,
  downloadUserCard,
} from "../../controllers/AdminControllers/UserController.js";

router.post("/create", createUser);

router.post("/login", userLogin);

router.post("/getSuperAdminDashBoardData", getSuperAdminDashBoardData);

router.post("/upadtebyId", updateUserName);

router.post("/userChangePassword", userChangePassword);

router.get("/getallSuperAdmins", getAllSuperAdmins);

router.post("/downloadUserData", downloadUserData);

router.get("/getAllMembers", getAllMembers);

router.get("/getAllSpousePartners", getAllSpousePartners);

router.get("/getAllChapterManagers", getAllChapterManagers);

router.post("/getAllChapterUsers", getAllChapterUsers);

router.post("/deletebyId", deleteUser);

router.get("/rndcard/:user_id", renderUserCard);

router.get("/downloadcard/:user_id", downloadUserCard);

export default router;
