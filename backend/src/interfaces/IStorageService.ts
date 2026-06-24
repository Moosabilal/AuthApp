export interface IStorageService {
  
  uploadAvatar(file: Buffer | string): Promise<string>;
}
