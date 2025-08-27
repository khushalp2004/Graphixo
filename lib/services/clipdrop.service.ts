export class ClipDropService {
  private static instance: ClipDropService;

  private constructor() {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) {
      throw new Error('ClipDrop API key not found. Please set CLIPDROP_API_KEY in your environment variables.');
    }
  }

  public static getInstance(): ClipDropService {
    if (!ClipDropService.instance) {
      ClipDropService.instance = new ClipDropService();
    }
    return ClipDropService.instance;
  }

  public async textToImage(prompt: string): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
  }> {
    try {
      const apiKey= process.env.CLIPDROP_API_KEY;
      console.log("Sending request to ClipDrop API with prompt:", prompt); // Log the prompt

      const formData = new FormData();
      formData.append('prompt', prompt);

      const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey!
        },
        body: formData
      });

      if (response.ok) {
        // ClipDrop API returns binary image data directly
        const imageBuffer = await response.arrayBuffer();
        // Convert buffer to base64 data URL
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;
        
        return {
          success: true,
          imageUrl: imageUrl
        };
      } else {
        // Try to get error message from response
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        console.log("Response Status:", response.status);
        throw new Error(`ClipDrop API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
