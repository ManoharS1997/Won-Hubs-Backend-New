// const { createRecord, sendNotification } = require('./utils'); // Assuming utility functions for DB and notifications

/**
 * Monitors and processes a new ticket to determine if it's critical.
 * @param {Object} ticket - The ticket data.
 */
function monitorTicket(ticket) {
    try {
        // Check if the ticket is critical
        const isCritical = isCriticalTicket(ticket);
        console.log('isCritical:', isCritical)

        if (isCritical) {
            console.log(`Critical ticket detected: ${ticket.name}`);

            // Create an alert for the critical ticket
            const alert = {
                type: 'CRITICAL_TICKET',
                message: `Critical ticket raised: ${ticket.title}`,
                details: ticket.description,
                timestamp: new Date(),
                status: 'ACTIVE',
                relatedTicketId: ticket.id,
            };

            // Save the alert in the database
            // await createRecord('alerts', alert);

            // Optionally send a notification
            // await sendNotification(alert);

            // console.log('Critical alert created and notification sent.');
            if (ticket.approval_state) {
                return { isCritical: true, alert: alert, approvalStatus: ticket.approval_state }
            }
            return { isCritical: true, alert: alert }
        } else {
            console.log(`Ticket is not critical: ${ticket.name}`);
            return { err: 'not critical' }
        }
    } catch (error) {
        console.error('Error monitoring ticket:', error);
    }
}

/**
 * Determines if a ticket qualifies as critical.
 * @param {Object} ticket - The ticket data.
 * @returns {boolean} - True if the ticket is critical, otherwise false.
 */
function isCriticalTicket(ticket) {
    // Define conditions for a critical ticket
    const criticalConditions = [
        ticket.priority === '1',
        // ticket.approval_state === 'true',
        // ticket.urgency === 'High',
        // ticket.created_on >= ticket.solution_due_date
    ];

    console.log('critical conditions: ', criticalConditions)

    // Return true if all conditions are met
    return criticalConditions.every((condition) => condition);
}

module.exports = monitorTicket;
