import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Format messages for OpenAI API
    const formattedMessages = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedMessages,
    });

    // Extract the response
    const responseMessage = completion.choices[0].message;

    return NextResponse.json({
      role: "assistant",
      content: responseMessage.content,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    );
  }
}
