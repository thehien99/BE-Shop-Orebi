const cloudinary = require('cloudinary').v2;
const multer = require("multer");

// Cấu hình Cloudinary với thông tin tài khoản của bạn
cloudinary.config({
  cloud_name: 'dunyq5szl', // Tên cloud của bạn
  api_key: '543933723365274',       // API Key của bạn
  api_secret: 'pieWWj4-7lPnuC8XtO9_gpKj7TE'  // API Secret của bạn
});

const stogare = new multer.memoryStorage()

async function imageUpload(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: 'auto'
  });

  return result
}

const upload = multer({ storage: stogare })

module.exports = {
  imageUpload,
  upload
}
