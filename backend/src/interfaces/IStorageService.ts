export interface IStorageService {
  /**
   * Uploads an avatar image and returns the public URL.
   * For the MVP, this might just accept a URL string and pass it through,
   * but the contract allows swapping in S3 or Cloudinary later without changing business logic.
   * @param file Local file buffer, file path, or an image URL string
   * @returns Resolves to the public, absolute URL of the uploaded image
   */
  uploadAvatar(file: Buffer | string): Promise<string>;
}
