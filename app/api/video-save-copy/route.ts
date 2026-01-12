import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { videoId, title, transformations, mode, overwrite } = body;

        if (!videoId || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const originalVideo = await prisma.video.findUnique({
            where: { id: videoId, userId },
        });

        if (!originalVideo) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // Build transformation array
        let transformArray: string[] = [];

        if (mode === "social" && transformations.aspectRatio) {
            const [w, h] = transformations.aspectRatio.split(":").map(Number);
            transformArray.push(`ar_${w}:${h}/c_fill/g_auto`);
        } else if (mode === "teaser") {
            transformArray.push("e_preview:duration_10");
        }

        if (transformations.quality && transformations.quality < 100) {
            transformArray.push(`q_${transformations.quality}`);
            transformArray.push("f_auto");
        } else if (transformations.isCompressed) {
            transformArray.push("q_auto");
            transformArray.push("f_auto");
        }

        const transformString = transformArray.join("/");

        // Use eager transformation to generate and get the actual size
        const eagerConfig = transformString ? { raw_transformation: transformString } : undefined;

        const result = await cloudinary.uploader.explicit(originalVideo.publicId, {
            type: "upload",
            resource_type: "video",
            eager: eagerConfig ? [eagerConfig] : undefined,
            eager_async: false,
        });

        // Get the compressed size from eager result
        const eagerResult = result.eager?.[0];
        const compressedBytes = eagerResult?.bytes || result.bytes;
        const transformedUrl = eagerResult?.secure_url || result.secure_url;

        // Calculate new duration for teaser
        const newDuration = mode === "teaser" ? Math.min(10, originalVideo.duration) : originalVideo.duration;

        if (overwrite) {
            // Update existing video record
            const updatedVideo = await prisma.video.update({
                where: { id: videoId },
                data: {
                    compressedSize: String(compressedBytes),
                    duration: newDuration,
                },
            });

            return NextResponse.json({
                success: true,
                video: updatedVideo,
                transformedUrl,
                compressionSaved: parseInt(originalVideo.originalSize) - compressedBytes,
            });
        } else {
            // Create a new copy
            const newVideo = await prisma.video.create({
                data: {
                    title: title,
                    description: `${mode.charAt(0).toUpperCase() + mode.slice(1)} version of "${originalVideo.title}"`,
                    publicId: originalVideo.publicId, // Same source, different transformation applied on delivery
                    originalSize: originalVideo.originalSize,
                    compressedSize: String(compressedBytes),
                    duration: newDuration,
                    userId: userId,
                },
            });

            return NextResponse.json({
                success: true,
                video: newVideo,
                transformedUrl,
                compressionSaved: parseInt(originalVideo.originalSize) - compressedBytes,
            });
        }

    } catch (error) {
        console.error("Save copy error:", error);
        return NextResponse.json({ error: "Failed to save video" }, { status: 500 });
    }
}
