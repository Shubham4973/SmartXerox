
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Middleware to check login
function isLoggedIn(req, res, next) {
    if (!req.session.user) return res.redirect("/login");
    next();
}

router.get('/about', (req, res) => {
    res.render('about');
});

// GET /dashboard
router.get("/dashboard", isLoggedIn, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user._id }).sort({ created_at: -1 });
        res.render("users/dashboard", { user: req.session.user, orders });
    } catch (err) {
        res.status(500).send("Something went wrong while loading the dashboard.");
    }
});

module.exports = router;
