const cloudinary = require('../config/cloudinary');

/**
 * Uploads a buffer to Cloudinary via its upload_stream API.
 * @param {Buffer} buffer
 * @param {object} options - cloudinary upload options (folder, resource_type, etc.)
 */
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer };
