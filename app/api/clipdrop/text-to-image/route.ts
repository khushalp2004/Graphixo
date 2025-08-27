import { NextRequest, NextResponse } from 'next/server';
import { ClipDropService } from '@/lib/services/clipdrop.service';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const service = ClipDropService.getInstance();
    const result = await service.textToImage(prompt);

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('ClipDrop API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
