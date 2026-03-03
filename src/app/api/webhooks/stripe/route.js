import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-27",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get("stripe-signature");

        if (!signature) {
            return new Response("No signature", { status: 400 });
        }

        // Verify webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return new Response(`Webhook Error: ${err.message}`, {
                status: 400,
            });
        }

        // Handle different event types
        switch (event.type) {
            case "payment_intent.succeeded":
                await handlePaymentIntentSucceeded(event.data.object);
                break;

            case "payment_intent.payment_failed":
                await handlePaymentIntentFailed(event.data.object);
                break;

            case "payment_intent.canceled":
                await handlePaymentIntentCanceled(event.data.object);
                break;

            case "charge.refunded":
                await handleChargeRefunded(event.data.object);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
    try {
        // Find and update booking by payment intent ID
        const booking = await prisma.booking.findFirst({
            where: { paymentIntentId: paymentIntent.id },
        });

        if (booking) {
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    paymentStatus: "completed",
                    paidAt: new Date(),
                },
            });
            console.log(
                `✅ Payment succeeded for booking ${booking.id}`,
                paymentIntent.id
            );
        }
    } catch (error) {
        console.error("Error handling payment_intent.succeeded:", error);
        throw error;
    }
}

async function handlePaymentIntentFailed(paymentIntent) {
    try {
        const booking = await prisma.booking.findFirst({
            where: { paymentIntentId: paymentIntent.id },
        });

        if (booking) {
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    paymentStatus: "failed",
                    paymentFailureReason: paymentIntent.last_payment_error?.message,
                },
            });
            console.log(
                `❌ Payment failed for booking ${booking.id}`,
                paymentIntent.id
            );
        }
    } catch (error) {
        console.error("Error handling payment_intent.payment_failed:", error);
        throw error;
    }
}

async function handlePaymentIntentCanceled(paymentIntent) {
    try {
        const booking = await prisma.booking.findFirst({
            where: { paymentIntentId: paymentIntent.id },
        });

        if (booking) {
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    paymentStatus: "canceled",
                },
            });
            console.log(
                `⏸️ Payment canceled for booking ${booking.id}`,
                paymentIntent.id
            );
        }
    } catch (error) {
        console.error("Error handling payment_intent.canceled:", error);
        throw error;
    }
}

async function handleChargeRefunded(charge) {
    try {
        // Find booking linked to this charge
        if (charge.payment_intent) {
            const booking = await prisma.booking.findFirst({
                where: { paymentIntentId: charge.payment_intent },
            });

            if (booking) {
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        paymentStatus: "refunded",
                        refundedAt: new Date(),
                    },
                });
                console.log(
                    `💰 Charge refunded for booking ${booking.id}`,
                    charge.id
                );
            }
        }
    } catch (error) {
        console.error("Error handling charge.refunded:", error);
        throw error;
    }
}
