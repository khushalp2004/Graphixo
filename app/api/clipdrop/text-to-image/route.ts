import { NextRequest, NextResponse } from 'next/server';
import { ClipDropService } from '@/lib/services/clipdrop.service';

export async function POST(request: NextRequest) {
  try {
    const { prompt, uploadToCloudinary = true } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Prompt is required',
          errorCode: 'MISSING_PROMPT'
        },
        { status: 400 }
      );
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Prompt must be a non-empty string',
          errorCode: 'INVALID_PROMPT'
        },
        { status: 400 }
      );
    }

    // Limit prompt length to prevent abuse
    if (prompt.length > 1000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Prompt is too long. Maximum length is 1000 characters.',
          errorCode: 'PROMPT_TOO_LONG'
        },
        { status: 400 }
      );
    }

    const service = ClipDropService.getInstance();
    const result = await service.textToImage(prompt.trim(), uploadToCloudinary);

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        publicId: result.publicId,
        secureUrl: result.secureUrl,
        width: result.width,
        height: result.height,
        prompt: prompt,
        error: result.error, // Include error if Cloudinary upload failed but ClipDrop succeeded
        errorCode: result.errorCode
      });
    } else {
      // Map error codes to appropriate HTTP status codes
      let statusCode = 500;
      
      switch (result.errorCode) {
        case 'INVALID_API_KEY':
          statusCode = 500; // Internal server error since this is a configuration issue
          break;
        case 'RATE_LIMITED':
          statusCode = 429;
          break;
        case 'BAD_REQUEST':
          statusCode = 400;
          break;
        case 'CLIENT_SIDE_ERROR':
          statusCode = 400;
          break;
        default:
          statusCode = 500;
      }

      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          errorCode: result.errorCode
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('Unexpected error in ClipDrop API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
