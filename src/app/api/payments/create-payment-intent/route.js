import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-27", // Use appropriate API version
});

export async function POST(request) {
    try {
        const { amount, bookingDetails } = await request.json();

        if (!amount || amount <= 0) {
            return new Response(
                JSON.stringify({ error: "Invalid amount" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Already in cents from frontend
            currency: "usd",
            metadata: {
                carNumber: bookingDetails?.carNumber || "N/A",
                phoneNumber: bookingDetails?.phoneNumber || "N/A",
                lotId: bookingDetails?.lotId || "N/A",
                lotName: bookingDetails?.lotName || "N/A",
                slotNumber: bookingDetails?.slotNumber || "N/A",
            },
            description: `Parking booking for ${bookingDetails?.carNumber || "Unknown"}`,
        });

        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Payment Intent Error:", error);
        return new Response(
            JSON.stringify({
                error: error.message || "Failed to create payment intent",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
