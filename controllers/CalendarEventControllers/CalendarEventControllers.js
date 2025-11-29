const { db } = require("../../config/DB-connection");
const { google } = require("googleapis");
const { getOAuthClient } = require("../../server/getoAuthClient");
const nodemailer = require("nodemailer");
const axios=require('axios')
// const


// const AddEvent = async (req, res) => {
//     try {
//         const eventData = req.body;
//         console.log(req.body);

//         const insertQuery = `
//             INSERT INTO calendar_events 
//             (event_name, date, event_type, location, org_id, from_time, to_time, guests)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         const values = [
//             eventData.title || null,                 // FIXED
//             eventData.eventDate || null,
//             eventData.type || null,
//             eventData.location || null,
//             "Hello",                                 // org_id
//             eventData.startTime || null,
//             eventData.endTime || null,
//             JSON.stringify(eventData.guests || [])   // FIXED
//         ];

//         const [results] = await db.execute(insertQuery, values);

//         res.json({ success: true, eventId: results.insertId });

//     } catch (error) {
//         console.error("Error inserting event:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const EVENT_COLORS = {
    Meetings: "#F87171",
    "Video calls": "#4ADE80",
    Tasks: "#C084FC",
    Deadlines: "#FDBA74",
    Followups: "#60A5FA",
    Personal: "#F472B6",
};

const GetEventsBasedOnMonthAndYear = async (req, res) => {
    try {
        const { month, year } = req.params;

        const sql = `
            SELECT *
            FROM calendar_events
            WHERE MONTH(date) = ?
            AND YEAR(date) = ?;
        `;

        const [rows] = await db.query(sql, [month, year]);

        // Parse JSON fields safely
        const cleaned = rows.map(event => ({
            ...event,
            guests: typeof event.guests === "string"
                ? JSON.parse(event.guests)
                : event.guests || []
        }));

        // Group by date
        const grouped = {};

        cleaned.forEach(ev => {
            const date = ev.date.split("T")[0];

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push({
                id: ev.id,
                label: ev.event_name,
                color: EVENT_COLORS[ev.event_type] || "bg-gray-300", // fallback
                count: 1,
                full_event: ev
            });
        });

        const formatted = Object.keys(grouped).map(date => ({
            date,
            events: grouped[date]
        }));

        return res.status(200).json({
            totalDays: formatted.length,
            data: formatted
        });

    } catch (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ message: "Database error" });
    }
};

// const AddEvent = async (req, res) => {
//     try {
//         console.log("EVENT RECEIVED:", req.body);
//         const eventData = req.body;
//         const { title, eventDate, type, location, startTime, endTime, guests } = eventData;

//         // 1️⃣ SAVE EVENT IN DATABASE (basic insert first)
//         const insertQuery = `
//             INSERT INTO calendar_events 
//             (event_name, date, event_type, location, org_id, from_time, to_time, guests)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         const values = [
//             title,
//             eventDate,
//             type,
//             location || "",
//             "Hello",
//             startTime,
//             endTime,
//             JSON.stringify(guests)
//         ];

//         const [result] = await db.execute(insertQuery, values);
//         const dbEventId = result.insertId;
//         console.log("DB INSERTED ID:", dbEventId);

//         // 2️⃣ IF NOT MEETING TYPE → SKIP GOOGLE CALENDAR
//         const isMeetingType = type === "Video calls" || type === "Meetings";

//         if (!isMeetingType) {
//             return res.json({
//                 success: true,
//                 eventId: dbEventId,
//                 meetLink: null
//             });
//         }

//         // 3️⃣ CHECK GOOGLE TOKENS
//         if (!global.googleTokens) {
//             return res.status(400).json({
//                 error: "Google Calendar is not connected. Please connect first."
//             });
//         }

//         const oauth2Client = getOAuthClient();
//         oauth2Client.setCredentials(global.googleTokens);
//         const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//         // 4️⃣ BUILD GOOGLE EVENT BODY
//         const startISO = new Date(eventDate).toISOString();
//         const endISO = new Date(
//             new Date(eventDate).getTime() + 30 * 60000
//         ).toISOString();

//         const googleEventBody = {
//             summary: title,
//             location: location || "",
//             description: "Event created from WON Platform.",
//             start: { dateTime: startISO, timeZone: "Asia/Kolkata" },
//             end: { dateTime: endISO, timeZone: "Asia/Kolkata" },
//             attendees: guests.map(g => ({ email: g.email })),
//             conferenceData: {
//                 createRequest: {
//                     requestId: "wonhub-" + Date.now(),
//                 }
//             }
//         };

//         // 5️⃣ INSERT EVENT INTO GOOGLE CALENDAR
//         let meetLink = "";
//         let googleEventId = null;

//         try {
//             const googleResp = await calendar.events.insert({
//                 calendarId: "primary",
//                 resource: googleEventBody,
//                 conferenceDataVersion: 1,
//                 sendUpdates: "none" // we send our own emails
//             });

//             googleEventId = googleResp.data.id;
//             meetLink =
//                 googleResp.data.hangoutLink ||
//                 googleResp.data.conferenceData?.entryPoints?.[0]?.uri ||
//                 "";

//             console.log("GOOGLE EVENT CREATED →", meetLink, "ID:", googleEventId);
//         } catch (err) {
//             console.log("Google Calendar Error:", err);
//         }

//         // 6️⃣ UPDATE DB WITH google_event_id + meet_link
//         await db.execute(
//             `UPDATE calendar_events 
//              SET google_event_id = ?, meet_link = ?
//              WHERE id = ?`,// i am asking at here from where  meeting is adding at here only 
//             [googleEventId, meetLink, dbEventId]
//         );

//         // 7️⃣ SEND EMAIL (your existing transporter)
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.ORG_EMAIL,
//                 pass: process.env.ORG_EMAIL_PASS
//             }
//         });

//         for (let guest of guests) {
//             const htmlBody = `
//                 <h2 style="color:#444;">You are invited to a new event!</h2>
//                 <p><strong>Event:</strong> ${title}</p>
//                 <p><strong>Date:</strong> ${eventDate}</p>
//                 <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
//                 ${meetLink
//                     ? `<p><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>`
//                     : ""
//                 }
//                 <br/>
//                 <p>Regards,<br/>WON Platform</p>
//             `;

//             await transporter.sendMail({
//                 from: process.env.ORG_EMAIL,
//                 to: guest.email,
//                 subject: `Invitation: ${title}`,
//                 html: htmlBody
//             });
//         }

//         // 8️⃣ FINAL SUCCESS RESPONSE

//         return res.json({
//             success: true,
//             eventId: dbEventId,
//             meetLink
//         });

//     } catch (error) {
//         console.log("FINAL ERROR:", error);
//         return res.status(500).json({ error: "Failed to create event" });
//     }
// };
// cancel event


const AddEvent = async (req, res) => {
    try {
        console.log("EVENT RECEIVED:", req.body);

        const {
            title,
            eventDate,
            type,
            location,
            startTime,
            endTime,
            guests,
            provider
        } = req.body;

        // 1️⃣ SAVE EVENT IN DATABASE (basic insert)
        const insertQuery = `
            INSERT INTO calendar_events 
            (event_name, date, event_type, location, org_id, from_time, to_time, guests)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            title,
            eventDate,
            type,
            location || "",
            "Hello",
            startTime,
            endTime,
            JSON.stringify(guests)
        ];

        const [result] = await db.execute(insertQuery, values);
        const dbEventId = result.insertId;
        console.log("DB INSERTED ID:", dbEventId);

        // 2️⃣ NO calendar integration for non-meeting types
        const isMeetingType = type === "Video calls" || type === "Meetings";

        if (!isMeetingType) {
            return res.json({
                success: true,
                eventId: dbEventId,
                meetLink: null
            });
        }

        // Universal Vars
        let meetLink = "";
        let googleEventId = null;
        let yahooEventId = null;

        const startISO = new Date(eventDate).toISOString();
        const endISO = new Date(
            new Date(eventDate).getTime() + 30 * 60000
        ).toISOString();

        // -------------------------------------------------------------------
        // 3️⃣ GOOGLE CALENDAR FLOW
        // -------------------------------------------------------------------
        if (provider === "google") {
            if (!global.googleTokens) {
                return res.status(400).json({ error: "Google is not connected." });
            }

            console.log("📌 Creating Google Calendar Event...");

            const oauth2Client = getOAuthClient();
            oauth2Client.setCredentials(global.googleTokens);

            const calendar = google.calendar({ version: "v3", auth: oauth2Client });

            const googleEventBody = {
                summary: title,
                location: location || "",
                description: "Event created from WON Platform",
                start: { dateTime: startISO, timeZone: "Asia/Kolkata" },
                end: { dateTime: endISO, timeZone: "Asia/Kolkata" },
                attendees: guests.map(g => ({ email: g.email })),
                conferenceData: {
                    createRequest: {
                        requestId: "wonhub-" + Date.now(),
                    }
                }
            };

            try {
                const googleResp = await calendar.events.insert({
                    calendarId: "primary",
                    resource: googleEventBody,
                    conferenceDataVersion: 1
                });

                googleEventId = googleResp.data.id;

                meetLink =
                    googleResp.data.hangoutLink ||
                    googleResp.data.conferenceData?.entryPoints?.[0]?.uri ||
                    "";

                console.log("GOOGLE EVENT CREATED →", googleEventId, meetLink);

            } catch (err) {
                console.log("GOOGLE ERROR:", err);
            }
        }

        // -------------------------------------------------------------------
        // 4️⃣ YAHOO CALENDAR FLOW
        // -------------------------------------------------------------------
        else if (provider === "yahoo") {
            if (!global.yahooTokens?.access_token) {
                return res.status(400).json({ error: "Yahoo is not connected." });
            }

            console.log("📌 Creating Yahoo Calendar Event...");

            try {
                const yahooResp = await axios.post(
                    "https://calendar.yahoo.com/ws/v3/calendars/events",
                    {
                        title,
                        start: startISO,
                        end: endISO,
                        location,
                        description: "Event created from WON Platform",
                        attendees: guests.map(g => g.email)
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${global.yahooTokens.access_token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                yahooEventId = yahooResp.data?.id;

                console.log("YAHOO EVENT CREATED →", yahooEventId);

            } catch (err) {

                console.log("YAHOO CALENDAR ERROR:", err.response?.data || err);
            }
        }

        // -------------------------------------------------------------------
        // 5️⃣ SAVE RESULTS (google_event_id, yahoo_event_id, meet_link)
        // -------------------------------------------------------------------
        await db.execute(
            `UPDATE calendar_events 
             SET google_event_id = ?, yahoo_event_id = ?, meet_link = ?
             WHERE id = ?`,
            [googleEventId, yahooEventId, meetLink, dbEventId]
        );

        // -------------------------------------------------------------------
        // 6️⃣ SEND EMAILS TO GUESTS
        // -------------------------------------------------------------------
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ORG_EMAIL,
                pass: process.env.ORG_EMAIL_PASS
            }
        });

        for (let guest of guests) {
            const htmlBody = `
                <h2 style="color:#444;">You are invited to a new event!</h2>
                <p><strong>Event:</strong> ${title}</p>
                <p><strong>Date:</strong> ${eventDate}</p>
                <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
                ${meetLink ? `<p><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ""}
                <br/>
                <p>Regards,<br/>WON Platform</p>
            `;

            await transporter.sendMail({
                from: process.env.ORG_EMAIL,
                to: guest.email,
                subject: `Invitation: ${title}`,
                html: htmlBody
            });
        }

        // -------------------------------------------------------------------
        // 7️⃣ FINAL RESPONSE
        // -------------------------------------------------------------------
        return res.json({
            success: true,
            eventId: dbEventId,
            googleEventId,
            yahooEventId,
            meetLink
        });

    } catch (error) {
        console.log("FINAL ERROR:", error);
        return res.status(500).json({ error: "Failed to create event" });
    }
};




const CancelEvent = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Cancel Event ID:", id);

        // 1️⃣ Fetch event
        const [rows] = await db.execute(
            "SELECT * FROM calendar_events WHERE id = ?",
            [id]
        );

        // console.log(rows, "rows hereee");

        if (rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        const event = rows[0];

        // 2️⃣ Safe JSON parsing
        let guests = [];
        try {
            if (typeof event.guests === "string") {
                guests = JSON.parse(event.guests);
            } else if (Array.isArray(event.guests)) {
                guests = event.guests;
            } else {
                guests = [];
            }
        } catch (e) {
            console.log("⚠️ Could not parse guests:", e);
            guests = [];
        }

        // 3️⃣ Cancel Google event
        if (event.google_event_id && global.googleTokens) {
            try {
                const oauth2Client = getOAuthClient();
                oauth2Client.setCredentials(global.googleTokens);
                const calendar = google.calendar({ version: "v3", auth: oauth2Client });

                await calendar.events.delete({
                    calendarId: "primary",
                    eventId: event.google_event_id,
                    sendUpdates: "all"
                });

                console.log("Google Calendar event deleted:", event.google_event_id);
            } catch (err) {
                console.log("Google Delete Error:", err);
            }
        }

        // 4️⃣ Update DB status
        await db.execute(
            `UPDATE calendar_events SET status = 'cancelled' WHERE id = ?`,
            [id]
        );

        // 5️⃣ Send cancellation emails
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ORG_EMAIL,
                pass: process.env.ORG_EMAIL_PASS
            }
        });

        for (let guest of guests) {
            await transporter.sendMail({
                from: process.env.ORG_EMAIL,
                to: guest.email,
                subject: `Event Cancelled: ${event.event_name}`,
                html: `
                    <h2 style="color:#c00;">Event Cancelled</h2>
                    <p><strong>Event:</strong> ${event.event_name}</p>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Status:</strong> Cancelled by organiser.</p>
                    <br/>
                    <p>Regards,<br/>WON Platform</p>
                `
            });
        }
        console.log("Cancellation emails sent.");
        return res.json({ success: true, message: "Event cancelled successfully" });

    } catch (error) {
        console.log("Cancel Event Error:", error);
        res.status(500).json({ error: "Failed to cancel event" });
    }
};
//reschedule evenet
const RescheduleEvent = async (req, res) => {
    console.log("Triggering by gods grace");
    try {
        const { id } = req.params;            // 🔥 FIXED duplicate variable error
        const { newDate, newStartTime, newEndTime } = req.body;

        console.log("RESCHEDULE EVENT:", req.body);

        // --------------------------------------------------------
        // 1️⃣ FETCH EXISTING EVENT
        // --------------------------------------------------------
        const [rows] = await db.execute(
            "SELECT * FROM calendar_events WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = rows[0];
        console.log("EVENT:", event);

        // Safe Parse Guests
        let guests = [];
        try {
            guests = JSON.parse(event.guests || "[]");
        } catch {
            guests = [];
        }

        // --------------------------------------------------------
        // 2️⃣ DATE & TIME HANDLING
        // If user selects only newDate → keep the old time
        // --------------------------------------------------------

        const finalStartTime = newStartTime || event.from_time;
        const finalEndTime = newEndTime || event.to_time;

        // Combine new date + old time → convert to ISO
        const parseToISO = (dateStr, timeStr) => {
            const date = new Date(dateStr);
            let [time, modifier] = timeStr.split(/(am|pm)/i);
            let [hours, minutes] = time.split(":");

            hours = parseInt(hours);
            minutes = parseInt(minutes);

            if (modifier.toLowerCase() === "pm" && hours !== 12) {
                hours += 12;
            }
            if (modifier.toLowerCase() === "am" && hours === 12) {
                hours = 0;
            }

            date.setHours(hours, minutes, 0);
            return date.toISOString();
        };

        const newStartISO = parseToISO(newDate, finalStartTime);
        const newEndISO = parseToISO(newDate, finalEndTime);

        // --------------------------------------------------------
        // 3️⃣ UPDATE EVENT IN DATABASE
        // --------------------------------------------------------
        await db.execute(
            `UPDATE calendar_events 
             SET date = ?, from_time = ?, to_time = ?, status = 'rescheduled'
             WHERE id = ?`,
            [newDate, finalStartTime, finalEndTime, id]
        );

        console.log("DB updated successfully");

        // --------------------------------------------------------
        // 4️⃣ UPDATE GOOGLE CALENDAR EVENT (if available)
        // --------------------------------------------------------
        if (event.google_event_id && global.googleTokens) {
            try {
                const oauth2Client = getOAuthClient();
                oauth2Client.setCredentials(global.googleTokens);

                const calendar = google.calendar({ version: "v3", auth: oauth2Client });

                await calendar.events.patch({
                    calendarId: "primary",
                    eventId: event.google_event_id,
                    sendUpdates: "all",
                    resource: {
                        start: { dateTime: newStartISO, timeZone: "Asia/Kolkata" },
                        end: { dateTime: newEndISO, timeZone: "Asia/Kolkata" },
                        description: `Event rescheduled via WON Platform`
                    }
                });

                console.log("Google Calendar event updated");
            } catch (err) {
                console.log("Google Calendar Update Error:", err);
            }
        }

        // --------------------------------------------------------
        // 5️⃣ SEND EMAIL TO GUESTS
        // --------------------------------------------------------
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.ORG_EMAIL,
                pass: process.env.ORG_EMAIL_PASS
            }
        });

        for (let guest of guests) {
            const htmlBody = `
                <h2 style="color:#1a73e8;">Event Rescheduled</h2>

                <p style="font-size:15px;">
                    <strong>Previous Schedule:</strong><br/>
                    <span style="text-decoration: line-through; color:#777;">
                        ${event.event_name}<br/>
                        ${event.date}<br/>
                        ${event.from_time} - ${event.to_time}
                    </span>
                </p>

                <p style="font-size:15px; margin-top:10px;">
                    <strong>New Schedule:</strong><br/>
                    <span style="color:#1a73e8; font-weight:bold;">
                        ${event.event_name}<br/>
                        ${newDate}<br/>
                        ${finalStartTime} - ${finalEndTime}
                    </span>
                </p>

                ${event.meet_link
                    ? `<p><strong>Meeting Link:</strong> 
                           <a href="${event.meet_link}">${event.meet_link}</a></p>`
                    : ""
                }

                <br/>
                <p>Regards,<br/>WON Platform</p>
            `;

            await transporter.sendMail({
                from: process.env.ORG_EMAIL,
                to: guest.email,
                subject: `Event Rescheduled: ${event.event_name}`,
                html: htmlBody
            });
        }

        // --------------------------------------------------------
        // 6️⃣ FINAL RESPONSE
        // --------------------------------------------------------
        return res.json({
            success: true,
            message: "Event rescheduled successfully"
        });

    } catch (error) {
        console.log("Reschedule Event Error:", error);
        return res.status(500).json({ error: "Failed to reschedule event" });
    }
};


module.exports = {
    AddEvent,
    GetEventsBasedOnMonthAndYear,
    CancelEvent,
    RescheduleEvent
};