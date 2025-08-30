"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";
import { AddImageParams, UpdateImageParams } from "@/types";

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
export async function textToImage(imageUrl: string, debugMode: boolean = false) {
  try {
    if (debugMode) {
      console.log('🎨 Starting text-to-image transformation...');
      console.log('📸 Original image URL:', imageUrl);
    }

    // Check if we're in development mode and provide fallback
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Development mode detected - using mock text-to-image');
      
      // In development, return the original image with a slight modification
      // This allows testing without the external API
      if (debugMode) {
        console.log('🎭 Using mock text-to-image for development');
      }
      
      // For now, return original image URL for testing
      // In production, this would use the real API
      return imageUrl;
    }

    // Using free text-to-image API
    const textToImageUrl = `https://cartoonify-api.herokuapp.com/cartoonify?url=${encodeURIComponent(imageUrl)}`;
    
    if (debugMode) {
      console.log('🔗 API URL:', textToImageUrl);
    }

    const response = await fetch(textToImageUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Text-to-image API failed: ${response.status}`);
    }

    const blob = await response.blob();
    
    if (debugMode) {
      console.log('✅ Text-to-image API response received');
      console.log('📊 Response size:', blob.size, 'bytes');
    }

    // Upload to Cloudinary
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'cartoonify',
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as { secure_url: string });
          else reject(new Error('No result from Cloudinary'));
        }
      ).end(buffer);
    });

    if (debugMode) {
      console.log('☁️ Cloudinary upload complete');
      console.log('🌐 Cloudinary URL:', uploadResult.secure_url);
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error('❌ Text-to-image error:', error);
    
    // Enhanced error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// **TEST CARTOONIFY API CONNECTION**
export async function testCartoonifyAPI(debugMode: boolean = false) {
  try {
    if (debugMode) {
      console.log('🔍 Testing cartoonify API connection...');
    }
    
    const testUrl = 'https://cartoonify-api.herokuapp.com/cartoonify?url=https://via.placeholder.com/300x300.png';
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (debugMode) {
      console.log('📊 API Response Status:', response.status);
      console.log('📊 API Response OK:', response.ok);
    }
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('❌ API Test Error:', error);
    return {
      success: false,
      status: 0,
      statusText: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
