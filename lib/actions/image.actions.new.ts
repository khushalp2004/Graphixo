"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";
import { AddImageParams, UpdateImageParams } from "@/types";
import GeminiService from "../services/clipdrop.service";

// 🔹 Setup Cloudinary Once
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

// **ADD IMAGE**
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Fetching user with ID:", userId);
    const author = await User.findById(userId);
    if (!author) {
      console.error("❌ User not found:", userId);
      throw new Error("User not found");
    }

    console.log("Creating new image...");
    const newImage = new Image({
      ...image,
      author: author._id,
    });

    console.log("Saving image to database...");
    await newImage.save();
    console.log("✅ Image successfully saved:", newImage);

    try {
      console.log("Revalidating path:", path);
      revalidatePath(path);
    } catch (err) {
      console.error("⚠️ Failed to revalidate path:", err);
    }

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error in addImage:", error.message, error);
    } else {
      console.error("❌ Error in addImage:", error);
    }
    handleError(error);
  }
}

// **UPDATE IMAGE**
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Fetching image with ID:", image._id);
    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate) {
      console.error("❌ Image not found:", image._id);
      throw new Error("Image not found");
    }

    if (imageToUpdate.author.toString() !== userId) {
      console.error("❌ Unauthorized update attempt by user:", userId);
      throw new Error("Unauthorized action");
    }

    console.log("Updating image...");
    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );

    console.log("✅ Image successfully updated:", updatedImage);
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error in updateImage:", error.message, error);
    } else {
      console.error("❌ Error in updateImage:", error);
    }
    handleError(error);
  }
}

// **DELETE IMAGE**
export async function deleteImage(imageId: string) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Deleting image with ID:", imageId);
    const deletedImage = await Image.findByIdAndDelete(imageId);

    if (!deletedImage) {
      console.error("❌ Image not found:", imageId);
      throw new Error("Image not found");
    }

    console.log("✅ Image deleted successfully:", deletedImage);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error in deleteImage:", error.message, error);
    } else {
      console.error("❌ Error in deleteImage:", error);
    }
    handleError(error);
  } finally {
    console.log("Redirecting to homepage...");
    redirect("/");
  }
}

// **GET IMAGE BY ID**
export async function getImageById(imageId: string) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Fetching image with ID:", imageId);
    const image = await populateUser(Image.findById(imageId).lean());

    if (!image) {
      console.error("❌ Image not found:", imageId);
      throw new Error("Image not found");
    }

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error in getImageById:", error.message, error);
    } else {
      console.error("❌ Error in getImageById:", error);
    }
    handleError(error);
  }
}

// **GET ALL IMAGES**
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    let query = {};
    if (searchQuery) {
      query = { 
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { transformationType: { $regex: searchQuery, $options: 'i' } },
          { publicId: { $regex: searchQuery, $options: 'i' } },
          { prompt: { $regex: searchQuery, $options: 'i' } },
          { color: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const skipAmount = (Number(page) - 1) * limit;
    console.log("Fetching images from database...");
    const images = await populateUser(Image.find(query).sort({ updatedAt: -1 }).skip(skipAmount).limit(limit).lean());

    const totalImages = await Image.countDocuments(query);
    const savedImages = await Image.countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error in getAllImages:", error.message, error);
    } else {
      console.error("❌ Error in getAllImages:", error);
    }
    handleError(error);
  }
}

// **GET IMAGES BY USER**
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  userId: string;
  searchQuery?: string;
}) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    // First find the user by their Clerk ID
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      console.error("❌ User not found with Clerk ID:", userId);
      return {
        data: [],
        totalPages: 0,
      };
    }

    const skipAmount = (Number(page) - 1) * limit;
    console.log("Fetching images for user:", user._id);

    type MongoQuery = {
      author: any;
      $and?: Array<{
        author: any;
        $or?: Array<{
          [key: string]: { $regex: string; $options: string };
        }>;
      }>;
    };

    const query: MongoQuery = { author: user._id };
    if (searchQuery) {
      query.$and = [
        {
          author: user._id,
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { transformationType: { $regex: searchQuery, $options: 'i' } },
            { prompt: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ];
    }

    // Fetch all images for the user
    const images = await populateUser(
      Image.find(query)
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit)
      .lean()
    );

    const totalImages = await Image.countDocuments(query);

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error in getUserImages:", error.message, error);
    } else {
      console.error("❌ Error in getUserImages:", error);
    }
    handleError(error);
  }
}

// **CARTOONIFY IMAGE TRANSFORMATION**
export async function cartoonifyImage(imageUrl: string, debugMode: boolean = false) {
  try {
    if (debugMode) {
      console.log('🎨 Starting enhanced cartoonify transformation...');
      console.log('📸 Original image URL:', imageUrl);
    }

    // Force real transformation regardless of environment
    const useRealTransformation = true;
    
    if (useRealTransformation) {
      // Use Gemini API for actual transformation
      const result = await GeminiService.cartoonifyImage(imageUrl, debugMode);
      
      if (result.success && result.imageUrl) {
        if (debugMode) {
          console.log('✅ Gemini cartoonify successful');
          console.log('⏱️ Processing time:', result.processingTime, 'ms');
        }
        return result.imageUrl;
      }
    }

    // Enhanced Cloudinary transformation with visible effects
    const enhancedCartoonUrl = imageUrl.replace(
      '/upload/',
      '/upload/e_cartoonify:80:100/e_saturation:180/e_contrast:150/e_vibrance:50/e_brightness:10/'
    );

    if (debugMode) {
      console.log('🎭 Enhanced Cloudinary cartoonify URL:', enhancedCartoonUrl);
    }

    return enhancedCartoonUrl;

  } catch (error) {
    console.error('❌ Cartoonify error:', error);
    
    // Enhanced error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Final fallback with guaranteed visible changes
    const finalFallback = imageUrl.replace(
      '/upload/',
      '/upload/e_cartoonify:100:100/e_saturation:200/e_contrast:200/e_brightness:20/'
    );
    
    return finalFallback;
  }
}

// **TEST CARTOONIFY API CONNECTION**
export async function testCartoonifyAPI(debugMode: boolean = false) {
  try {
    if (debugMode) {
      console.log('🔍 Testing Gemini API connection...');
    }

    // Test Gemini API connection
    const geminiTest = await GeminiService.testConnection(debugMode);
    
    const results = [
      {
        endpoint: 'Gemini API',
        success: geminiTest.success,
        status: geminiTest.success ? 200 : 500,
        statusText: geminiTest.message
      }
    ];

    if (debugMode) {
      console.log(`📊 Gemini API: ${geminiTest.success ? '✅ Connected' : '❌ Failed'}`);
    }

    return {
      results,
      fallbackAvailable: true,
      cloudinaryEffects: true,
      geminiAvailable: geminiTest.success
    };
  } catch (error) {
    console.error('❌ Gemini API Test Error:', error);
    return {
      results: [],
      fallbackAvailable: true,
      cloudinaryEffects: true,
      geminiAvailable: false
    };
  }
}
