import nodemailer from "nodemailer";

export interface RenderVars {
  customerName?: string;
  orderCode?: string;
  date?: string;
  time?: string;
  barber?: string;
  items?: string;
  total?: string;
  shopName?: string;
  clientUrl?: string;
}

export function renderTemplate(template: string, vars: RenderVars): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

/**
 * Send SMS via mNotify API
 * Endpoint: https://api.mnotify.com/api/sms/quick
 */
export async function sendSmsNotification({
  toPhone,
  message,
  apiKey,
  senderId,
}: {
  toPhone: string;
  message: string;
  apiKey: string;
  senderId: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!apiKey) {
    return { success: false, error: "mNotify API key is missing" };
  }

  // Format phone number (e.g., ensure international format or standard Ghana format)
  // mNotify accepts comma separated strings like "024XXXXXXX" or "23324XXXXXXX"
  let recipient = toPhone.replace(/[\s\-\(\)]/g, "");
  if (recipient.startsWith("+")) {
    recipient = recipient.substring(1);
  }

  try {
    const url = `https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: [recipient],
        sender: senderId || "BARBERSHOP",
        message: message,
        is_schedule: false,
        schedule_date: "",
      }),
    });

    const data = await response.json();
    if (response.ok && (data.code === "1000" || data.status === "success" || data.code === 1000)) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || data.error || JSON.stringify(data) };
    }
  } catch (err: any) {
    console.error("mNotify SMS Error:", err);
    return { success: false, error: err.message || "Failed to send SMS via mNotify" };
  }
}

/**
 * Send Email via Gmail SMTP using Nodemailer
 */
export async function sendEmailNotification({
  toEmail,
  subject,
  bodyText,
  gmailUser,
  gmailAppPassword,
  fromName,
}: {
  toEmail: string;
  subject: string;
  bodyText: string;
  gmailUser: string;
  gmailAppPassword: string;
  fromName?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!gmailUser || !gmailAppPassword) {
    return { success: false, error: "Gmail user or App Password is missing" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const mailOptions = {
      from: `"${fromName || "Barbershop"}" <${gmailUser}>`,
      to: toEmail,
      subject: subject,
      text: bodyText,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err: any) {
    console.error("Gmail SMTP Error:", err);
    return { success: false, error: err.message || "Failed to send email via Gmail SMTP" };
  }
}
