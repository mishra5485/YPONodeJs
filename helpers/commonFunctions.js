import QRCode from "qrcode";

const sanitizeFileName = (fileName) => {
  return fileName.replace(/\s+/g, "_");
};

const generateQRCode = async (qrObj) => {
  const qrString = JSON.stringify(qrObj);
  return QRCode.toDataURL(qrString);
};

export { sanitizeFileName, generateQRCode };
