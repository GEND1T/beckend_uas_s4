import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env
dotenv.config();

// Validate environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Error: Cloudinary credentials are not fully configured in your .env file.');
  console.error('Please make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.');
  process.exit(1);
}

// Initialize Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

// Initialize Prisma Client
const prisma = new PrismaClient();

// Target directory containing product images
const IMAGE_DIR = path.resolve(process.cwd(), './assets/products');

// Allowed image extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

async function main() {
  console.log('==================================================');
  console.log('Starting Cloudinary Product Image Upload Script');
  console.log(`Target Directory: ${IMAGE_DIR}`);
  console.log('==================================================\n');

  // Check if directory exists
  if (!fs.existsSync(IMAGE_DIR)) {
    console.error(`Error: Directory not found at: ${IMAGE_DIR}`);
    console.error('Please create this directory and place your product images inside.');
    console.error('Filenames should correspond to the product ID, e.g., "1.jpg", "12.png".\n');
    process.exit(1);
  }

  // Read files from the directory
  let files: string[];
  try {
    files = await fs.promises.readdir(IMAGE_DIR);
  } catch (error) {
    console.error('Error reading the directory:', error);
    process.exit(1);
  }

  // Filter image files
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('No supported image files found in the directory.');
    console.log(`Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) to process.\n`);

  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  for (const file of imageFiles) {
    const filePath = path.join(IMAGE_DIR, file);
    const fileNameWithoutExt = path.parse(file).name;
    const productId = parseInt(fileNameWithoutExt, 10);

    // Verify file name represents a valid ID (numeric)
    if (isNaN(productId) || productId.toString() !== fileNameWithoutExt) {
      console.warn(`[SKIPPED] "${file}" - Filename is not a valid integer product ID.`);
      skippedCount++;
      continue;
    }

    try {
      console.log(`[PROCESSING] ID ${productId}: Checking product in database...`);

      // Check if product exists in database
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        console.warn(`[SKIPPED] ID ${productId}: Product does not exist in the database (file: "${file}").`);
        skippedCount++;
        continue;
      }

      console.log(`[UPLOADING] ID ${productId}: Uploading "${file}" to Cloudinary (folder: "spk_laptops")...`);
      
      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(filePath, {
        folder: 'spk_laptops',
        public_id: `product_${productId}`, // naming scheme in Cloudinary
        overwrite: true,
        invalidate: true
      });

      const secureUrl = uploadResponse.secure_url;
      console.log(`[UPLOADED] ID ${productId}: Success. Cloudinary URL: ${secureUrl}`);

      // Update database record
      console.log(`[DATABASE] ID ${productId}: Updating imageUrl in database...`);
      await prisma.product.update({
        where: { id: productId },
        data: { imageUrl: secureUrl }
      });

      console.log(`[SUCCESS] ID ${productId}: Database updated successfully!\n`);
      successCount++;
    } catch (error: any) {
      console.error(`[ERROR] ID ${productId}: Failed to process image "${file}".`);
      console.error(`Details: ${error.message || error}\n`);
      failureCount++;
    }
  }

  console.log('==================================================');
  console.log('Upload Process Completed');
  console.log(`Total Processed: ${imageFiles.length}`);
  console.log(`Successful:      ${successCount}`);
  console.log(`Skipped:         ${skippedCount}`);
  console.log(`Failed:          ${failureCount}`);
  console.log('==================================================');
}

main()
  .catch(err => {
    console.error('Fatal execution error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
