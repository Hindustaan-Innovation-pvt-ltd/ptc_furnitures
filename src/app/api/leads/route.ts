import { NextResponse } from "next/server";
import { readLeads, addLead, updateLead, updateLeadStatus, deleteLead } from "@/lib/leads";
import { sendDealerWhatsAppMessage } from "@/lib/whatsapp";
import { sendLeadSmsNotification } from "@/lib/sms";

export async function GET() {
  try {
    const leads = await readLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to read leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone || !body.city) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and city are required." },
        { status: 400 }
      );
    }
    const newLead = await addLead(body);
    
    // Asynchronously trigger the WhatsApp dispatch which persists the whatsappStatus
    await sendDealerWhatsAppMessage(newLead);

    // Asynchronously trigger the Twilio SMS alert
    await sendLeadSmsNotification(newLead);
    
    // Retrieve the fully updated lead with its WhatsApp status populated
    const leads = await readLeads();
    const updatedLead = leads.find((l) => l.id === newLead.id) || newLead;

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, whatsappStatus, whatsappSentAt, whatsappMessage } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing lead ID" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (whatsappStatus !== undefined) updates.whatsappStatus = whatsappStatus;
    if (whatsappSentAt !== undefined) updates.whatsappSentAt = whatsappSentAt;
    if (whatsappMessage !== undefined) updates.whatsappMessage = whatsappMessage;

    const updated = await updateLead(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing lead ID" },
        { status: 400 }
      );
    }
    const deleted = await deleteLead(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, lead: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
