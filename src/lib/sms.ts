import type { DealerLead } from "./leads";

export async function sendLeadSmsNotification(
  lead: DealerLead,
): Promise<{ success: boolean; error?: string }> {
  const { id, name, phone, city, email } = lead;

  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
  const recipientNumber = process.env.ADMIN_SMS_RECIPIENT || "+919294512259";

  const messageText = `🆕 PTC Furniture Lead Alert!
Reference ID: ${id}
Name: ${name}
Phone: ${phone}
City: ${city}
${email ? `Email: ${email}` : ""}`;

  // 1. Try MSG91 if configured
  if (msg91AuthKey && msg91TemplateId) {
    try {
      const formattedPhone = recipientNumber.replace(/\+/g, "");
      const bodyData: any = {
        template_id: msg91TemplateId,
        recipients: [
          {
            mobiles: formattedPhone,
            id: id,
            name: name,
            phone: phone,
            city: city,
            email: email || "N/A",
            var1: id,
            var2: name,
            var3: phone,
            var4: city,
            var5: email || "N/A",
            VAR1: id,
            VAR2: name,
            VAR3: phone,
            VAR4: city,
            VAR5: email || "N/A",
            message: messageText,
            VAR_MSG: messageText,
          },
        ],
      };

      if (process.env.MSG91_SENDER) {
        bodyData.sender = process.env.MSG91_SENDER;
      }

      const res = await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: msg91AuthKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log(
          `[MSG91] SMS alert sent successfully for lead: ${id}`,
          responseData,
        );
        return { success: true };
      } else {
        const errText = await res.text();
        console.error(
          `[MSG91] SMS alert failed with status ${res.status}:`,
          errText,
        );
        return {
          success: false,
          error: `MSG91 failed (${res.status}): ${errText}`,
        };
      }
    } catch (err: any) {
      console.error("MSG91 SMS dispatch failed:", err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  // 2. Fallback: Stunning Visual console simulation
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
    `\x1b[33m│\x1b[0m \x1b[1;30mStatus:\x1b[0m    \x1b[1;32mSIMULATED SENT (MSG91 Offline)              \x1b[0m\x1b[33m│\x1b[0m`,
  );
  console.log(
    `\x1b[33m│\x1b[0m \x1b[1;30mTimestamp:\x1b[0m \x1b[36m${timestamp.substring(0, 24)} \x1b[0m                  \x1b[33m│\x1b[0m`,
  );
  console.log(
    `\x1b[33m│\x1b[0m \x1b[1;30mProvider:\x1b[0m  \x1b[1;35mMSG91 (Flow API Template Engine)            \x1b[0m\x1b[33m│\x1b[0m`,
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
