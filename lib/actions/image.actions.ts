"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

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
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    console.log("Fetching images for user:", userId);

    const images = await populateUser(Image.find({ author: userId }).sort({ updatedAt: -1 }).skip(skipAmount).limit(limit).lean());

    const totalImages = await Image.countDocuments({ author: userId });

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
