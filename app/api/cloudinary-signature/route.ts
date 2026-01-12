import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
        }

        // Generate a signed upload signature for direct client uploads
        const timestamp = Math.round(Date.now() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder: "video-uploads",
            },
            process.env.CLOUDINARY_API_SECRET
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: "video-uploads",
        });
    } catch (error) {
        console.error("Signature generation error:", error);
        return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
    }
}
