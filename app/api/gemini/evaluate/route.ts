import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswers } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { cvText, questionsAndAnswers } = await request.json();

    if (!cvText || !questionsAndAnswers) {
      return NextResponse.json(
        { success: false, error: "cvText and questionsAndAnswers are required" },
        { status: 400 }
      );
    }

    const result = await evaluateAnswers(cvText, questionsAndAnswers);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("[Gemini] Evaluation error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
