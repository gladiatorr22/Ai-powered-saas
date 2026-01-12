import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// Interface for Cloudinary upload result
interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: unknown;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user with Clerk
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Validate Cloudinary credentials
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: "Cloudinary credentials not configured" },
                { status: 500 }
            );
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        // 3. Parse FormData
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        // 4. Convert file to buffer for upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 5. Upload to Cloudinary using upload_stream
        const uploadResult = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "next-cloudinary-uploads",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result as CloudinaryUploadResult);
                        }
                    }
                );

                // Write buffer to the upload stream
                uploadStream.end(buffer);
            }
        );

        // 6. Return the publicId
        return NextResponse.json(
            { publicId: uploadResult.public_id },
            { status: 200 }
        );
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
