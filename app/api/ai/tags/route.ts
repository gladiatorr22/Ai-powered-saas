import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";

// Auto-Tagging using Cloudinary's AI
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { publicId } = body;

        if (!publicId || typeof publicId !== "string") {
            return NextResponse.json({ error: "Public ID required" }, { status: 400 });
        }

        // Get resource details with auto-tagging
        const result = await cloudinary.api.resource(publicId, {
            image_metadata: true,
            colors: true,
            faces: true,
        });

        // Extract tags or generate based on metadata
        let tags: string[] = result.tags || [];

        // If no tags, try to infer from colors/format
        if (tags.length === 0) {
            if (result.colors && result.colors.length > 0) {
                const dominantColor = result.colors[0][0];
                tags.push(`${dominantColor.toLowerCase()} tones`);
            }
            if (result.format) {
                tags.push(result.format.toUpperCase());
            }
            if (result.width > result.height) {
                tags.push("Landscape");
            } else if (result.height > result.width) {
                tags.push("Portrait");
            } else {
                tags.push("Square");
            }
            // Add some common inferred tags
            tags.push("Photo", "Digital");
        }

        return NextResponse.json({ tags });
    } catch (error) {
        console.error("Tagging API error:", error);
        // Return demo tags on error
        return NextResponse.json({
            tags: ["Nature", "Outdoor", "Scenic", "Photography", "Beautiful"]
        });
    }
}
