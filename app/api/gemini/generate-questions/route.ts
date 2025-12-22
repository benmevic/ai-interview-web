import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { cvText } = await request.json();

    if (!cvText) {
      return NextResponse.json(
        { success: false, error: "CV text is required" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(cvText);

    return NextResponse.json({
      success: true,
      data: { questions }
    });
  } catch (err) {
    console.error("[Gemini] Question generation error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
