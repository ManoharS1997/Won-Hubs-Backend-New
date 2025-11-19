const nodemailer = require("nodemailer");
console.log("Triggering in Email Controller")

const sendExportEmail = async (req, res) => {
    console.log(req.body,"req.body in email controller")
   
    try {

        const { email, rows } = req.body;

        // Basic Validation
        if (!email || !rows || !Array.isArray(rows)) {
            return res.status(400).json({
                success: false,
                message: "Email or data rows missing",
            });
        }

        const tableHtml = `
      <h2 style="font-family:Arial; color:#00215B;">Exported Details Summary</h2>

      <p style="font-family:Arial; font-size:14px;">
        Below are the details for the selected tab, along with the previously visited
        <b>Tab → Sub Tab → Inner Tab</b> navigation context.
      </p>

      <table border="1" cellpadding="8" cellspacing="0" 
             style="border-collapse: collapse; width:100%; font-family:Arial; font-size:13px;">
        <thead>
          <tr style="background:#00215B; color:#fff; text-align:left;">
            <th style="padding:6px;">Field</th>
            <th style="padding:6px;">Value</th>
          </tr>
        </thead>

        <tbody>
          ${rows
                .map(
                    (r) => `
            <tr>
              <td style="padding:6px; font-weight:bold;">${r.column1}</td>
              <td style="padding:6px;">${r.column2}</td>
            </tr>`
                )
                .join("")}
        </tbody>
      </table>
    `;

       
        const transporter = nodemailer.createTransport({
            service: "gmail", // You can switch to SMTP below
            auth: {
                user: `sandhyachattu@gmail.com`, // Your email
                pass: process.env.ORG_EMAIL_PASS, // App password or SMTP password
            },
        });

        await transporter.sendMail({
            from: `sandhyachattu@gmail.com`,
            to: `sandhya.chattu@nowitservices.com`,
            subject: "Your Exported Data (Tab Details + History)",
            html: tableHtml,
        });

        // Success Response
        return res.json({ success: true, message: "Email sent successfully" });

    } catch (err) {
        console.log(err,"err")
        console.error("❌ Error sending email:", err);
        return res.status(500).json({
            success: false,
            message: "Server error when sending email",
        });
    }
};
module.exports = {
    sendExportEmail,
};