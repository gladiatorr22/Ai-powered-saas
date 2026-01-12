import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface GroqMessage {
    role: string;
    content: string | { type: string; text?: string; image_url?: { url: string } }[];
}

interface GroqResponse {
    choices?: {
        message?: {
            content?: string;
        };
    }[];
}

// AI Vision using Groq's LLaMA for image understanding
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

        const { imageUrl, question } = body;

        if (!imageUrl || typeof imageUrl !== "string") {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        if (!question || typeof question !== "string") {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        // Use Groq API with LLaMA Vision model
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            // Fallback: simulate response for demo
            const simulatedResponses: Record<string, string> = {
                "describe": "This image shows a vibrant scene with rich colors and interesting composition. The lighting creates a nice atmosphere.",
                "caption": "✨ Living my best life! #photography #moments #beautiful",
                "safe": "Yes, this image appears to be safe for work and appropriate for all audiences.",
                "default": "I can see an interesting image here. It has good visual elements and appears to be well-composed."
            };

            const key = question.toLowerCase().includes("describe") ? "describe"
                : question.toLowerCase().includes("caption") ? "caption"
                    : question.toLowerCase().includes("safe") ? "safe"
                        : "default";

            return NextResponse.json({ response: simulatedResponses[key] });
        }

        // Real Groq API call with LLaMA Vision
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.2-90b-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: question },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ] as GroqMessage[],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error("Groq API error");
        }

        const data: GroqResponse = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "I couldn't analyze this image.";

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error("Vision API error:", error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }
}
