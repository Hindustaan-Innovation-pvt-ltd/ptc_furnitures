import { NextResponse } from "next/server";
import { ContactMessageModel } from "@/lib/db-models";
import { connectToDatabase } from "@/lib/mongodb";
import { sendContactMessageEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    let body: any = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value.toString();
      }
    }

    const { name, phone, subject, message } = body;

    if (
      !name?.trim() ||
      !phone?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields (name, phone, subject, message) are required.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const msg = await ContactMessageModel.create({
      name: name.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // Send email alert asynchronously
    await sendContactMessageEmail({
      name: msg.name,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      createdAt: msg.createdAt,
    });

    // If it's a standard form submission, redirect back to /contact with success
    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(
        new URL("/contact?success=true", request.url),
      );
    }

    return NextResponse.json({ success: true, messageId: msg._id });
  } catch (error: any) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit message." },
      { status: 500 },
    );
  }
}
