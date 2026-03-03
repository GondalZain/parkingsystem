import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { paymentIntentId, bookingDetails } = await request.json();

        if (!paymentIntentId) {
            return new Response(
                JSON.stringify({ error: "Missing payment intent ID" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Retrieve payment intent from Stripe to verify it succeeded
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return new Response(
                JSON.stringify({ error: "Payment was not successful" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // 🛡️ FRAUD PROTECTION: Verify metadata matches booking details
        const metadata = paymentIntent.metadata || {};
        
        if (bookingDetails?.carNumber && metadata.carNumber !== bookingDetails.carNumber) {
            console.error("🚨 FRAUD ALERT: Vehicle number mismatch!", {
                paymentIntentId,
                metadataCarNumber: metadata.carNumber,
                bookingCarNumber: bookingDetails.carNumber
            });
            return new Response(
                JSON.stringify({ 
                    error: "Security verification failed: vehicle mismatch",
                    code: "METADATA_MISMATCH"
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // 🛡️ FRAUD PROTECTION: Verify amount matches (within 1 cent tolerance)
        if (bookingDetails?.totalPrice) {
            const expectedAmountCents = Math.round(bookingDetails.totalPrice * 100);
            const actualAmountCents = paymentIntent.amount;
            
            if (Math.abs(expectedAmountCents - actualAmountCents) > 1) {
                console.error("🚨 FRAUD ALERT: Amount mismatch!", {
                    paymentIntentId,
                    expectedAmountCents,
                    actualAmountCents,
                    difference: actualAmountCents - expectedAmountCents
                });
                return new Response(
                    JSON.stringify({ 
                        error: "Security verification failed: amount mismatch",
                        code: "AMOUNT_MISMATCH"
                    }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        // 📝 Update transaction log to mark as verified
        await prisma.paymentTransaction.updateMany({
            where: { paymentIntentId: paymentIntentId },
            data: { 
                status: "succeeded",
                chargeId: paymentIntent.latest_charge || null,
            }
        });

        console.log("✅ Payment verified successfully:", paymentIntentId);

        return new Response(
            JSON.stringify({
                success: true,
                paymentIntentId: paymentIntentId,
                amount: paymentIntent.amount,
                message: "Payment verified successfully. Booking will be created.",
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Payment Confirmation Error:", error);
        return new Response(
            JSON.stringify({
                error: error.message || "Failed to confirm payment",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
