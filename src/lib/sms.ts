import twilio from "twilio";
import type { DealerLead } from "./leads";

export async function sendLeadSmsNotification(
  lead: DealerLead,
): Promise<{ success: boolean; error?: string }> {
  const { id, name, phone, city, email } = lead;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const recipientNumber = process.env.ADMIN_SMS_RECIPIENT || "+919294512259";

  const isConfigured = !!(accountSid && authToken && fromNumber);

  const messageText = `🆕 PTC Furniture Lead Alert!
Reference ID: ${id}
Name: ${name}
Phone: ${phone}
City: ${city}
${email ? `Email: ${email}` : ""}`;

  if (isConfigured) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: messageText,
        from: fromNumber,
        to: recipientNumber,
      });

      console.log(`[Twilio] SMS alert sent successfully for lead: ${id}`);
      return { success: true };
    } catch (err: any) {
      console.error("Twilio SMS dispatch failed:", err);
      return { success: false, error: err?.message || String(err) };
    }
  } else {
    // FALLBACK: STUNNING VISUAL SIMULATION
    const timestamp = new Date().toISOString();
    console.log(
      "\n\x1b[33m┌────────────────────────────────────────────────────────┐\x1b[0m",
    );
    console.log(
      "\x1b[33m│\x1b[1;37m                 📱 SMS NOTIFICATION DISPATCH           \x1b[0m\x1b[33m│\x1b[0m",
    );
    console.log(
      "\x1b[33m├────────────────────────────────────────────────────────┤\x1b[0m",
    );
    console.log(
      `\x1b[33m│\x1b[0m \x1b[1;30mStatus:\x1b[0m    \x1b[1;32mSIMULATED SENT                              \x1b[0m\x1b[33m│\x1b[0m`,
    );
    console.log(
      `\x1b[33m│\x1b[0m \x1b[1;30mTimestamp:\x1b[0m \x1b[36m${timestamp.substring(0, 24)} \x1b[0m                  \x1b[33m│\x1b[0m`,
    );
    console.log(
      `\x1b[33m│\x1b[0m \x1b[1;30mSender:\x1b[0m    \x1b[1;33m${(fromNumber || "TWILIO_FROM").padEnd(44)} \x1b[0m\x1b[33m│\x1b[0m`,
    );
    console.log(
      `\x1b[33m│\x1b[0m \x1b[1;30mRecipient:\x1b[0m \x1b[1;33m${recipientNumber.padEnd(44)} \x1b[0m\x1b[33m│\x1b[0m`,
    );
    console.log(
      "\x1b[33m├────────────────────────────────────────────────────────┤\x1b[0m",
    );
    console.log(
      "\x1b[33m│\x1b[0m \x1b[1;34mMessage Body:\x1b[0m                                          \x1b[33m│\x1b[0m",
    );
    console.log(
      "\x1b[33m│\x1b[0m                                                        \x1b[33m│\x1b[0m",
    );

    const lines = messageText.split("\n");
    for (const line of lines) {
      const cleanLine = line.replace(/[\r\n]/g, "");
      console.log(
        `\x1b[33m│\x1b[0m \x1b[37m${cleanLine.padEnd(54)}\x1b[0m \x1b[33m│\x1b[0m`,
      );
    }

    console.log(
      "\x1b[33m│\x1b[0m                                                        \x1b[33m│\x1b[0m",
    );
    console.log(
      "\x1b[33m└────────────────────────────────────────────────────────┘\x1b[0m\n",
    );

    return { success: true };
  }
}
