// lib/cloudinary.ts - Server-only Cloudinary SDK configuration
// This file should ONLY be imported in API routes (server-side)
import "dotenv/config";
import "server-only";
import { v2 as cloudinary } from "cloudinary";

// Validate and configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("CLOUDINARY_CLOUD_NAME not set");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
