import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

router.post('/create-order', async (req, res) => {
    // No keys configured — return error
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
        return res.status(400).json({ success: false, error: "Razorpay credentials are missing in backend .env" });
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        });

        const options = {
            amount: 4900, // ₹49 in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error("Payment Order Error:", error?.error || error.message);
        res.status(500).json({ success: false, error: error?.error?.description || error.message || "Failed to create Razorpay order" });
    }
});

router.post('/verify-signature', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // For sandbox/demo if no secret or falling back to mock payment
    if (!process.env.RAZORPAY_SECRET || (razorpay_order_id && razorpay_order_id.startsWith('mock_'))) {
        return res.json({ success: true, message: "Mock verification successful" });
    }

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid signature" });
    }
});

export default router;
