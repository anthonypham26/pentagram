import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

//database tracker
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Supabase environment variables are not set!");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    //call the Image Generation API
    const url = new URL("https://anthonypham26--sd-example-model-generate.modal.run/");
    url.searchParams.set("prompt", text);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.API_KEY || '',
        Accept: "image/jpeg",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const filename = `${crypto.randomUUID()}.jpg`;
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    // Store prompt and imageUrl in database
    const { data, error } = await supabase
      .from("images")
      .insert([{ prompt: text, imageUrl: blob.url }]);

    if (error) {
      console.error("Database Insert Error:", error);
      throw new Error("Failed to save record to database");
    }

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
