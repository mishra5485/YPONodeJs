import QRCode from "qrcode";

const sanitizeFileName = (fileName) => {
  return fileName.replace(/\s+/g, "_");
};

const generateQRCode = async (qrObj) => {
  const qrString = JSON.stringify(qrObj);
  return QRCode.toDataURL(qrString);
};

const MailCCUsers = [
  "smalhotra@ypo.org",
  "htalreja@ypo.org",
  "anushree.ypo@gmail.com",
  "Harshmishra5485@gmail.com",
];

export { sanitizeFileName, generateQRCode, MailCCUsers };
