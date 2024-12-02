import {
  createUserService,
  getAllUsersDataService,
  findOneUserDataService,
  deleteUserByIdService,
  getPaginatedUserData,
  countUsers,
} from "../../services/UserServices.js";
import { fetchChapterDetailsFromDbService } from "../../services/ChapterServices.js";

import { v4 as uuidv4 } from "uuid";
const saltRounds = 10;
import bcrypt from "bcrypt";
import ExcelJS from "exceljs";

import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

import generateAuthToken from "../../helpers/auth.js";
import sendResponse from "../../helpers/sendResponse.js";
import { encrypt } from "../../helpers/encryptionUtils.js";
import { generateQRCode } from "../../helpers/commonFunctions.js";
import getCurrentDateTime from "../../helpers/getCurrentDateTime.js";
import { AccessLevel, Status, ServerBase_Url } from "../../helpers/Enum.js";
import { getAsiaCalcuttaCurrentDateTimeinIsoFormat } from "../../helpers/DateTime.js";

const createUser = async (req, res) => {
  try {
    console.log("Create User API Called");
    console.log("Req Body Parameters:----->", req.body);

    const {
      member_id,
      accessLevel,
      Chapters,
      userName,
      region = "South Asia",
      created_userid,
    } = req.body;

    if (!member_id) {
      return sendResponse(res, 400, true, "MemberID is required");
    }

    if (!accessLevel || !Object.values(AccessLevel).includes(accessLevel)) {
      return sendResponse(res, 400, true, "Invalid or missing Access Level");
    }

    if (!userName) {
      return sendResponse(res, 400, true, "Username is required");
    }

    if (Chapters) {
      if (!Array.isArray(Chapters)) {
        return sendResponse(
          res,
          400,
          true,
          "Chapters must be an array of objects"
        );
      }

      const isValidChapters = Chapters.every(
        (chapter) =>
          typeof chapter == "object" &&
          chapter != null &&
          typeof chapter.chapter_id == "string"
      );

      if (!isValidChapters) {
        return sendResponse(
          res,
          400,
          true,
          "Each Chapter must be an object with a 'chapter_id' string"
        );
      }

      const notFoundChapters = await fetchChapterDetailsFromDbService(Chapters);
      if (notFoundChapters.length > 0) {
        return sendResponse(res, 404, true, `Selected Chapter(s) Not Found`);
      }
    }

    let userCreationAccesslevel = AccessLevel.SuperAdmin;

    if (created_userid) {
      const userCreationIDExists = await findOneUserDataService({
        _id: created_userid,
      });

      if (!userCreationIDExists) {
        return sendResponse(res, 404, true, "User Details not found");
      }

      userCreationAccesslevel = userCreationIDExists._doc.accessLevel;
    }

    const trimmedMemberId = member_id.trim();
    const memberIdRegex = new RegExp(`^${trimmedMemberId}$`, "i");

    const trimmedUserName = userName.trim();

    const filterQuery = { member_id: memberIdRegex };

    const existingMember = await findOneUserDataService(filterQuery);
    if (existingMember) {
      return sendResponse(res, 409, true, "MemberId Already Exists");
    }

    const hashedPassword = await bcrypt.hash("1234", saltRounds);

    const UserObj = {
      _id: uuidv4(),
      member_id,
      accessLevel,
      Chapters: Chapters ? Chapters : [],
      userName: trimmedUserName,
      password: hashedPassword,
      region,
      filterationDateTime: getAsiaCalcuttaCurrentDateTimeinIsoFormat(),
      createdAt: getCurrentDateTime(),
      created_userid: created_userid,
      status:
        userCreationAccesslevel == AccessLevel.ChapterManager
          ? Status.UnderApproval
          : Status.Active,
    };

    try {
      const newUser = await createUserService(UserObj);
      return sendResponse(
        res,
        201,
        false,
        "User Created successfully",
        newUser
      );
    } catch (dbError) {
      console.error("Error creating User in database:", dbError);
      return sendResponse(res, 500, true, "Error creating User");
    }
  } catch (error) {
    console.error("Create User Error:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const userLogin = async (req, res) => {
  try {
    console.log("User Login API Called");
    console.log("Req Body Parameters:-----> " + JSON.stringify(req.body));

    const { member_id, password } = req.body;

    if (!member_id) {
      return sendResponse(res, 400, true, "MemberId is required");
    }

    if (!password) {
      return sendResponse(res, 400, true, "Password is required");
    }

    const trimmedMemberId = member_id.trim();
    const trimmedPassword = password.trim();

    const memberIdRegex = new RegExp("^" + trimmedMemberId + "$", "i");

    const filterQuery = {
      member_id: memberIdRegex,
      status: Status.Active,
    };

    const isMemberIdUserExists = await findOneUserDataService(filterQuery);

    if (!isMemberIdUserExists) {
      return sendResponse(res, 409, true, `Invalid MemberId or Password`);
    }

    const passwordMatch = await bcrypt.compare(
      trimmedPassword,
      isMemberIdUserExists.password
    );

    if (!passwordMatch) {
      return sendResponse(res, 409, true, "Invalid MemberId or Password");
    }

    const payload = {
      member_id: isMemberIdUserExists.member_id,
      CurrentTimeStamp: getCurrentDateTime(),
    };

    const token = generateAuthToken({ payload });
    const encryptedToken = encrypt(token);

    const userData = {
      token: encryptedToken,
      Username: isMemberIdUserExists.userName,
      user_id: isMemberIdUserExists._id,
      Role: isMemberIdUserExists.accessLevel,
    };

    return sendResponse(res, 200, false, "Login successfully", userData);
  } catch (error) {
    console.error("User Login Error:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const updateUserName = async (req, res) => {
  try {
    console.log("Update User Details By Id Api Called");
    console.log("Req Body Parameters:-----> " + JSON.stringify(req.body));

    let { userName, user_id } = req.body;

    if (!user_id) {
      return sendResponse(res, 400, true, " UserId is required");
    }

    userName = userName ? userName.trim() : null;

    const userExists = await findOneUserDataService({
      _id: user_id,
      status: Status.Active,
    });
    if (!userExists) {
      return sendResponse(res, 404, true, "User not found");
    }

    if (userName) {
      userExists.userName = userName;
    }

    await userExists.save();
    return sendResponse(
      res,
      200,
      false,
      "User updated successfully",
      userExists
    );
  } catch (error) {
    console.error("Update User Error:", error.message);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getAllSuperAdmins = async (req, res) => {
  try {
    console.log("Get All SuperAdmins Data API Called");

    const superAdminsData = await getAllUsersDataService({
      accessLevel: AccessLevel.SuperAdmin,
    });

    if (!superAdminsData.length) {
      return sendResponse(res, 404, true, "SuperAdmins not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "SuperAdmins fetched successfully",
      superAdminsData
    );
  } catch (error) {
    console.error("Error in fetching Users Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const downloadUserData = async (req, res) => {
  try {
    console.log("Download Users Data API Called");
    console.log("Req Body Parameters:-----> ", req.body);

    const usersData = await getAllUsersDataService({ status: Status.Active });

    if (!usersData || usersData.length === 0) {
      console.error(`No Users found.`);
      return res.status(404).json({ message: "No Users found." });
    }

    const formattedUserData = usersData.map((data) => {
      const accessLevelKey = Object.keys(AccessLevel).find(
        (key) => AccessLevel[key] == data._doc.accessLevel
      );

      return {
        MemberId: data._doc.member_id,
        Username: data._doc.userName,
        Type: accessLevelKey || data._doc.accessLevel,
      };
    });

    // Create Excel Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("YPO SouthAsia Users Data");

    worksheet.columns = [
      { header: "MemberId", key: "MemberId" },
      { header: "Username", key: "Username" },
      { header: "Type", key: "Type" },
    ];

    // Add rows to the worksheet
    worksheet.addRows(formattedUserData);

    // Set headers and send file as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=YpoSouthAsiaUsers.xlsx"
    );

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end(); // Explicit end of response
  } catch (error) {
    console.error("Error in fetching Users Data for download:", {
      errorMessage: error.message,
      stack: error.stack,
      requestData: req.body,
    });
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllMembers = async (req, res) => {
  try {
    console.log("Get All Members Data API Called");

    const membersData = await getAllUsersDataService({
      accessLevel: AccessLevel.Member,
    });

    if (!membersData.length) {
      return sendResponse(res, 404, true, "Members not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Members fetched successfully",
      membersData
    );
  } catch (error) {
    console.error("Error in fetching Members Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getAllSpousePartners = async (req, res) => {
  try {
    console.log("Get All SpousePartners Data API Called");

    const spousePartnersData = await getAllUsersDataService({
      accessLevel: AccessLevel["Spouse/Partner"],
    });

    if (!spousePartnersData.length) {
      return sendResponse(res, 404, true, "Spouse/Partners not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Spouse/Partners fetched successfully",
      spousePartnersData
    );
  } catch (error) {
    console.error("Error in fetching Spouse/Partners Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getAllChapterManagers = async (req, res) => {
  try {
    console.log("Get All ChapterManagers Data API Called");

    const chapterManagersData = await getAllUsersDataService({
      accessLevel: AccessLevel.ChapterManager,
    });

    if (!chapterManagersData.length) {
      return sendResponse(res, 404, true, "Chapter Managers not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Chapter Managers fetched successfully",
      chapterManagersData
    );
  } catch (error) {
    console.error("Error in fetching Chapter Managers Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return sendResponse(res, 400, true, "User ID not provided");
    }

    console.log("Delete User API Called");
    console.log("User ID: ----->", user_id);

    const userData = await findOneUserDataService({ _id: user_id });

    if (!userData) {
      return sendResponse(res, 404, true, "User not found");
    }

    try {
      const deleteQuery = { _id: user_id };
      const result = await deleteUserByIdService(deleteQuery);

      if (result.deletedCount === 1) {
        return sendResponse(res, 200, false, "User deleted successfully");
      } else {
        return sendResponse(res, 409, true, "Failed to delete User");
      }
    } catch (dbError) {
      console.error("Error deleting User from database:", dbError);
      return sendResponse(res, 500, true, "Error deleting User");
    }
  } catch (error) {
    console.error("Delete User Error:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const renderUserCard = async (req, res) => {
  try {
    console.log("Render User User API Called");
    console.log("Req Body Parameters:-----> " + JSON.stringify(req.params));

    const user_id = req.params.user_id;

    if (!user_id) {
      return res.status(404).render("InvalidUserId");
    }

    const UserDetails = await findOneUserDataService({ _id: user_id });

    if (!UserDetails) {
      return res.status(404).render("UserCard");
    }

    const qrCodeUrl = await generateQRCode(
      `${ServerBase_Url}/user/rndcard/${user_id}`
    );

    res.render("SuperAdminCard", {
      logoUrl: `${ServerBase_Url}/Assets/YpoCardLogo.png`,
      username: UserDetails._doc.userName,
      member_id: UserDetails._doc.member_id,
      Alias: UserDetails._doc.Alias,
      qrCodeUrl: qrCodeUrl,
    });
  } catch (error) {
    console.error("Error in fetching Rendering SuperAdmin Card:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

export {
  createUser,
  userLogin,
  updateUserName,
  getAllSuperAdmins,
  downloadUserData,
  getAllMembers,
  getAllSpousePartners,
  getAllChapterManagers,
  deleteUser,
  renderUserCard,
};
