const mongoose = require("mongoose");
const generateToken = () => {
    return Array(7)
        .fill(null)
        .map(() => Math.random().toString(36).charAt(2).toUpperCase())
        .join('');
};

const printTokenSchema = new mongoose.Schema({
    token: { type: String, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    is_printed: { type: Boolean, default: false },
    generated_at: { type: Date, default: Date.now }
});

// Auto-generate token
printTokenSchema.pre("save", function (next) {
    if (!this.token) {
        this.token = generateToken();
    }
    next();
});

module.exports = mongoose.model("PrintToken", printTokenSchema);
