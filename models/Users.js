import mongoose from "mongoose";

const ChapterIdsSchema = new mongoose.Schema({
  chapter_id: {
    type: String,
  },
});

const UsersSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  member_id: { type: String, required: true, unique: true, index: true },
  accessLevel: { type: Number, required: true },
  Chapters: [ChapterIdsSchema],
  userName: { type: String },
  password: { type: String },
  region: { type: String, default: "South Asia" },
  Alias: { type: String, default: "Test Alias" },
  filterationDateTime: { type: Date, required: true },
  createdAt: { type: String, required: true },
  status: { type: Number, required: true },
  created_userid: { type: String },
  resetPasswordToken: { type: String, default: undefined },
  resetPasswordExpires: { type: String, default: undefined },
});

const Users = mongoose.model("Users", UsersSchema);

export default Users;
