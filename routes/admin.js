const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const isAdmin = require("../middlewares/isAdmin");
const handleOrderNotification = require('../utils/handleOrderNotification');

// 📊 Admin Dashboard with Analytics & Filters
router.get("/dashboard", isAdmin, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const orders = await Order.find(filter).populate("user");

        const allOrders = await Order.find();

        const totalRevenue = allOrders.reduce((sum, order) =>
            (order.payment_status === 'Paid' || order.payment_status === 'COD') ? sum + order.price : sum, 0);

        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(o => o.status === "Pending").length;
        const completedOrders = allOrders.filter(o => o.status === "Completed").length;

        // 📊 Pie Chart Data
        const statusCountsMap = {};
        allOrders.forEach(order => {
            statusCountsMap[order.status] = (statusCountsMap[order.status] || 0) + 1;
        });

        const statusLabels = Object.keys(statusCountsMap);
        const statusCounts = Object.values(statusCountsMap);

        // 📈 Revenue Bar Chart (Group by date)
        const revenueMap = {};
        allOrders.forEach(order => {
            if (order.payment_status === 'Paid' || order.payment_status === 'COD') {
                const date = order.createdAt.toISOString().slice(0, 10);
                revenueMap[date] = (revenueMap[date] || 0) + order.price;
            }
        });

        const revenueDates = Object.keys(revenueMap).sort();
        const revenueAmounts = revenueDates.map(date => revenueMap[date]);

        const analytics = {
            totalRevenue,
            totalOrders,
            pendingOrders,
            completedOrders,
            statusLabels,
            statusCounts,
            revenueDates,
            revenueAmounts
        };

        res.render("admin/dashboard", { orders, analytics });

    } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).send("Failed to load admin dashboard.");
    }
});

// ✅ Update Order Status
router.post('/update-status/:orderId', isAdmin, async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        await Order.findByIdAndUpdate(orderId, { status });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Status update failed:', err);
        res.status(500).send('Server error');
    }
});

// ✅ Admin Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Logout error:", err);
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/login');
    });
});

module.exports = router;
