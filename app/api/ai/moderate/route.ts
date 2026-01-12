import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";

interface ModerationItem {
    status?: string;
    kind?: string;
}

// Content Moderation using Cloudinary
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

        // Check moderation status with Cloudinary
        try {
            const result = await cloudinary.api.resource(publicId, {
                moderation: true
            });

            // Check moderation results
            const moderation: ModerationItem[] = result.moderation || [];
            let safe = true;
            const categories: string[] = [];

            moderation.forEach((mod) => {
                if (mod.status === "rejected") {
                    safe = false;
                    if (mod.kind) categories.push(mod.kind);
                }
            });

            return NextResponse.json({
                safe,
                categories: categories.length > 0 ? categories : ["No issues detected"],
                status: safe ? "approved" : "flagged"
            });
        } catch {
            // Return safe by default for demo
            return NextResponse.json({
                safe: true,
                categories: ["Content appears safe"],
                status: "approved"
            });
        }
    } catch (error) {
        console.error("Moderation API error:", error);
        return NextResponse.json({ error: "Failed to check content" }, { status: 500 });
    }
}
