import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";

// Interface for Cloudinary upload result
interface CloudinaryUploadResult {
    public_id: string;
    format?: string;
    width?: number;
    height?: number;
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
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json(
                { error: "Cloudinary credentials not configured" },
                { status: 500 }
            );
        }

        // 3. Parse FormData
        let formData;
        try {
            formData = await request.formData();
        } catch {
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
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
                        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
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

        // 6. Return the upload result
        return NextResponse.json(
            {
                publicId: uploadResult.public_id,
                format: uploadResult.format,
                width: uploadResult.width,
                height: uploadResult.height
            },
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
