import { Users } from "../models/AllModels.js";

const createUserService = async (UserData) => {
  try {
    const newUser = new Users(UserData);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

const getAllUsersDataService = async (filterquery) => {
  try {
    const UsersData = await Users.find(filterquery);
    return UsersData;
  } catch (error) {
    console.error("Error finding fetching Users Data:", error);
    throw new Error("Failed to Finding fetching Users Data");
  }
};

const findOneUserDataService = async (filterquery) => {
  try {
    const UsersData = await Users.findOne(filterquery);
    return UsersData;
  } catch (error) {
    console.error("Error finding One User Data:", error);
    throw new Error("Failed to Finding One User Data");
  }
};

const updateUserDataService = async (filterquery, updateQuery) => {
  try {
    const UserData = await Users.findByIdAndUpdate(filterquery, updateQuery);
    return UserData;
  } catch (error) {
    console.error("Error finding fetching User Data:", error);
    throw new Error("Failed to Finding fetching User Data");
  }
};

const deleteUserByIdService = async (filterQuery) => {
  try {
    const result = await Users.deleteOne(filterQuery);
    return result;
  } catch (error) {
    console.error("Error deleting User Data by Id:", error);
    throw new Error("Failed to deleting User Data by Id");
  }
};

const getPaginatedUserData = async (filterQuery, limit, skip) => {
  try {
    return await Users.find(filterQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  } catch (error) {
    console.error("Error in fetching paginated Users Data:", error);
    throw error;
  }
};

const countUsers = async (filterQuery) => {
  try {
    return await Users.countDocuments(filterQuery);
  } catch (error) {
    console.error("Error in counting Users Data:", error);
    throw error;
  }
};

export {
  createUserService,
  getAllUsersDataService,
  findOneUserDataService,
  updateUserDataService,
  deleteUserByIdService,
  getPaginatedUserData,
  countUsers,
};
