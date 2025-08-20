const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
require("dotenv").config();
const session = require('express-session');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


app.use(session({
    secret: 'yourSecretKeyHere',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true only if using HTTPS
}));

// DB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartxerox")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads")); // Expose uploaded files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/order");
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');




app.use(authRoutes);
app.use(orderRoutes);
app.use("/", dashboardRoutes);
app.use("/payment", paymentRoutes);
app.use('/admin', adminRoutes);

app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
