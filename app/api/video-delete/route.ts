import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get("id");

        if (!videoId) {
            return NextResponse.json({ error: "Video ID required" }, { status: 400 });
        }

        // Get video to verify ownership and get publicId
        const video = await prisma.video.findUnique({
            where: { id: videoId, userId },
        });

        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // Delete from Cloudinary
        try {
            await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
        } catch (cloudinaryError) {
            // Continue even if Cloudinary delete fails - we still want to remove DB record
            console.error("Cloudinary delete error (continuing):", cloudinaryError);
        }

        // Delete from database
        await prisma.video.delete({
            where: { id: videoId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    }
}
