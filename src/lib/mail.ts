import nodemailer from "nodemailer";

export async function sendLeadEmail({
  subject,
  html,
}: {
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const smtpHost = process.env.BREVO_SMTP || "smtp-relay.brevo.com";
  const smtpPort = Number(process.env.BREVO_PORT) || 587;
  const smtpUser = process.env.BREVO_USER;
  const smtpPass = process.env.BREVO_PASSWORD;
  const senderMail = process.env.BREVO_SENDER_MAIL || "awadhiyanaveen39@gmail.com";
  const recipientMail = "pankajtradingco.14@gmail.com";

  if (!smtpUser || !smtpPass) {
    console.error(
      "[NodeMailer] SMTP credentials not fully configured in environment variables."
    );
    return { success: false, error: "SMTP credentials not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"PTC Furniture Alerts" <${senderMail}>`,
      to: recipientMail,
      subject,
      html,
    });

    console.log(`[NodeMailer] Lead email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[NodeMailer] Error sending email:", error);
    return { success: false, error: error?.message || String(error) };
  }
}

// 1. Helper to send Dealer Lead Emails
export async function sendDealerLeadEmail(lead: {
  id: string;
  name: string;
  phone: string;
  city: string;
  email?: string;
  createdAt: string;
}) {
  const formattedDate = new Date(lead.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6; }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 25px; }
    .content h2 { font-size: 18px; color: #1e293b; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .details-table th, .details-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .details-table th { color: #64748b; font-weight: 600; width: 35%; background-color: #f8fafc; }
    .details-table td { color: #334155; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-dealer { background-color: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Dealer Lead</h1>
      <p>PTC Furniture Partner Request</p>
    </div>
    <div class="content">
      <h2>Lead Information</h2>
      <table class="details-table">
        <tr>
          <th>Reference ID</th>
          <td><strong>${lead.id}</strong></td>
        </tr>
        <tr>
          <th>Name</th>
          <td>${lead.name}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td><a href="tel:${lead.phone}">${lead.phone}</a></td>
        </tr>
        <tr>
          <th>City</th>
          <td>${lead.city}</td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td>${lead.email ? `<a href="mailto:${lead.email}">${lead.email}</a>` : "Not provided"}</td>
        </tr>
        <tr>
          <th>Submission Time</th>
          <td>${formattedDate}</td>
        </tr>
        <tr>
          <th>Lead Status</th>
          <td><span class="badge badge-dealer">New Inquiry</span></td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <p>This is an automated notification from Pankaj Trading Co. lead management system.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendLeadEmail({
    subject: `🆕 Dealer Registration Lead: ${lead.name} (${lead.city})`,
    html,
  });
}

// 2. Helper to send Contact Message Emails
export async function sendContactMessageEmail(message: {
  name: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: Date | string;
}) {
  const formattedDate = new Date(message.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6; }
    .header { background: linear-gradient(135deg, #b45309, #d97706); padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 25px; }
    .content h2 { font-size: 18px; color: #1e293b; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .details-table th, .details-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .details-table th { color: #64748b; font-weight: 600; width: 35%; background-color: #f8fafc; }
    .details-table td { color: #334155; }
    .message-box { background-color: #f8fafc; border-left: 4px solid #d97706; padding: 15px; border-radius: 0 8px 8px 0; font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 25px; white-space: pre-wrap; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-contact { background-color: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Message</h1>
      <p>PTC Furniture Customer Inquiry</p>
    </div>
    <div class="content">
      <h2>Inquiry Details</h2>
      <table class="details-table">
        <tr>
          <th>Name</th>
          <td>${message.name}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td><a href="tel:${message.phone}">${message.phone}</a></td>
        </tr>
        <tr>
          <th>Subject</th>
          <td>${message.subject}</td>
        </tr>
        <tr>
          <th>Submission Time</th>
          <td>${formattedDate}</td>
        </tr>
        <tr>
          <th>Lead Type</th>
          <td><span class="badge badge-contact">Contact Form</span></td>
        </tr>
      </table>

      <h2>Message Body</h2>
      <div class="message-box">${message.message}</div>
    </div>
    <div class="footer">
      <p>This is an automated notification from Pankaj Trading Co. contact system.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendLeadEmail({
    subject: `✉️ New Contact Form Lead: ${message.name} - ${message.subject}`,
    html,
  });
}

// 3. Helper to send Catalog/Image Download Lead Emails
export async function sendDownloadLeadEmail(lead: {
  name: string;
  mobile: string;
  action: string;
  productId?: string;
  productName?: string;
  catalogUrl?: string;
  createdAt: Date | string;
}) {
  const formattedDate = new Date(lead.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case "catalog_download":
        return "Catalog PDF Download";
      case "image_download":
        return "Product Image Download";
      case "catalog_print":
        return "Catalog Print Request";
      default:
        return action;
    }
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6; }
    .header { background: linear-gradient(135deg, #047857, #10b981); padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 25px; }
    .content h2 { font-size: 18px; color: #1e293b; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .details-table th, .details-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .details-table th { color: #64748b; font-weight: 600; width: 35%; background-color: #f8fafc; }
    .details-table td { color: #334155; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-download { background-color: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Download Lead</h1>
      <p>PTC Furniture Asset Download Alert</p>
    </div>
    <div class="content">
      <h2>Lead & Asset Information</h2>
      <table class="details-table">
        <tr>
          <th>Name</th>
          <td>${lead.name}</td>
        </tr>
        <tr>
          <th>Mobile</th>
          <td><a href="tel:${lead.mobile}">${lead.mobile}</a></td>
        </tr>
        <tr>
          <th>Action Logged</th>
          <td><span class="badge badge-download">${getActionLabel(lead.action)}</span></td>
        </tr>
        ${lead.productName ? `
        <tr>
          <th>Product Name</th>
          <td>${lead.productName}</td>
        </tr>
        ` : ""}
        ${lead.productId ? `
        <tr>
          <th>Product ID</th>
          <td>${lead.productId}</td>
        </tr>
        ` : ""}
        ${lead.catalogUrl ? `
        <tr>
          <th>Catalog Link</th>
          <td><a href="${lead.catalogUrl}" target="_blank">${lead.catalogUrl}</a></td>
        </tr>
        ` : ""}
        <tr>
          <th>Logged At</th>
          <td>${formattedDate}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <p>This is an automated notification from Pankaj Trading Co. download tracking system.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendLeadEmail({
    subject: `📥 Asset Download Lead: ${lead.name} (${getActionLabel(lead.action)})`,
    html,
  });
}

// 4. Helper to send Newsletter Subscription Emails
export async function sendSubscriberEmail(subscriber: {
  email: string;
  subscribedAt: Date | string;
}) {
  const formattedDate = new Date(subscriber.subscribedAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6; }
    .header { background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 25px; }
    .content h2 { font-size: 18px; color: #1e293b; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    .details-table th, .details-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .details-table th { color: #64748b; font-weight: 600; width: 35%; background-color: #f8fafc; }
    .details-table td { color: #334155; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-subscriber { background-color: #ede9fe; color: #5b21b6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Newsletter Subscriber</h1>
      <p>PTC Furniture — Stay in Touch Form</p>
    </div>
    <div class="content">
      <h2>Subscription Details</h2>
      <table class="details-table">
        <tr>
          <th>Email Address</th>
          <td><a href="mailto:${subscriber.email}">${subscriber.email}</a></td>
        </tr>
        <tr>
          <th>Subscribed At</th>
          <td>${formattedDate}</td>
        </tr>
        <tr>
          <th>Source</th>
          <td><span class="badge badge-subscriber">Stay in Touch Form</span></td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <p>This is an automated notification from Pankaj Trading Co. newsletter system.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendLeadEmail({
    subject: `📬 New Newsletter Subscriber: ${subscriber.email}`,
    html,
  });
}
