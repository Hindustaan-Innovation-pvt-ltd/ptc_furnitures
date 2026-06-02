import fs from "node:fs/promises";
import path from "node:path";
import { type DealerLead, updateLeadWhatsAppStatus } from "./leads";

export type WhatsAppLogEntry = {
  id: string;
  leadId: string;
  recipientPhone: string;
  messageText: string;
  status: "sent" | "failed";
  timestamp: string;
  isSimulated: boolean;
  error?: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const logsFile = path.join(dataDirectory, "whatsapp_logs.json");

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(logsFile);
  } catch {
    await fs.writeFile(logsFile, JSON.stringify([], null, 2), "utf8");
  }
}

export async function readWhatsAppLogs(): Promise<WhatsAppLogEntry[]> {
  await ensureStore();
  try {
    const fileContents = await fs.readFile(logsFile, "utf8");
    const parsed = JSON.parse(fileContents) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as WhatsAppLogEntry[];
  } catch {
    return [];
  }
}

async function writeWhatsAppLogs(logs: WhatsAppLogEntry[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(logsFile, JSON.stringify(logs, null, 2), "utf8");
}

export async function logWhatsAppTransmission(entry: Omit<WhatsAppLogEntry, "id" | "timestamp">) {
  const logs = await readWhatsAppLogs();
  const newEntry: WhatsAppLogEntry = {
    id: `WA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  logs.unshift(newEntry);
  await writeWhatsAppLogs(logs);
  return newEntry;
}

/**
 * Dispatches a simple direct WhatsApp notification containing basic dealer details.
 * Integrates with Meta's Business API if credentials are configured,
 * otherwise falls back to a stunning visual terminal log simulation and local file logs.
 */
export async function sendDealerWhatsAppMessage(
  lead: DealerLead
): Promise<{ success: boolean; message: string; error?: string }> {
  const { id, name, phone, city } = lead;
  
  // Format clean and simple direct message with basic dealer information
  const messageText = `PTC Furnitures Dealer Submission Received!
----------------------------------------
ID: ${id}
Name: ${name}
Phone: ${phone}
City: ${city}

Thank you for submitting your partnership request. We will review your details shortly.`;

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  const isConfigured = !!(phoneId && accessToken);

  if (isConfigured) {
    try {
      // Direct Meta WhatsApp Cloud API POST call
      // Note: Initiating standard text messages might require template pre-approval 
      // or active 24h customer window. For generic webhook or raw delivery setups:
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "text",
            text: {
              body: messageText,
            },
          }),
        }
      );

      const responseData = (await response.json()) as any;

      if (response.ok && (responseData?.messages || responseData?.success)) {
        await updateLeadWhatsAppStatus(lead.id, "sent", messageText);
        await logWhatsAppTransmission({
          leadId: lead.id,
          recipientPhone: phone,
          messageText,
          status: "sent",
          isSimulated: false,
        });
        return { success: true, message: messageText };
      } else {
        const errorMsg = responseData?.error?.message || "Failed API transmission";
        await updateLeadWhatsAppStatus(lead.id, "failed", messageText);
        await logWhatsAppTransmission({
          leadId: lead.id,
          recipientPhone: phone,
          messageText,
          status: "failed",
          isSimulated: false,
          error: errorMsg,
        });
        return { success: false, message: messageText, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      await updateLeadWhatsAppStatus(lead.id, "failed", messageText);
      await logWhatsAppTransmission({
        leadId: lead.id,
        recipientPhone: phone,
        messageText,
        status: "failed",
        isSimulated: false,
        error: errorMsg,
      });
      return { success: false, message: messageText, error: errorMsg };
    }
  } else {
    // FALLBACK: STUNNING VISUAL SIMULATION
    const timestamp = new Date().toISOString();
    
    // Print a premium high-fidelity terminal box
    console.log("\n\x1b[32m┌────────────────────────────────────────────────────────┐\x1b[0m");
    console.log("\x1b[32m│\x1b[1;37m             💬 WHATSAPP NOTIFICATION DISPATCH          \x1b[0m\x1b[32m│\x1b[0m");
    console.log("\x1b[32m├────────────────────────────────────────────────────────┤\x1b[0m");
    console.log(`\x1b[32m│\x1b[0m \x1b[1;30mStatus:\x1b[0m    \x1b[1;32mSIMULATED SENT                              \x1b[0m\x1b[32m│\x1b[0m`);
    console.log(`\x1b[32m│\x1b[0m \x1b[1;30mTimestamp:\x1b[0m \x1b[36m${timestamp.substring(0, 24)} \x1b[0m                  \x1b[32m│\x1b[0m`);
    console.log(`\x1b[32m│\x1b[0m \x1b[1;30mRecipient:\x1b[0m \x1b[1;33m${phone.padEnd(44)} \x1b[0m\x1b[32m│\x1b[0m`);
    console.log("\x1b[32m├────────────────────────────────────────────────────────┤\x1b[0m");
    console.log("\x1b[32m│\x1b[0m \x1b[1;34mMessage Payload:\x1b[0m                                       \x1b[32m│\x1b[0m");
    console.log("\x1b[32m│\x1b[0m                                                        \x1b[32m│\x1b[0m");
    
    const lines = messageText.split("\n");
    for (const line of lines) {
      // pad lines to match width
      const cleanLine = line.replace(/[\r\n]/g, "");
      console.log(`\x1b[32m│\x1b[0m \x1b[37m${cleanLine.padEnd(54)}\x1b[0m \x1b[32m│\x1b[0m`);
    }
    
    console.log("\x1b[32m│\x1b[0m                                                        \x1b[32m│\x1b[0m");
    console.log("\x1b[32m└────────────────────────────────────────────────────────┘\x1b[0m\n");

    // Persist to leads database
    await updateLeadWhatsAppStatus(lead.id, "sent", messageText);
    
    // Log to local JSON
    await logWhatsAppTransmission({
      leadId: lead.id,
      recipientPhone: phone,
      messageText,
      status: "sent",
      isSimulated: true,
    });

    return { success: true, message: messageText };
  }
}
