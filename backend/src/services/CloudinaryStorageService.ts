import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from '../interfaces/IStorageService';
import { env } from '../config/env';

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryStorageService implements IStorageService {
  /**
   * For Cloudinary with multer-storage-cloudinary, the actual upload stream 
   * is handled by the Multer storage engine. The file object passed from Multer
   * will contain the Cloudinary URL.
   * 
   * @param url The path or URL from Multer (which is already the secure cloudinary url)
   * @returns Resolves to the public URL of the image
   */
  async uploadAvatar(url: Buffer | string): Promise<string> {
    if (typeof url !== 'string') {
      throw new Error('CloudinaryStorageService requires a URL string from Multer.');
    }
    
    // multer-storage-cloudinary provides the full URL in file.path
    return url;
  }
}
