const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploaded_file: { type: String, required: true },
    copies: { type: Number, default: 1 },
    color_mode: {
        type: String,
        enum: ["BW", "CL", "GREY", "HD", "DRAFT", "PHOTO"],
        required: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    page_size: {
        type: String,
        enum: ["A4", "A3", "A5", "Letter", "Legal", "Executive", "B5", "Tabloid"],
        required: true
    },
    binding_option: {
        type: String,
        enum: [
            "None", "Stapled", "Spiral", "Hardbound", "Softcover",
            "Thermal", "Ring Binder", "Tape Binding", "Wire-O"
        ],
        default: "None"
    },
    status: { type: String, default: "Pending" },
    price: { type: Number, required: true },
    payment_status: {
        type: String,
        enum: ['Pending', 'Paid', 'COD'],
        default: 'Pending'
    },

}, { timestamps: true }); // ✅ This adds createdAt and updatedAt automatically

module.exports = mongoose.model("Order", orderSchema);
