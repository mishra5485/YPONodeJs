import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  chapter_Name: { type: String, index: true, required: true, unique: true },
  chapter_Logo: { type: String, required: true },
  chapter_Region: { type: String, default: "South Asia" },
  filterationDateTime: { type: Date, required: true },
  createdAt: { type: String, required: true },
  status: { type: Number, required: true, default: 1 },
});

const Chapters = mongoose.model("Chapters", ChapterSchema);

export default Chapters;
