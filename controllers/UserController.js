import getCurrentDateTime from "../helpers/getCurrentDateTime.js";
import { v4 as uuidv4 } from "uuid";
import sendResponse from "../helpers/sendResponse.js";
import { AccessLevel, Status } from "../helpers/Enum.js";
import {
  createUserService,
  getAllUsersDataService,
  findOneUserDataService,
  deleteUserByIdService,
  getPaginatedUserData,
  countUsers,
} from "../services/UserServices.js";
const saltRounds = 10;
import bcrypt from "bcrypt";
import generateAuthToken from "../helpers/auth.js";
import { encrypt } from "../helpers/encryptionUtils.js";
import { getAsiaCalcuttaCurrentDateTimeinIsoFormat } from "../helpers/DateTime.js";

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

const getAllUser = async (req, res) => {
  try {
    console.log("Get All User Data API Called");

    const allUsersData = await getAllUsersDataService({});

    if (!allUsersData.length) {
      return sendResponse(res, 404, true, "Users not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "Users fetched successfully",
      allUsersData
    );
  } catch (error) {
    console.error("Error in fetching Users Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

const getUserById = async (req, res) => {
  try {
    console.log("Get User By Id Api Called");
    console.log("User Id:-----> " + JSON.stringify(req.body.user_id));

    const { user_id } = req.body;
    if (!user_id) {
      return sendResponse(res, 404, true, "User Id not Provided");
    }

    const UserDetails = await findOneUserDataService({ _id: user_id });

    if (!UserDetails) {
      return sendResponse(res, 404, true, "User Details not found");
    }
    return sendResponse(
      res,
      200,
      false,
      "User Details fetched successfully",
      UserDetails
    );
  } catch (error) {
    console.error("Get User By Id Error:", error.message);
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

const getPaginatedUsersData = async (req, res) => {
  try {
    console.log("Get All User API Called");
    console.log("Req Body Parameters:-----> " + JSON.stringify(req.body));

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    const userData = await getPaginatedUserData({}, limit, skip);

    if (!userData.length) {
      return sendResponse(res, 404, true, "User not found");
    }

    const totalUsers = await countUsers({});

    return sendResponse(res, 200, false, "Users fetched successfully", {
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers: totalUsers,
      usersData: userData,
    });
  } catch (error) {
    console.error("Error in fetching User Data:", error);
    return sendResponse(res, 500, true, "Internal Server Error");
  }
};

export {
  createUser,
  userLogin,
  getAllUser,
  getUserById,
  deleteUser,
  getPaginatedUsersData,
};