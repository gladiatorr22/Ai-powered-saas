import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Save video metadata after successful Cloudinary upload
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { title, description, publicId, originalSize, compressedSize, duration } = body;

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (!publicId || typeof publicId !== "string") {
            return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
        }

        const video = await prisma.video.create({
            data: {
                title: title.trim(),
                description: description?.trim() || "",
                publicId,
                originalSize: String(originalSize || 0),
                compressedSize: String(compressedSize || 0),
                duration: duration || 0,
                userId,
            },
        });

        return NextResponse.json(video, { status: 200 });
    } catch (error) {
        console.error("Save video error:", error);
        return NextResponse.json({ error: "Failed to save video" }, { status: 500 });
    }
}
