const nodemailer = require("nodemailer");

const sendExportEmail = async (req, res) => {
    try {
        const { email, rows } = req.body;

        if (!rows || !Array.isArray(rows) || rows.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Invalid row format. Need at least 3 rows."
            });
        }

        const tab1 = rows[2]?.column2 || "";
        const tab2 = rows[0]?.column2 || "";
        const tab3 = rows[1]?.column2 || "";
        const tableDataRows = rows.slice(3); // skip first 3

        const tableHtmlRows = tableDataRows
            .map(
                (r) => `
                    <tr>
                        <td style="padding:10px; font-weight:bold;">${r.column1}</td>
                        <td style="padding:10px;">${r.column2}</td>
                    </tr>`
            )
            .join("");

      
        const tableHtml = `
        <div style="font-family:Arial, Helvetica, sans-serif; padding:14px;">

            <h2 style="color:#00215B; font-size:20px; font-weight:bold; margin-bottom:10px;">
                Exported Details Summary
            </h2>

            <!-- Navigation Tabs -->
            <div style="margin-bottom:20px; font-size:14px;">
                <p style="margin:0 0 6px 0;">Below are the details for this record along with navigation history:</p>
                
                <div style="font-weight:bold; color:#00215B; font-size:15px;">
                    ${tab1} → ${tab2} → ${tab3}
                </div>
            </div>

            <!-- Responsive Table -->
            <div style="overflow-x:auto; width:100%;">

                <table border="1" cellpadding="8" cellspacing="0"
                    style="border-collapse:collapse; width:100%; font-size:14px; min-width:300px;">

                    <thead>
                        <tr style="background:#00215B; color:#fff; text-align:left;">
                            <th style="padding:10px;">Field</th>
                            <th style="padding:10px;">Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${tableHtmlRows}
                    </tbody>

                </table>

            </div>
        </div>
        `;

    
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                // user: process.env.ORG_EMAIL,
                // pass: process.env.ORG_EMAIL_PASS
                user: process.env.email,
                pass: process.env.email_pass
            }
        });

     
        await transporter.sendMail({
            // from: process.env.ORG_EMAIL,
            from: process.env.email,
            to: email||`sandhya.chattu@nowitservices.com`,
            subject: "Your Exported Data (Tab Details + History)",
            html: tableHtml
        });

        return res.json({ success: true, message: "Email sent successfully" });

    } catch (err) {
        console.error("❌ Error sending email:", err);
        return res.status(500).json({
            success: false,
            message: "Server error when sending email"
        });
    }
};

module.exports = { sendExportEmail };
