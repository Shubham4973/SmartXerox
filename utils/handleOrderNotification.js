const sendMail = require('./sendMail');
const Notification = require('../models/Notification');

const handleOrderNotification = async (user, order) => {
    try {
        await Notification.create({
            message: `New order by ${user.username}`,
            type: 'order'
        });

        await sendMail(user.email, "Order Received - SmartXerox", `
      <h2>Hello ${user.username},</h2>
      <p>Your order has been placed. We’ll notify you when it’s printed or dispatched.</p>
    `);

        await sendMail("shubham970976@gmail.com", "New Order Alert", `
      <p>New order from ${user.username}. Total: ₹${order.price}</p>
    `);
    } catch (err) {
        console.error("Notification/email error:", err.message);
    }
};

module.exports = handleOrderNotification;
