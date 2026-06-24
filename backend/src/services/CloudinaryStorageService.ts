import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from '../interfaces/IStorageService';
import { env } from '../config/env';


cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryStorageService implements IStorageService {
  
  async uploadAvatar(url: Buffer | string): Promise<string> {
    if (typeof url !== 'string') {
      throw new Error('CloudinaryStorageService requires a URL string from Multer.');
    }
    
    
    return url;
  }
}
