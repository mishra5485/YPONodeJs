import { ServerBase_Url } from "../config/index.js";

const Status = {
  Active: 1,
  Inactive: 2,
  UnderApproval: 3,
  Rejected: 4,
};

const AccessLevel = {
  SuperAdmin: "1",
  Member: "2",
  "Spouse/Partner": "3",
  ChapterManager: "4",
};

const ImagesPath = {
  ChapterLogoFolderPath: "uploads/ChapterLogos/",
};

export { Status, AccessLevel, ImagesPath, ServerBase_Url };
