const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// Checkout Session (POST method)

router.post('/create-checkout-session/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).send('Order not found');

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'SmartXerox Print Order' },
                    unit_amount: order.price * 100,
                },
                quantity: 1,
            }],
            success_url: `${process.env.BASE_URL}/payment/success/${order._id}`,
            cancel_url: `${process.env.BASE_URL}/dashboard`,
        });

        res.redirect(303, session.url);
    } catch (err) {
        console.error('Stripe session error:', err);
        res.status(500).send('Stripe session failed');
    }
});

// Update payment_status
router.get('/success/:orderId', async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.orderId, { payment_status: 'Paid' });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Payment update failed');
    }
});

//COD Payment Route (POST method)
router.post('/cod/:orderId', async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.orderId, { payment_status: 'COD' });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('COD update failed');
    }
});

module.exports = router;