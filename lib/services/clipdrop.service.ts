// Only import cloudinary utilities on server side
let cloudinaryUtils: any = null;
if (typeof window === 'undefined') {
  cloudinaryUtils = require('@/lib/utils/cloudinary');
}

// Import cache utility
let imageCache: any = null;
if (typeof window === 'undefined') {
  imageCache = require('@/lib/utils/cache').imageCache;
}

export class ClipDropService {
  private static instance: ClipDropService;

  private constructor() {
    // Only check API key on server side
    if (typeof window === 'undefined') {
      const apiKey = process.env.CLIPDROP_API_KEY;
      if (!apiKey) {
         throw new Error('ClipDrop API key not found. Please set CLIPDROP_API_KEY in your environment variables.');
      }
    }
  }

  public static getInstance(): ClipDropService {
    if (!ClipDropService.instance) {
      ClipDropService.instance = new ClipDropService();
    }
    return ClipDropService.instance;
  }

  public async textToImage(prompt: string, uploadToCloudinary: boolean = true): Promise<{
    success: boolean;
    imageUrl?: string;
    publicId?: string;
    secureUrl?: string;
    width?: number;
    height?: number;
    error?: string;
    errorCode?: string;
  }> {
    try {
      // Check if we're on the client side (where API key is not available)
      if (typeof window !== 'undefined') {
        return {
          success: false,
          error: 'ClipDrop API is only available on the server side. Please use the API route instead.',
          errorCode: 'CLIENT_SIDE_ERROR'
        };
      }

      const apiKey = process.env.CLIPDROP_API_KEY;
      if (!apiKey) {
        throw new Error('ClipDrop API key not found. Please set CLIPDROP_API_KEY in your environment variables.');
      }

      // Check cache first
      const cachedImageUrl = imageCache ? imageCache.get(prompt) : null;
      if (cachedImageUrl) {
        console.log("Cache hit for prompt:", prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''));
        return {
          success: true,
          imageUrl: cachedImageUrl,
          errorCode: 'CACHE_HIT'
        };
      }

      console.log("Cache miss. Sending request to ClipDrop API with prompt:", prompt);

      const formData = new FormData();
      formData.append('prompt', prompt);

      const startTime = Date.now();
      const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey!
        },
        body: formData
      });

      const responseTime = Date.now() - startTime;
      console.log(`ClipDrop API response time: ${responseTime}ms`);

      if (response.ok) {
        // ClipDrop API returns binary image data directly
        const imageBuffer = await response.arrayBuffer();
        // Convert buffer to base64 data URL
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;
        
        if (uploadToCloudinary && cloudinaryUtils) {
          try {
            // Upload to Cloudinary
            const uploadResult = await cloudinaryUtils.uploadBase64ToCloudinary(imageUrl, 'clipdrop');
            
            if (uploadResult.success) {
              console.log(`Successfully generated and uploaded image for prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
              return {
                success: true,
                imageUrl: imageUrl, // Keep base64 for immediate display
                publicId: uploadResult.public_id,
                secureUrl: uploadResult.secure_url,
                width: uploadResult.width,
                height: uploadResult.height
              };
            } else {
              console.error('Cloudinary upload failed:', uploadResult.error);
              // Fallback to base64 if Cloudinary upload fails
              return {
                success: true,
                imageUrl: imageUrl,
                error: uploadResult.error,
                errorCode: 'CLOUDINARY_UPLOAD_FAILED'
              };
            }
          } catch (error) {
            console.error('Cloudinary upload error:', error);
            // Fallback to base64 if Cloudinary upload fails
            return {
              success: true,
              imageUrl: imageUrl,
              error: error instanceof Error ? error.message : 'Cloudinary upload failed',
              errorCode: 'CLOUDINARY_ERROR'
            };
          }
        }
        
        console.log(`Successfully generated image for prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
        
        // Store in cache for future requests
        if (imageCache) {
          imageCache.set(prompt, imageUrl);
          console.log("Image cached for prompt:", prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''));
        }
        
        return {
          success: true,
          imageUrl: imageUrl
        };
      } else {
        // Try to get error message from response
        const errorText = await response.text();
        console.error("ClipDrop API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          prompt: prompt.substring(0, 100),
          responseTime: responseTime + 'ms'
        });
        
        let errorCode = 'API_ERROR';
        let errorMessage = `ClipDrop API error: ${response.status} - ${errorText}`;
        
        // Handle specific error codes
        if (response.status === 401) {
          errorCode = 'INVALID_API_KEY';
          errorMessage = 'Invalid ClipDrop API key. Please check your API credentials.';
        } else if (response.status === 429) {
          errorCode = 'RATE_LIMITED';
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status === 400) {
          errorCode = 'BAD_REQUEST';
          errorMessage = 'Invalid request. Please check your prompt and try again.';
        }
        
        return {
          success: false,
          error: errorMessage,
          errorCode: errorCode
        };
      }
    } catch (error) {
      console.error('Unexpected error in textToImage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        errorCode: 'UNEXPECTED_ERROR'
      };
    }
  }
}
