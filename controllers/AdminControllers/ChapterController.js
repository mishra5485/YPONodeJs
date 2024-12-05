import {
  createChapterService,
  getAllChapterDataService,
  findOneChapterDataService,
  getPaginatedChapterData,
  countChapters,
  deleteChapterByIdService,
} from "../../services/ChapterServices.js";
import {
  findOneUserDataService,
  getAllUsersDataService,
} from "../../services/UserServices.js";

import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

import sendResponse from "../../helpers/sendResponse.js";
import { AccessLevel, ImagesPath, Status } from "../../helpers/Enum.js";
import { configureMulter } from "../../helpers/MulterConfig.js";
import { sanitizeFileName } from "../../helpers/commonFunctions.js";
import getCurrentDateTime from "../../helpers/getCurrentDateTime.js";
import { getAsiaCalcuttaCurrentDateTimeinIsoFormat } from "../../helpers/DateTime.js";

const handleMulterError = (err, res) => {
  console.error("Multer Error:", err.message);
  return sendResponse(res, 500, true, "Multer Error", err.message);
};

const createChapter = async (req, res) => {
  try {
    const fieldsConfig = [{ name: "ChapterLogoImage", maxCount: 1 }];
    const upload = configureMulter(fieldsConfig);

    upload(req, res, async (err) => {
      if (err) {
        return handleMulterError(err, res);
      }

      console.log("Create Chapter API Called");
      console.log("Req Body Parameters:----->", req.body);

      const { chapter_Name, chapter_Region = "South Asia" } = req.body;

      // Validate Chapter Name
      if (!chapter_Name || !chapter_Name.trim()) {
        return sendResponse(res, 400, true, "Chapter Name is required");
      }

      // Validate Chapter Logo Image
      if (!req.files || !req.files.ChapterLogoImage) {
        return sendResponse(res, 400, true, "Chapter Logo Image is required");
      }

      const trimmedChapterName = chapter_Name.trim();
      const nameRegex = new RegExp(`^${trimmedChapterName}$`, "i");

      const filterQuery = { chapter_Name: nameRegex };

      // Check if Chapter Name already exists
      const existingChapter = await findOneChapterDataService(filterQuery);
      if (existingChapter) {
        return sendResponse(res, 409, true, "Chapter Name Already Exists");
      }

      // Ensure Chapter Logo Image folder exists
      const chapterLogoImageFolderPath = ImagesPath.ChapterLogoFolderPath;
      if (!fs.existsSync(chapterLogoImageFolderPath)) {
        fs.mkdirSync(chapterLogoImageFolderPath, { recursive: true });
      }

      // Save Chapter Logo Image
      const updatedChapterLogoImageFilename = sanitizeFileName(
        req.files.ChapterLogoImage[0].originalname
      );
      const chapterLogoImagePath = `${chapterLogoImageFolderPath}${Date.now()}-${updatedChapterLogoImageFilename}`;

      try {
        fs.writeFileSync(
          chapterLogoImagePath,
          req.files.ChapterLogoImage[0].buffer
        );
      } catch (fileError) {
        console.error("Error saving Chapter Logo Image:", fileError);
        return sendResponse(res, 500, true, "Error saving Chapter Logo Image");
      }

      // Prepare Chapter Object
      const chapterObj = {
        _id: uuidv4(),
        chapter_Name: trimmedChapterName,
        chapter_Logo: chapterLogoImagePath,
        chapter_Region,
        createdAt: getCurrentDateTime(),
        filterationDateTime: getAsiaCalcuttaCurrentDateTimeinIsoFormat(),
      };

      // Save Chapter Data
      try {
        const newChapter = await createChapterService(chapterObj);
        return sendResponse(
          res,
          201,
          false,
          "Chapter Created successfully",
          newChapter
        );
      } catch (dbError) {
        console.error("Error creating Chapter in database:", dbError);
        return sendResponse(res, 500, true, "Error creating Chapter");
      }
    });
  } catch (error) {
    console.error("Create Chapter Error:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getAllChapter = async (req, res) => {
  try {
    console.log("Get All Chapter Data API Called");

    const allChaptersData = await getAllChapterDataService({
      status: Status.Active,
    });

    if (!allChaptersData.length) {
      return sendResponse(res, 404, true, "Chapters not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Chapters fetched successfully",
      allChaptersData
    );
  } catch (error) {
    console.error("Error in fetching Chapters Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getChapterManagerChapters = async (req, res) => {
  try {
    console.log("Get Chapter Managers Chapter Data API Called");
    console.log("Req Body Parameters:----->", req.body);

    const { chapter_manager_id } = req.body;

    if (!chapter_manager_id) {
      return sendResponse(res, 404, true, "Chapter Manager Id not Provided");
    }

    const chapterManagerDetails = await findOneUserDataService({
      _id: chapter_manager_id,
      status: Status.Active,
      accessLevel: AccessLevel.ChapterManager,
    });

    if (!chapterManagerDetails) {
      return sendResponse(res, 404, true, "Chapter Manager not found");
    }

    const assignedChapters = chapterManagerDetails._doc.Chapters;

    const chapterIds = [
      ...new Set(assignedChapters.map((data) => data.chapter_id)),
    ];

    const allChaptersData = await getAllChapterDataService({
      status: Status.Active,
      _id: { $in: chapterIds },
    });

    if (!allChaptersData.length) {
      return sendResponse(res, 404, true, "Chapters not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Chapters fetched successfully",
      allChaptersData
    );
  } catch (error) {
    console.error("Error in fetching Chapters Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getChapterById = async (req, res) => {
  try {
    console.log("Get Chapter By Id Api Called");
    console.log("Chapter Id:-----> " + JSON.stringify(req.body.chapter_id));

    const { chapter_id } = req.body;
    if (!chapter_id) {
      return sendResponse(res, 404, true, "Chapter Id not Provided");
    }

    const ChapterDetails = await findOneChapterDataService({
      _id: chapter_id,
      status: Status.Active,
    });

    if (!ChapterDetails) {
      return sendResponse(res, 404, true, "Chapter Details not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Chapter Details fetched successfully",
      ChapterDetails
    );
  } catch (error) {
    console.error("Get Chapter By Id Error:", error.message);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const updateChapter = async (req, res) => {
  try {
    console.log("Update Chapter Details By Id Api Called");
    console.log("Req Body Parameters:-----> " + JSON.stringify(req.body));

    let { chapter_Name, chapter_Region, chapter_id } = req.body;

    chapter_Name = chapter_Name ? chapter_Name.trim() : null;
    chapter_Region = chapter_Region ? chapter_Region.trim() : null;

    const chapterExists = await findOneChapterDataService({
      _id: chapter_id,
      status: Status.Active,
    });
    if (!chapterExists) {
      return sendResponse(res, 404, true, "Chapter not found");
    }

    if (chapter_Name) {
      const filterQuery = {
        _id: { $ne: chapter_id },
        chapter_Name: { $regex: new RegExp("^" + chapter_Name + "$", "i") },
      };

      const existingChapterName = await findOneChapterDataService(filterQuery);

      if (existingChapterName) {
        return sendResponse(res, 409, true, "Chapter Name Already Exists");
      }

      chapterExists.chapter_Name = chapter_Name;
    }

    await chapterExists.save();
    return sendResponse(
      res,
      200,
      false,
      "Chapter updated successfully",
      chapterExists
    );
  } catch (error) {
    console.error("Update Chapter Error:", error.message);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const deleteChapter = async (req, res) => {
  try {
    const { chapter_id } = req.body;

    if (!chapter_id) {
      return sendResponse(res, 400, true, "Chapter ID not provided");
    }

    console.log("Delete Chapter API Called");
    console.log("Chapter ID: ----->", chapter_id);

    // Fetch Chapter Data
    const chapterData = await findOneChapterDataService({
      _id: chapter_id,
      status: Status.Active,
    });

    if (!chapterData) {
      return sendResponse(res, 404, true, "Chapter not found");
    }

    const userFilterQuery = {
      "Chapters.chapter_id": chapter_id,
      status: Status.Active,
    };

    const chapterUsersData = await getAllUsersDataService(userFilterQuery);

    if (chapterUsersData.length > 0) {
      return sendResponse(
        res,
        404,
        true,
        `Users are associated with the ${chapterData._doc.chapter_Name}`
      );
    }

    const chapterLogoImagePath = chapterData.chapter_Logo;

    // Remove Chapter Logo Image
    try {
      if (fs.existsSync(chapterLogoImagePath)) {
        fs.unlinkSync(chapterLogoImagePath);
      }
    } catch (fileError) {
      console.error("Error deleting Chapter Logo Image:", fileError);
      return sendResponse(res, 500, true, "Error deleting Chapter Logo Image");
    }

    // Delete Chapter from Database
    try {
      const deleteQuery = { _id: chapter_id };
      const result = await deleteChapterByIdService(deleteQuery);

      if (result.deletedCount == 1) {
        return sendResponse(res, 200, false, "Chapter deleted successfully");
      } else {
        return sendResponse(res, 409, true, "Failed to delete Chapter");
      }
    } catch (dbError) {
      console.error("Error deleting Chapter from database:", dbError);
      return sendResponse(res, 500, true, "Error deleting Chapter");
    }
  } catch (error) {
    console.error("Delete Chapter Error:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getPaginatedChaptersData = async (req, res) => {
  try {
    console.log("Get All Chapter API Called");
    console.log("Req Body Parameters:-----> " + JSON.stringify(req.body));

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    const ChapterData = await getPaginatedChapterData(
      {
        status: Status.Active,
      },
      limit,
      skip
    );

    if (!ChapterData.length) {
      return sendResponse(res, 404, true, "Chapter not found");
    }

    const totalChapters = await countChapters({});

    return sendResponse(res, 200, false, "Chapters fetched successfully", {
      totalPages: Math.ceil(totalChapters / limit),
      currentPage: page,
      totalChapters,
      ChapterData: ChapterData,
    });
  } catch (error) {
    console.error("Error in fetching Chapter Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

export {
  createChapter,
  getAllChapter,
  getChapterManagerChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  getPaginatedChaptersData,
};
