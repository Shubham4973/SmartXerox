const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Order = require("../models/Order");
const PrintToken = require("../models/PrintToken");
const handleOrderNotification = require("../utils/handleOrderNotification");

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Middleware
function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// GET Upload Form
router.get("/upload", isLoggedIn, (req, res) => {
    res.render("orders/upload", { user: req.session.user });
});

// POST Upload & Place Order
router.post("/upload", isLoggedIn, upload.single("document"), async (req, res) => {
    const { color_mode, page_size, binding_option, copies } = req.body;
    const uploaded_file = req.file.filename;
    const numCopies = parseInt(copies);

    // ✅ Price logic
    let basePricePerCopy = {
        BW: 2, CL: 5, GREY: 3, HD: 8, DRAFT: 1.5, PHOTO: 10
    }[color_mode] || 2;

    let bindingCharges = {
        Stapled: 5, Spiral: 15, Hardbound: 30, Softcover: 20,
        Thermal: 25, "Ring Binder": 18, "Tape Binding": 10, "Wire-O": 22
    }[binding_option] || 0;

    const price = (basePricePerCopy * numCopies) + bindingCharges;

    try {
        const order = await Order.create({
            user: req.session.user._id,
            uploaded_file,
            copies: numCopies,
            color_mode,
            page_size,
            binding_option,
            price
        });

        await PrintToken.create({ order: order._id });

        // 🔔 Send notifications + emails
        await handleOrderNotification(req.session.user, order);

        res.redirect(`/orders/${order._id}`);
        // res.redirect(`/address/${order._id}/edit-or-add`);

    } catch (err) {
        res.status(400).render("orders/upload", {
            user: req.session.user,
            error: "Order creation failed: " + err.message
        });
    }
});

// GET Order Summary
router.get("/orders/:id", isLoggedIn, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user");
        const token = await PrintToken.findOne({ order: order._id });

        res.render("orders/order_summary", { order, token });
    } catch (err) {
        res.status(404).send("Order not found");
    }
});

module.exports = router;
