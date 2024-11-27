import { Chapters } from "../models/AllModels.js";

const createChapterService = async (ChapterData) => {
  try {
    const newChapter = new Chapters(ChapterData);
    await newChapter.save();
    return newChapter;
  } catch (error) {
    console.error("Error creating chapter:", error);
    throw new Error("Failed to create chapter");
  }
};

const getAllChapterDataService = async (filterquery) => {
  try {
    const ChaptersData = await Chapters.find(filterquery);
    return ChaptersData;
  } catch (error) {
    console.error("Error finding fetching chapter Data:", error);
    throw new Error("Failed to Finding fetching chapter Data");
  }
};

const fetchChapterDetailsFromDbService = async (chapterIds) => {
  const FetchChapterDetails = await Promise.all(
    categoryIds.map(async (data) => {
      const isChapterExists = await Chapters.findOne({
        _id: data.chapter_id,
      });
      return !isChapterExists ? data : null;
    })
  );
  const notFoundChapters = FetchChapterDetails.filter((data) => data !== null);
  return notFoundChapters;
};

const findOneChapterDataService = async (filterquery) => {
  try {
    const ChapterData = await Chapters.findOne(filterquery);
    return ChapterData;
  } catch (error) {
    console.error("Error finding One Chapter Data:", error);
    throw new Error("Failed to Finding One Chapter Data");
  }
};

const updateChapterDataService = async (filterquery, updateQuery) => {
  try {
    const ChapterData = await Chapters.findByIdAndUpdate(
      filterquery,
      updateQuery
    );
    return ChapterData;
  } catch (error) {
    console.error("Error finding fetching chapter Data:", error);
    throw new Error("Failed to Finding fetching chapter Data");
  }
};

const deleteChapterByIdService = async (filterQuery) => {
  try {
    const result = await Chapters.deleteOne(filterQuery);
    return result;
  } catch (error) {
    console.error("Error deleting chapter Data by Id:", error);
    throw new Error("Failed to deleting chapter Data by Id");
  }
};

const getPaginatedChapterData = async (filterQuery, limit, skip) => {
  try {
    return await Chapters.find(filterQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  } catch (error) {
    console.error("Error in fetching paginated Chapters Data:", error);
    throw error;
  }
};

const countChapters = async (filterQuery) => {
  try {
    return await Chapters.countDocuments(filterQuery);
  } catch (error) {
    console.error("Error in counting Chapters Data:", error);
    throw error;
  }
};

export {
  createChapterService,
  getAllChapterDataService,
  fetchChapterDetailsFromDbService,
  findOneChapterDataService,
  updateChapterDataService,
  deleteChapterByIdService,
  getPaginatedChapterData,
  countChapters,
};
