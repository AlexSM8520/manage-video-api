const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/videos/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Validación de tipos de archivo permitidos
function fileFilter(req, file, cb) {
  const allowedMimeTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo no permitido"), false);
  }
  cb(null, true);
}

// Límite de tamaño para archivos de video (50MB)
const limits = {
  fileSize: 50 * 1024 * 1024 // 50MB
};

// Middleware para asegurarse que el request está bien formado y con el nombre de campo correcto
function ensureMultipartField(req, res, next) {
  // Checar si Content-Type es multipart/form-data y si el campo 'video' está en los archivos
  if (!req.is('multipart/form-data')) {
    return res.status(400).json({ status: 400, message: 'Debe enviar datos en formato multipart/form-data' });
  }
  next();
}

// Multer instance for video uploads
const uploadVideo = multer({
  storage,
  limits,
  fileFilter
});

module.exports = {
  uploadVideo,
  ensureMultipartField
};