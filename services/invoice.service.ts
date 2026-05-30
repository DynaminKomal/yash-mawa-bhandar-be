import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import Address from "../models/address.model";
import { orderStatusEnum, paymentStatusEnum } from "../types/order.enum";

const BLUE = "#4a74a5";
const TEXT = "#222222";
const LIGHT = "#666666";
const BORDER = "#d9d9d9";

const PAGE_HEIGHT = 841.89;
const MARGIN = 40;

const formatCurrency = (amount: number) => {
    return Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const amountInWords = (amount: number) => {
    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
        "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
        "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const convert = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand " + convert(n % 1000);
        if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh " + convert(n % 100000);
        return "";
    };

    return convert(Math.floor(amount)).trim() + " Rupees Only";
};

export const generateInvoicePdf = async (order: any) => {
    return new Promise<{ url: string; public_id: string }>(
        async (resolve, reject) => {
            try {
                const address = await Address.findById(order.deliveryAddress);
                if (!address) throw new Error("Address not found");

                const safeOrderId = String(order._id).trim().replace(/\s+/g, "-");

                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }

                const filePath = path.join(tempDir, `invoice-${safeOrderId}.pdf`);
                const doc = new PDFDocument({ size: "A4", margin: MARGIN });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                const regularFont = path.join(process.cwd(), "fonts", "NotoSans-Regular.ttf");
                const boldFont = path.join(process.cwd(), "fonts", "NotoSans-Bold.ttf");
                doc.registerFont("Regular", regularFont);
                doc.registerFont("Bold", boldFont);

                const logoUrl = "https://res.cloudinary.com/dtxcauhav/image/upload/v1780075023/logo_heqxao.png";
                const logoResponse = await fetch(logoUrl);
                const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());

                const invoiceNo = `INV-${safeOrderId.slice(-6).toUpperCase()}`;
                const taxableAmount = order.subtotal || 0;
                const gstAmount = order.gstAmount || 0;
                const grandTotal = order.finalAmount || 0;
                const invoiceDate = formatDate(order.createdAt);

                const isPaid =
                    order.paymentStatus === paymentStatusEnum.PAID ||
                    order.orderStatus === orderStatusEnum.CONFIRMED;
                const isCancelled = order.orderStatus === orderStatusEnum.CANCELLED;
                const isRefund =
                    order.orderStatus === orderStatusEnum.REFUND

                const billingAddress = [
                    address.addressLine1,
                    address.addressLine2,
                    address.city,
                    address.state,
                    address.pincode,
                ]
                    .filter(Boolean)
                    .join(", ");

                const signaturePath = path.join(process.cwd(), "public", "signature.png");

                /**
                 * Draw the correct watermark based on order status.
                 * Priority: CANCELLED > REFUND > PAID
                 * Each is drawn independently with its own color.
                 */
                const drawWatermark = () => {
                    if (isCancelled) {
                        doc.save();
                        doc.rotate(-35, { origin: [300, 420] });
                        doc.font("Bold").fontSize(72).fillColor("#f5c6c6").opacity(0.55);
                        doc.text("CANCELLED", 60, 340);
                        doc.restore();
                        return;
                    }

                    if (isRefund) {
                        doc.save();
                        doc.rotate(-35, { origin: [300, 420] });
                        doc.font("Bold").fontSize(82).fillColor("#f0e2d8").opacity(0.55);
                        doc.text("REFUNDED", 90, 340);
                        doc.restore();
                        return;
                    }

                    if (isPaid) {
                        doc.save();
                        doc.rotate(-35, { origin: [300, 420] });
                        doc.font("Bold").fontSize(90).fillColor("#d8f0dd").opacity(0.55);
                        doc.text("PAID", 150, 340);
                        doc.restore();
                    }
                };

                // ── Draw page header (logo, business info, invoice meta, customer) ─
                const drawHeader = () => {
                    drawWatermark();

                    doc.font("Bold").fontSize(12).fillColor(BLUE).text("TAX INVOICE", 40, 30);
                    doc.font("Bold").fontSize(20).fillColor(TEXT).text("YASH MAWA BHANDAR", 40, 52);

                    doc.font("Regular")
                        .fontSize(9)
                        .fillColor(TEXT)
                        .text(`GSTIN ${process.env.GST_NUMBER || "-"}`, 40, 82)
                        .text("Near Shiv Mandir, Tyodhi", 40, 96)
                        .text("Delhi Saharanpur Highway, Bagpat, UTTAR PRADESH, 250611", 40, 110)
                        .text(`Mobile +91 ${process.env.CONTACT_NUMBER || "-"}`, 40, 124);

                    doc.image(logoBuffer, 430, 30, { width: 100 });

                    doc.font("Bold").fontSize(10).text(`Invoice #: ${invoiceNo}`, 40, 165);
                    doc.text(`Invoice Date: ${invoiceDate}`, 220, 165);
                    doc.text(`Due Date: ${invoiceDate}`, 410, 165);

                    // Show cancellation date on invoice if cancelled
                    if (isCancelled && order.cancelledAt) {
                        doc.font("Regular")
                            .fontSize(9)
                            .fillColor("#cc0000")
                            .text(
                                `Cancelled On: ${formatDate(order.cancelledAt)}`,
                                40,
                                145
                            )
                            .fillColor(TEXT);
                    }

                    doc.font("Bold").fontSize(10).text("Customer Details:", 40, 205);
                    doc.font("Regular")
                        .fontSize(9)
                        .text(address.fullName || "Customer", 40, 223)
                        .text(billingAddress, 40, 238, { width: 180 })
                        .text(`Place Of Supply: ${address.state}`, 40, 300);

                    doc.font("Bold").fontSize(10).text("Billing Address:", 250, 205);
                    doc.font("Regular").fontSize(9).text(billingAddress, 250, 223, { width: 220 });
                };

                const drawTableHeader = (top: number) => {
                    doc.moveTo(40, top).lineTo(555, top).strokeColor(BLUE).stroke();

                    const headers = ["#", "Item", "Rate / Item", "Qty", "Taxable Value", "Tax Amount", "Amount"];
                    const positions = [45, 70, 250, 330, 380, 455, 520];

                    doc.font("Bold").fontSize(8).fillColor(TEXT);
                    headers.forEach((h, i) => doc.text(h, positions[i], top + 8));

                    doc.moveTo(40, top + 24).lineTo(555, top + 24).strokeColor(BORDER).stroke();

                    return top + 32;
                };

                // ── Page 1: header + table ────────────────────────────────────────
                drawHeader();
                let y = drawTableHeader(350);
                let totalQty = 0;

                for (let index = 0; index < order.items.length; index++) {
                    const item = order.items[index];
                    totalQty += item.quantity;

                    const rowHeight = 38;

                    if (y + rowHeight + 180 > PAGE_HEIGHT) {
                        doc.addPage();
                        drawHeader();
                        y = drawTableHeader(80);
                    }

                    const taxPercent = item.gst || 5;
                    const taxable = item.price * item.quantity;
                    const taxAmount = (taxable * taxPercent) / 100;
                    const total = taxable + taxAmount;

                    doc.font("Regular").fontSize(8).fillColor(TEXT);
                    doc.text(String(index + 1), 45, y);
                    doc.text(item.name, 70, y);
                    doc.fillColor(LIGHT).fontSize(7).text(`HSN: ${item.hsnCode || "0402"}`, 70, y + 12);
                    doc.fillColor(TEXT).fontSize(8).text(formatCurrency(item.price), 250, y);
                    doc.text(String(item.quantity), 330, y);
                    doc.text(`₹${formatCurrency(taxable)}`, 380, y);
                    doc.text(`₹${formatCurrency(taxAmount)} (${taxPercent}%)`, 455, y);
                    doc.font("Bold").text(`₹${formatCurrency(total)}`, 520, y);

                    doc.moveTo(40, y + 28).lineTo(555, y + 28).strokeColor("#efefef").stroke();
                    y += 38;
                }

                y += 20;

                // ── Totals block ──────────────────────────────────────────────────
                if (y + 100 > PAGE_HEIGHT) {
                    doc.addPage();
                    drawHeader();
                    y = drawTableHeader(80);
                }

                doc.font("Bold").fontSize(9).text("Taxable Amount", 380, y);
                doc.text(`₹${formatCurrency(taxableAmount)}`, 500, y);
                y += 18;

                doc.text("IGST 5%", 380, y);
                doc.text(`₹${formatCurrency(gstAmount)}`, 500, y);
                y += 22;

                doc.fontSize(13).text("Total", 380, y);
                doc.text(`₹${formatCurrency(grandTotal)}`, 500, y);
                y += 35;

                doc.moveTo(40, y).lineTo(555, y).strokeColor(BLUE).stroke();
                y += 10;

                doc.font("Regular")
                    .fontSize(8)
                    .text(`Total Items / Qty : ${order.items.length} / ${totalQty}`, 40, y);

                doc.text(
                    `Total amount (in words): INR ${amountInWords(grandTotal)}`,
                    170,
                    y,
                    { width: 250 }
                );
                y += 26;

                doc.font("Bold").fontSize(11).text("Amount Payable:", 380, y);
                doc.text(`₹${formatCurrency(grandTotal)}`, 500, y);
                y += 30;

                // ── Cancellation reason block (only for cancelled orders) ───────
                if (isCancelled && order.cancelReason) {
                    if (y + 40 > PAGE_HEIGHT - MARGIN) {
                        doc.addPage();
                        drawHeader();
                        y = MARGIN + 20;
                    }
                    doc.font("Bold").fontSize(9).fillColor("#cc0000").text("Cancellation Reason:", 40, y);
                    doc.font("Regular").fontSize(8).fillColor(TEXT).text(order.cancelReason, 170, y, { width: 350 });
                    y += 30;
                }

                // ── Refund info block (only for cancelled + refund orders) ───────
                if (isCancelled || isRefund) {
                    const refundAmount = (grandTotal * 70) / 100;
                    if (y + 30 > PAGE_HEIGHT - MARGIN) {
                        doc.addPage();
                        drawHeader();
                        y = MARGIN + 20;
                    }
                    doc.font("Bold").fontSize(9).fillColor("#1a7f37").text("Refund Amount (70%):", 40, y);
                    doc.text(`₹${formatCurrency(refundAmount)}`, 170, y);
                    doc.font("Regular").fontSize(8).fillColor(TEXT);
                    y += 20;
                }

                // ── Footer block ──────────────────────────────────────────────────
                const FOOTER_HEIGHT = 190;

                if (y + FOOTER_HEIGHT > PAGE_HEIGHT - MARGIN) {
                    doc.addPage();
                    y = MARGIN + 20;
                }

                doc.font("Bold").fontSize(10).text("For YASH MAWA BHANDAR", 390, y);
                y += 18;

                if (fs.existsSync(signaturePath)) {
                    doc.image(signaturePath, 410, y, { width: 100 });
                }
                y += 55;

                doc.font("Regular").fontSize(8).text("Authorized Signatory", 405, y);
                y += 28;

                doc.font("Regular")
                    .fontSize(14)
                    .text("Thank You for Shopping with Yash Mawa Bhandar!", 40, y);
                y += 28;

                doc.font("Bold").fontSize(9).text("Terms and Conditions:", 40, y);
                y += 14;

                doc.font("Regular")
                    .fontSize(8)
                    .text(
                        "Goods once sold will not be taken back. Please check your order at the time of delivery. This is a computer-generated invoice and does not require a signature.",
                        40,
                        y,
                        { width: 500 }
                    );

                doc.end();

                stream.on("finish", async () => {
                    try {
                        const upload = await cloudinary.uploader.upload(filePath, {
                            resource_type: "raw",
                            folder: "yash-mawa-bhandar/invoices",
                            public_id: `invoice-${safeOrderId}`,
                            format: "pdf",
                            overwrite: true,
                            invalidate: true,
                        });

                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                        resolve({ url: upload.secure_url, public_id: upload.public_id });
                    } catch (error) {
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        reject(error);
                    }
                });

                stream.on("error", reject);
            } catch (error) {
                reject(error);
            }
        }
    );
};