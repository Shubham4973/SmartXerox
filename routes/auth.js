const express = require("express");
const router = express.Router();
const User = require("../models/User");


// GET Register
router.get("/register", (req, res) => {
    res.render("auth/register");
});

// POST Register
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email, password });
        await user.save();
        res.redirect("/login");
    } catch (err) {
        res.status(400).send("User registration failed: " + err.message);
    }
});

// GET Login
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// POST Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.send("Invalid credentials");
    }

    req.session.user = user;

    if (user.is_admin) {
        res.redirect("/admin/dashboard");
    } else {
        res.redirect("/upload");
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.render("home.ejs");
    });
});

module.exports = router;