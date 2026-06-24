import { IStorageService } from '../interfaces/IStorageService';

export class LocalDiskStorageService implements IStorageService {
  /**
   * For the MVP, Multer handles the actual file stream to disk.
   * This service just formats the public URL based on the filename passed.
   * 
   * @param filename The name of the file saved by Multer
   * @returns Resolves to the public URL of the image
   */
  async uploadAvatar(filename: Buffer | string): Promise<string> {
    if (typeof filename !== 'string') {
      throw new Error('LocalDiskStorageService requires a filename string from Multer.');
    }
    
    // Return the absolute path as served by express.static
    return `/uploads/avatars/${filename}`;
  }
}
