import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (typeof window === 'undefined') {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image Base64 encoded image string
 * @param folder Cloudinary folder to upload to
 * @returns Promise with Cloudinary upload result
 */
export async function uploadBase64ToCloudinary(
  base64Image: string, 
  folder: string = 'clipdrop'
): Promise<{
  success: boolean;
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  error?: string;
}> {
  if (typeof window !== 'undefined') {
    throw new Error('Cloudinary upload can only be performed on the server side.');
  }

  try {
    // Remove the data:image/png;base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Data}`,
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { format: 'png' }
        ]
      }
    );

    return {
      success: true,
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Cloudinary upload error'
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId Cloudinary public ID
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (typeof window !== 'undefined') {
    throw new Error('Cloudinary delete can only be performed on the server side.');
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Cloudinary delete error'
    };
  }
}
