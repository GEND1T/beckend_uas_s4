import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * 
 * @param fileBuffer The buffer of the file to upload
 * @param folderName The folder name in Cloudinary to store the image in
 * @returns Object containing the secure_url and public_id of the uploaded image
 */
export const uploadImage = (
  fileBuffer: Buffer,
  folderName: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload returned undefined result'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts public_id from a Cloudinary URL and deletes the asset from Cloudinary.
 * 
 * @param imageUrl The full secure URL of the image
 * @returns Result of the Cloudinary destroy operation
 */
export const deleteImage = async (imageUrl: string): Promise<any> => {
  try {
    if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
      return null;
    }
    
    // Cloudinary URL format:
    // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
    const parts = imageUrl.split('/image/upload/');
    if (parts.length < 2) return null;
    
    const pathWithVersion = parts[1];
    const pathParts = pathWithVersion.split('/');
    
    // Remove version segment (e.g. v1720892010) if present
    if (pathParts[0].startsWith('v') && /^\d+$/.test(pathParts[0].substring(1))) {
      pathParts.shift();
    }
    
    const fullPathWithExt = pathParts.join('/');
    
    // Remove the file extension
    const dotIndex = fullPathWithExt.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? fullPathWithExt.substring(0, dotIndex) : fullPathWithExt;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`[Cloudinary Utility] Failed to delete image: ${imageUrl}`, error);
    throw error;
  }
};
