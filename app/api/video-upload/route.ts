import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Interface for Cloudinary upload result
interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
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
        const title = formData.get("title") as string | null;
        const description = formData.get("description") as string | null;
        const originalSize = formData.get("originalSize") as string | null;

        if (!file) {
            return NextResponse.json({ error: "File is required" }, { status: 400 });
        }

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (!originalSize) {
            return NextResponse.json(
                { error: "Original size is required" },
                { status: 400 }
            );
        }

        // 4. Convert file to buffer for upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 5. Upload to Cloudinary using upload_stream
        const uploadResult = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "video-uploads",
                        resource_type: "video",
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

        // 6. Save video metadata to database via Prisma
        const video = await prisma.video.create({
            data: {
                title,
                description: description || "",
                publicId: uploadResult.public_id,
                originalSize,
                compressedSize: String(uploadResult.bytes),
                duration: uploadResult.duration || 0,
                userId: userId,
            },
        });

        // 7. Return the created video object
        return NextResponse.json(video, { status: 200 });
    } catch (error) {
        console.error("Video upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload video" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
