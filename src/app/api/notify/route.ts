import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, settings, notificationSettings, storefrontBarbers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSmsNotification, sendEmailNotification, renderTemplate } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Fetch notification settings & shop settings
    const nSettingsList = await db.select().from(notificationSettings);
    const nSettings = nSettingsList[0];

    const shopSettingsList = await db.select().from(settings);
    const shopName = shopSettingsList[0]?.shopName || "Executive Barber Lounge";
    const currency = shopSettingsList[0]?.currencySymbol || "GH₵";

    // Handle Test SMS
    if (body.type === "test_sms") {
      const { phone } = body;
      if (!phone) return NextResponse.json({ error: "Phone number is required for test SMS" }, { status: 400 });
      if (!nSettings?.mnotifyApiKey) {
        return NextResponse.json({ error: "mNotify API key is missing. Please save your API key first." }, { status: 400 });
      }

      const res = await sendSmsNotification({
        toPhone: phone,
        message: `[TEST] Hello from ${shopName}! Your mNotify SMS integration is working successfully.`,
        apiKey: nSettings.mnotifyApiKey,
        senderId: nSettings.smsSenderId || "BARBERSHOP",
      });

      if (res.success) {
        return NextResponse.json({ success: true, message: "Test SMS sent successfully!" });
      } else {
        return NextResponse.json({ error: res.error || "Failed to send test SMS" }, { status: 400 });
      }
    }

    // Handle Test Email
    if (body.type === "test_email") {
      const { email } = body;
      if (!email) return NextResponse.json({ error: "Email address is required for test email" }, { status: 400 });
      if (!nSettings?.gmailUser || !nSettings?.gmailAppPassword) {
        return NextResponse.json({ error: "Gmail user or App Password is missing. Please save them first." }, { status: 400 });
      }

      const res = await sendEmailNotification({
        toEmail: email,
        subject: `[TEST] Gmail SMTP Integration — ${shopName}`,
        bodyText: `Hello!\n\nYour Gmail SMTP email notification setup for ${shopName} is working perfectly.\n\nBest regards,\n${nSettings.emailFromName || shopName}`,
        gmailUser: nSettings.gmailUser,
        gmailAppPassword: nSettings.gmailAppPassword,
        fromName: nSettings.emailFromName || shopName,
      });

      if (res.success) {
        return NextResponse.json({ success: true, message: "Test email sent successfully!" });
      } else {
        return NextResponse.json({ error: res.error || "Failed to send test email" }, { status: 400 });
      }
    }

    // Handle Order Notification Trigger
    const { orderId, trigger } = body;
    if (!orderId || !trigger) {
      return NextResponse.json({ error: "orderId and trigger are required" }, { status: 400 });
    }

    if (!nSettings) {
      return NextResponse.json({ message: "Notification settings not initialized" });
    }

    // Fetch order
    const orderRows = await db.select().from(orders).where(eq(orders.id, Number(orderId)));
    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderRows[0];

    // Fetch barber name if assigned
    let barberName = "Any Master Barber";
    if (order.barberId) {
      const bRows = await db.select().from(storefrontBarbers).where(eq(storefrontBarbers.id, order.barberId));
      if (bRows.length > 0) barberName = bRows[0].name;
    }

    // Fetch order items
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const itemsFormatted = items
      .map((it) => `- ${it.itemName} (${it.quantity > 1 ? `x${it.quantity} ` : ""}${currency} ${(it.price / 100).toFixed(2)})`)
      .join("\n");

    const totalFormatted = `${currency} ${(order.totalAmount / 100).toFixed(2)}`;

    // Prepare variable bindings
    const vars = {
      customerName: order.customerName,
      orderCode: order.orderCode,
      date: order.appointmentDate,
      time: order.appointmentTime,
      barber: barberName,
      items: itemsFormatted || "Standard Service",
      total: totalFormatted,
      shopName,
      clientUrl: process.env.NEXT_PUBLIC_CLIENT_URL || "https://barbering-shop.vercel.app",
    };

    let smsSent = false;
    let emailSent = false;
    let smsError = "";
    let emailError = "";

    // 1. Send SMS if enabled
    if (nSettings.smsEnabled && nSettings.mnotifyApiKey && order.customerPhone) {
      let smsTemplate = "";
      if (trigger === "booking") smsTemplate = nSettings.smsOnBooking;
      else if (trigger === "confirmed") smsTemplate = nSettings.smsOnConfirmed;
      else if (trigger === "in_progress") smsTemplate = nSettings.smsOnInProgress;
      else if (trigger === "completed") smsTemplate = nSettings.smsOnCompleted;
      else if (trigger === "cancelled") smsTemplate = nSettings.smsOnCancelled;

      if (smsTemplate) {
        const smsMessage = renderTemplate(smsTemplate, vars);
        const res = await sendSmsNotification({
          toPhone: order.customerPhone,
          message: smsMessage,
          apiKey: nSettings.mnotifyApiKey,
          senderId: nSettings.smsSenderId,
        });
        smsSent = res.success;
        if (!res.success) smsError = res.error || "SMS failed";
      }
    }

    // 2. Send Email if enabled
    if (nSettings.emailEnabled && nSettings.gmailUser && nSettings.gmailAppPassword && order.customerEmail) {
      let subjectTemplate = "";
      let bodyTemplate = "";

      if (trigger === "booking") {
        subjectTemplate = nSettings.emailSubjectOnBooking;
        bodyTemplate = nSettings.emailBodyOnBooking;
      } else if (trigger === "confirmed") {
        subjectTemplate = nSettings.emailSubjectOnConfirmed;
        bodyTemplate = nSettings.emailBodyOnConfirmed;
      } else if (trigger === "in_progress") {
        subjectTemplate = nSettings.emailSubjectOnInProgress;
        bodyTemplate = nSettings.emailBodyOnInProgress;
      } else if (trigger === "completed") {
        subjectTemplate = nSettings.emailSubjectOnCompleted;
        bodyTemplate = nSettings.emailBodyOnCompleted;
      } else if (trigger === "cancelled") {
        subjectTemplate = nSettings.emailSubjectOnCancelled;
        bodyTemplate = nSettings.emailBodyOnCancelled;
      }

      if (subjectTemplate && bodyTemplate) {
        const subject = renderTemplate(subjectTemplate, vars);
        const bodyText = renderTemplate(bodyTemplate, vars);
        const res = await sendEmailNotification({
          toEmail: order.customerEmail,
          subject,
          bodyText,
          gmailUser: nSettings.gmailUser,
          gmailAppPassword: nSettings.gmailAppPassword,
          fromName: nSettings.emailFromName || shopName,
        });
        emailSent = res.success;
        if (!res.success) emailError = res.error || "Email failed";
      }
    }

    return NextResponse.json({
      success: true,
      smsSent,
      emailSent,
      smsError: smsError || undefined,
      emailError: emailError || undefined,
    });
  } catch (error: any) {
    console.error("Notification API error:", error);
    return NextResponse.json({ error: error.message || "Notification failed" }, { status: 500 });
  }
}
