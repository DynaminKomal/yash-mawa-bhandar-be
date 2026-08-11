import nodemailer from "nodemailer";
import axios from "axios";

export const sendAdminNotification = async (visit: any) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <div style="background: #569863; padding: 20px; text-align: center; color: white;">
          <div>
            <h2 style="margin: 0;">Yash Mawa Bhandar</h2>
            <span>SINCE 1975</span>
          </div>
          <p style="margin: 5px 0 0;">New Plant Visit Request</p>
        </div>
\
        <div style="padding: 20px;">
          
          <p style="font-size: 16px;">A new plant visit request has been submitted:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Name</td>
              <td style="padding: 8px;">${visit.userName}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Email</td>
              <td style="padding: 8px;">${visit.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${visit.phoneNumber}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Company</td>
              <td style="padding: 8px;">${visit.company || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Visit Date</td>
              <td style="padding: 8px;">${new Date(visit.date).toDateString()}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">Visitors</td>
              <td style="padding: 8px;">${visit.numberVisitor}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Purpose</td>
              <td style="padding: 8px;">${visit.message || "-"}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background: #f1f8f3; border-left: 4px solid #569863;">
            <strong>Visit ID:</strong> ${visit.visitId}
          </div>

        </div>

        <div style="background: #fafafa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p style="margin: 0;">This email was generated from your website</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Yash Mawa Bhandar</p>
          <p style="margin: 5px 0;">Legacy of Ramkumar Ratan Dairy</p>
        </div>

      </div>
    </div>
    `;

  try {
    await transporter.sendMail({
      from: `"Yash Mawa Bhandar" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: visit.email,
      subject: "New Plant Visit Request 📅",
      html: htmlTemplate,
    });
  } catch (error) {
    console.error("Email Error:", error);
  }
};

export const sendPlantVisitStatusEmail = async (
  visit: any,
  status: "approved" | "rejected",
  notes?: string
) => {
  const transporter = getTransporter();
  const isApproved = status === "approved";
  const statusBadgeColor = isApproved ? "#569863" : "#e53e3e";
  const headerTitle = isApproved
    ? "Plant Visit Request Approved! 🎉"
    : "Plant Visit Request Update";
  const statusLabel = isApproved ? "APPROVED" : "REJECTED";

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <div style="background: ${statusBadgeColor}; padding: 24px 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Yash Mawa Bhandar</h2>
          <span style="font-size: 12px; opacity: 0.85;">SINCE 1975</span>
          <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold;">${headerTitle}</p>
          <span style="
            display: inline-block;
            margin-top: 8px;
            padding: 4px 14px;
            background: rgba(255,255,255,0.25);
            border-radius: 20px;
            font-size: 12px;
            letter-spacing: 1px;
            font-weight: bold;
          ">${statusLabel}</span>
        </div>

        <div style="padding: 24px 20px;">
          <p style="font-size: 16px; color: #333; margin-top: 0;">Dear <strong>${visit.userName}</strong>,</p>
          
          <p style="font-size: 15px; color: #444; line-height: 1.5;">
            ${
              isApproved
                ? `We are pleased to inform you that your request to visit our plant has been <strong>approved</strong>.`
                : `Thank you for your interest in visiting our plant. Regrettably, we are unable to approve your visit request at this time.`
            }
          </p>

          <h3 style="color: #569863; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; margin-top: 20px;">Visit Request Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 35%; color: #555;">Visit ID</td>
              <td style="padding: 8px; color: #222;">${visit.visitId}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #555;">Company</td>
              <td style="padding: 8px; color: #222;">${visit.company || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #555;">Requested Date</td>
              <td style="padding: 8px; color: #222;">${new Date(visit.date).toDateString()}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold; color: #555;">Visitors</td>
              <td style="padding: 8px; color: #222;">${visit.numberVisitor}</td>
            </tr>
          </table>

          ${
            notes
              ? `<div style="margin-top: 20px; padding: 15px; background: ${isApproved ? '#f1f8f3' : '#fff5f5'}; border-left: 4px solid ${statusBadgeColor}; border-radius: 4px;">
                  <strong style="color: ${statusBadgeColor}; font-size: 14px;">Notes from Management:</strong>
                  <p style="margin: 6px 0 0; color: #444; font-size: 14px;">${notes}</p>
                </div>`
              : ''
          }

          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
            If you have any questions or require further assistance, feel free to reply to this email or contact us directly.
          </div>
        </div>

        <div style="background: #fafafa; padding: 15px 20px; text-align: center; font-size: 12px; color: #888;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Yash Mawa Bhandar · Legacy of Ramkumar Ratan Dairy</p>
        </div>

      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Yash Mawa Bhandar" <${process.env.EMAIL_USER}>`,
      to: visit.email,
      subject: isApproved
        ? `Plant Visit Approved – Visit ID: ${visit.visitId}`
        : `Plant Visit Status Update – Visit ID: ${visit.visitId}`,
      html: htmlTemplate,
    });
    console.log(`[Email] Plant visit status email (${status}) sent to ${visit.email}`);
  } catch (error) {
    console.error(`[Email Error] Failed to send plant visit status email to ${visit.email}:`, error);
  }
};

type EmailEvent = "created" | "cancelled";

interface OrderEmailPayload {
  order: any;
  invoiceUrl: string;
  event: EmailEvent;
}

const getTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const fetchPdfAsBuffer = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
};

const buildHtmlTemplate = (order: any, event: EmailEvent): string => {
  const isCancel = event === "cancelled";

  const statusBadgeColor = isCancel ? "#e53e3e" : "#569863";
  const statusLabel = isCancel ? "ORDER CANCELLED" : "NEW ORDER PLACED";
  const headerTitle = isCancel ? "Order Cancellation Alert" : "New Order Notification";

  const paymentStatusLabel: Record<number, string> = {
    0: "Pending",
    1: "Paid",
    2: "Refund Initiated",
    3: "Refunded",
    4: "Failed",
  };

  const orderStatusLabel: Record<number, string> = {
    0: "Pending",
    1: "Confirmed",
    2: "Processing",
    3: "Shipped",
    4: "Delivered",
    5: "Cancelled",
  };

  const rows = [
    ["Order ID", order._id],
    ["Payment Method", order.paymentMethod ?? "-"],
    ["Payment Status", paymentStatusLabel[order.paymentStatus] ?? "-"],
    ["Order Status", orderStatusLabel[order.orderStatus] ?? "-"],
    ["Subtotal", `₹${order.subtotal}`],
    ["GST Amount", `₹${order.gstAmount}`],
    ["Shipping Charge", `₹${order.shippingCharge}`],
    ["Final Amount", `₹${order.finalAmount}`],
    ...(isCancel
      ? [
        ["Cancel Reason", order.cancelReason ?? "-"],
        ["Cancelled At", new Date(order.cancelledAt).toLocaleString("en-IN")],
        [
          "Refund Amount (70%)",
          `₹${((Number(order.finalAmount) * 70) / 100).toFixed(2)}`,
        ],
      ]
      : [
        [
          "Delivery Date",
          order.deliverySlot?.date
            ? new Date(order.deliverySlot.date).toDateString()
            : "-",
        ],
        ["Delivery Time", order.deliverySlot?.time ?? "-"],
      ]),
  ];

  const tableRows = rows
    .map(
      ([label, value], i) => `
      <tr style="background: ${i % 2 === 0 ? "#ffffff" : "#f9f9f9"};">
        <td style="padding: 10px 12px; font-weight: bold; color: #444; width: 40%;">${label}</td>
        <td style="padding: 10px 12px; color: #222;">${value}</td>
      </tr>`
    )
    .join("");

  const itemRows = (order.items ?? [])
    .map(
      (item: any, i: number) => `
      <tr style="background: ${i % 2 === 0 ? "#ffffff" : "#f9f9f9"};">
        <td style="padding: 8px 12px;">${item.name}</td>
        <td style="padding: 8px 12px; text-align:center;">${item.quantity} ${item.unitType ?? ""}</td>
        <td style="padding: 8px 12px; text-align:right;">₹${item.price}</td>
        <td style="padding: 8px 12px; text-align:right;">₹${item.totalPrice}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
      <div style="max-width: 620px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
 
        <!-- Header -->
        <div style="background: ${statusBadgeColor}; padding: 24px 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Yash Mawa Bhandar</h2>
          <span style="font-size: 12px; opacity: 0.85;">SINCE 1975</span>
          <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold;">${headerTitle}</p>
          <span style="
            display: inline-block;
            margin-top: 8px;
            padding: 4px 14px;
            background: rgba(255,255,255,0.25);
            border-radius: 20px;
            font-size: 12px;
            letter-spacing: 1px;
          ">${statusLabel}</span>
        </div>
 
        <!-- Order Details -->
        <div style="padding: 24px 20px;">
          <p style="font-size: 15px; color: #333;">
            ${isCancel ? "An order has been <strong>cancelled</strong> by the customer." : "A new order has been <strong>successfully placed</strong>."}
            Please review the details below.
          </p>
 
          <h3 style="color: #569863; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${tableRows}
          </table>
 
          <h3 style="color: #569863; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #569863; color: white;">
                <th style="padding: 10px 12px; text-align:left;">Product</th>
                <th style="padding: 10px 12px; text-align:center;">Qty</th>
                <th style="padding: 10px 12px; text-align:right;">Unit Price</th>
                <th style="padding: 10px 12px; text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
 
          ${isCancel
      ? `<div style="margin-top: 20px; padding: 14px; background: #fff5f5; border-left: 4px solid #e53e3e; border-radius: 4px;">
              <strong style="color:#e53e3e;">⚠ Refund Notice:</strong>
              A refund of <strong>₹${((Number(order.finalAmount) * 70) / 100).toFixed(2)}</strong>
              (70% of ₹${order.finalAmount}) has been initiated.
            </div>`
      : `<div style="margin-top: 20px; padding: 14px; background: #f1f8f3; border-left: 4px solid #569863; border-radius: 4px;">
              <strong style="color:#569863;">✓ Invoice Attached:</strong>
              The invoice PDF is attached to this email for your records.
            </div>`
    }
        </div>
 
        <!-- Footer -->
        <div style="background: #fafafa; padding: 15px 20px; text-align: center; font-size: 12px; color: #888;">
          <p style="margin: 0;">This is an automated notification from your website.</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Yash Mawa Bhandar · Legacy of Ramkumar Ratan Dairy</p>
        </div>
 
      </div>
    </div>
  `;
};

export const sendOrderEmailToAdmin = async ({
  order,
  invoiceUrl,
  event,
}: OrderEmailPayload): Promise<void> => {
  try {
    const transporter = getTransporter();

    const pdfBuffer = await fetchPdfAsBuffer(invoiceUrl);

    const isCancel = event === "cancelled";
    const subject = isCancel
      ? `Order Cancelled – #ORD-${order._id.slice(-4)}`
      : `New Order Placed – #ORD-${order._id.slice(-4)}`;

    await transporter.sendMail({
      from: `"Yash Mawa Bhandar" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: buildHtmlTemplate(order, event),
      attachments: [
        {
          filename: `invoice-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`[Email] Admin notified for order ${event}: ${order._id}`);
  } catch (error) {
    console.error(`[Email] Failed to send admin order email (${event}):`, error);
  }
};

export interface CustomerOrderStatusEmailPayload {
  order: any;
  userEmail: string;
  userName: string;
  status: number;
  cancelReason?: string;
}

export const sendOrderStatusEmailToCustomer = async ({
  order,
  userEmail,
  userName,
  status,
  cancelReason,
}: CustomerOrderStatusEmailPayload): Promise<void> => {
  try {
    if (!userEmail || userEmail === "N/A") {
      console.warn(`[Email] Skipping customer order status email: No valid user email for order ${order._id}`);
      return;
    }

    const transporter = getTransporter();

    let headerTitle = "Order Status Update";
    let statusLabel = "UPDATED";
    let badgeColor = "#569863";
    let statusMsg = "Your order status has been updated.";

    switch (status) {
      case 1: // CONFIRMED
        headerTitle = "Order Confirmed! 🎉";
        statusLabel = "CONFIRMED";
        badgeColor = "#2563eb";
        statusMsg = "Great news! Your order has been confirmed by Yash Mawa Bhandar and is being processed.";
        break;
      case 2: // PACKED
        headerTitle = "Order Packed & Ready! 📦";
        statusLabel = "PACKED";
        badgeColor = "#9333ea";
        statusMsg = "Your order has been carefully packed and is ready for dispatch.";
        break;
      case 3: // OUT_FOR_DELIVERY
        headerTitle = "Out For Delivery! 🚚";
        statusLabel = "OUT FOR DELIVERY";
        badgeColor = "#4f46e5";
        statusMsg = "Your order is out for delivery and will arrive at your specified delivery slot soon.";
        break;
      case 4: // DELIVERED
        headerTitle = "Order Delivered! ✅";
        statusLabel = "DELIVERED";
        badgeColor = "#16a34a";
        statusMsg = "Your order has been successfully delivered. We hope you enjoy your purchase! Thank you for choosing Yash Mawa Bhandar.";
        break;
      case 5: // CANCELLED
        headerTitle = "Order Cancelled ❌";
        statusLabel = "CANCELLED";
        badgeColor = "#dc2626";
        statusMsg = `Your order has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`;
        break;
      case 6: // REFUND
        headerTitle = "Refund Processed 💰";
        statusLabel = "REFUNDED";
        badgeColor = "#d97706";
        statusMsg = "A refund for your order has been processed.";
        break;
    }

    const orderIdDisplay = order._id ? order._id.toString() : String(order);
    const shortOrderId = orderIdDisplay.slice(-6).toUpperCase();
    const subject = `${headerTitle} – Order #${shortOrderId}`;

    const itemRows = (order.items ?? [])
      .map(
        (item: any, i: number) => `
        <tr style="background: ${i % 2 === 0 ? "#ffffff" : "#f9f9f9"};">
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px 12px; text-align:center; border-bottom: 1px solid #eee;">${item.quantity} ${item.unitType ?? ""}</td>
          <td style="padding: 10px 12px; text-align:right; border-bottom: 1px solid #eee;">₹${item.price}</td>
          <td style="padding: 10px 12px; text-align:right; border-bottom: 1px solid #eee; font-weight: bold;">₹${item.totalPrice}</td>
        </tr>`
      )
      .join("");

    const deliverySlotInfo = order.deliverySlot?.date
      ? `${order.deliverySlot.date} (${order.deliverySlot.time || ""})`
      : "-";

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
        <div style="max-width: 620px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background: ${badgeColor}; padding: 24px 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 22px;">Yash Mawa Bhandar</h2>
            <span style="font-size: 11px; opacity: 0.85; letter-spacing: 1px;">SINCE 1975 · LEGACY OF RAMKUMAR RATAN DAIRY</span>
            <p style="margin: 12px 0 4px; font-size: 20px; font-weight: bold;">${headerTitle}</p>
            <span style="
              display: inline-block;
              margin-top: 6px;
              padding: 4px 14px;
              background: rgba(255,255,255,0.25);
              border-radius: 20px;
              font-size: 12px;
              letter-spacing: 1px;
              font-weight: bold;
            ">${statusLabel}</span>
          </div>

          <!-- Body Content -->
          <div style="padding: 24px 20px;">
            <p style="font-size: 16px; color: #333; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
            <p style="font-size: 15px; color: #444; line-height: 1.6;">${statusMsg}</p>

            <h3 style="color: ${badgeColor}; border-bottom: 2px solid #eee; padding-bottom: 6px; margin-top: 24px; font-size: 16px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px 12px; font-weight: bold; color: #555; width: 40%;">Order ID</td>
                <td style="padding: 10px 12px; color: #222; font-family: monospace; font-weight: bold;">#${orderIdDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: bold; color: #555;">Final Amount</td>
                <td style="padding: 10px 12px; color: #222; font-weight: bold;">₹${order.finalAmount}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px 12px; font-weight: bold; color: #555;">Delivery Slot</td>
                <td style="padding: 10px 12px; color: #222;">${deliverySlotInfo}</td>
              </tr>
            </table>

            ${
              order.items && order.items.length > 0
                ? `<h3 style="color: ${badgeColor}; border-bottom: 2px solid #eee; padding-bottom: 6px; margin-top: 20px; font-size: 16px;">Items in Order</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                    <thead>
                      <tr style="background: ${badgeColor}; color: white;">
                        <th style="padding: 10px 12px; text-align:left;">Item</th>
                        <th style="padding: 10px 12px; text-align:center;">Qty</th>
                        <th style="padding: 10px 12px; text-align:right;">Price</th>
                        <th style="padding: 10px 12px; text-align:right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemRows}
                    </tbody>
                  </table>`
                : ""
            }

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
              If you have any questions regarding your order, feel free to reply to this email or contact customer service.
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #fafafa; padding: 15px 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Yash Mawa Bhandar · All Rights Reserved</p>
          </div>

        </div>
      </div>
    `;

    const attachments: any[] = [];
    if (order.invoiceUrl) {
      try {
        const pdfBuffer = await fetchPdfAsBuffer(order.invoiceUrl);
        attachments.push({
          filename: `invoice-${shortOrderId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        });
      } catch (pdfErr) {
        console.warn(`[Email] Could not attach invoice PDF for order ${orderIdDisplay}:`, pdfErr);
      }
    }

    await transporter.sendMail({
      from: `"Yash Mawa Bhandar" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: htmlTemplate,
      attachments,
    });

    console.log(`[Email] Customer order status email (${statusLabel}) sent to ${userEmail} for order ${orderIdDisplay}`);
  } catch (error) {
    console.error(`[Email Error] Failed to send customer order status email to ${userEmail}:`, error);
  }
};

export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<void> => {
  try {
    if (!userEmail) {
      console.warn(`[Email] Skipping welcome email: No user email provided`);
      return;
    }

    const transporter = getTransporter();
    const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background: #569863; padding: 24px 20px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px;">Yash Mawa Bhandar</h2>
            <span style="font-size: 11px; opacity: 0.85; letter-spacing: 1px;">SINCE 1975 · LEGACY OF RAMKUMAR RATAN DAIRY</span>
            <p style="margin: 12px 0 0; font-size: 18px; font-weight: bold;">Welcome to the Family! 🎉</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px 20px;">
            <p style="font-size: 16px; color: #333; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
            
            <p style="font-size: 15px; color: #444; line-height: 1.6;">
              Thank you for registering with <strong>Yash Mawa Bhandar</strong>! We are delighted to welcome you to our community of authentic mawa and pure dairy lovers.
            </p>

            <p style="font-size: 15px; color: #444; line-height: 1.6;">
              Your account has been successfully created. You can now explore our premium range of products, place orders online, and track your delivery seamlessly.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}" target="_blank" style="
                background-color: #569863;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 15px;
                display: inline-block;
              ">Explore Products Now</a>
            </div>

            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
              If you have any questions or need assistance, feel free to reply to this email or reach out to our customer support.
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #fafafa; padding: 15px 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Yash Mawa Bhandar · Legacy of Ramkumar Ratan Dairy</p>
          </div>

        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Yash Mawa Bhandar" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to Yash Mawa Bhandar! 🎉",
      html: htmlTemplate,
    });

    console.log(`[Email] Welcome email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`[Email Error] Failed to send welcome email to ${userEmail}:`, error);
  }
};
