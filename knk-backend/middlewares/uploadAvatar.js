const multer = require("multer");

const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary =
  require("../config/cloudinary");

const storage =
  new CloudinaryStorage({
    cloudinary,

    params: async (
      req,
      file
    ) => ({
      folder: "knk-avatars",

      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],

      public_id:
        `avatar-${Date.now()}`,
    }),
  });

const uploadAvatar = multer({
  storage,

  limits: {
    fileSize:
      2 * 1024 * 1024,
  },
});

module.exports = uploadAvatar;