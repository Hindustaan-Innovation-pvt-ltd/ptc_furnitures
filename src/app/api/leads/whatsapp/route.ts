import { NextResponse } from "next/server";
import { readLeads } from "@/lib/leads";
import { sendDealerWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.leadId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required." },
        { status: 400 },
      );
    }

    const leads = await readLeads();
    const lead = leads.find((l) => l.id === id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Dealer lead not found." },
        { status: 404 },
      );
    }

    // Resend/Manual trigger WhatsApp notification
    const res = await sendDealerWhatsAppMessage(lead);

    if (res.success) {
      // Read fully updated lead
      const updatedLeads = await readLeads();
      const updatedLead = updatedLeads.find((l) => l.id === id);
      return NextResponse.json({ success: true, lead: updatedLead });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: res.error || "Failed to send WhatsApp message.",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process request." },
      { status: 500 },
    );
  }
}
