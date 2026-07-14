import multer from 'multer';
import { Request } from 'express';

// Configure memory storage to receive file buffer
const storage = multer.memoryStorage();

// File filter to allow only image files (jpeg, jpg, png, webp)
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed.'));
  }
};

// Initialize multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit image file size to 5MB
  }
});

// Export middleware for a single file upload named 'image'
export const uploadSingle = upload.single('image');
