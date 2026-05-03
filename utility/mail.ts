import nodemailer from "nodemailer";

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