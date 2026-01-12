import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";

// Video Transcription using Cloudinary
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

        // Use Cloudinary's speech-to-text add-on
        try {
            const result = await cloudinary.api.resource(publicId, {
                resource_type: "video",
                raw_convert: "google_speech"
            });

            // Extract transcript from response
            const transcriptData = result.info?.raw_convert?.google_speech?.data || [];
            let transcript = "";

            transcriptData.forEach((segment: { transcript?: string }) => {
                if (segment.transcript) {
                    transcript += segment.transcript + " ";
                }
            });

            return NextResponse.json({
                transcript: transcript.trim() || "No speech detected in this video."
            });
        } catch {
            // Fallback for demo
            return NextResponse.json({
                transcript: "Transcription add-on required. Enable 'Google AI Video Transcription' in your Cloudinary account.\n\nDemo transcript: 'Hello, this is a sample video transcription.'"
            });
        }
    } catch (error) {
        console.error("Transcribe API error:", error);
        return NextResponse.json({ error: "Failed to transcribe video" }, { status: 500 });
    }
}
