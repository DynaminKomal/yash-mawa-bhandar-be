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