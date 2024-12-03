import express from "express";
const router = express.Router();

import {
  createChapter,
  getAllChapter,
  getChapterManagerChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  getPaginatedChaptersData,
} from "../../controllers/AdminControllers/ChapterController.js";

router.post("/create", createChapter);

router.get("/getall", getAllChapter);

router.post("/getManagerChapters", getChapterManagerChapters);

router.post("/getbyId", getChapterById);

router.post("/updatebyId", updateChapter);

router.post("/deletebyId", deleteChapter);

router.post("/getallpaginatedData", getPaginatedChaptersData);

export default router;
