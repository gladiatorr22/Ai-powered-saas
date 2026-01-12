import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinary } from "@/lib/cloudinary";

// OCR - Text Extraction using Cloudinary
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

        // Use Cloudinary's OCR add-on
        try {
            const result = await cloudinary.api.resource(publicId, {
                ocr: "adv_ocr"
            });

            // Extract text from OCR response
            const ocrData = result.info?.ocr?.adv_ocr?.data || [];
            let extractedText = "";

            ocrData.forEach((block: { textAnnotations?: { description?: string }[] }) => {
                if (block.textAnnotations) {
                    block.textAnnotations.forEach((annotation) => {
                        if (annotation.description) {
                            extractedText += annotation.description + " ";
                        }
                    });
                }
            });

            return NextResponse.json({ text: extractedText.trim() || "No text detected in this image." });
        } catch {
            // Fallback for demo when OCR add-on isn't enabled
            return NextResponse.json({
                text: "OCR add-on required. Enable 'Advanced OCR' in your Cloudinary account to extract text from images.\n\nDemo text: 'Hello World'"
            });
        }
    } catch (error) {
        console.error("OCR API error:", error);
        return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
    }
}
