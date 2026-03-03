import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request) {
    try {
        // Validate Stripe key exists
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe Secret Key is not configured");
        }

        const body = await request.json();
        const { amount, bookingDetails } = body;

        // Validate amount
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return new Response(
                JSON.stringify({ 
                    error: `Invalid amount: received ${typeof amount} value '${amount}'` 
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Validate amount is reasonable (max $10,000)
        if (amount > 1000000) {
            return new Response(
                JSON.stringify({ error: "Amount exceeds maximum allowed ($10,000)" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // 🛡️ DOUBLE PAYMENT PROTECTION
        // Check if there's already a successful payment for this exact booking combination
        if (bookingDetails?.lotId && bookingDetails?.slotNumber && bookingDetails?.carNumber) {
            const existingPayment = await prisma.paymentTransaction.findFirst({
                where: {
                    lotId: bookingDetails.lotId,
                    slotNumber: parseInt(bookingDetails.slotNumber),
                    vehicleNumber: bookingDetails.carNumber,
                    status: "succeeded",
                    createdAt: {
                        // Only check payments in the last hour (same session protection)
                        gte: new Date(Date.now() - 60 * 60 * 1000)
                    }
                }
            });

            if (existingPayment) {
                console.log("⚠️ Double payment prevented for:", bookingDetails.carNumber);
                return new Response(
                    JSON.stringify({ 
                        error: "This booking has already been paid",
                        code: "DUPLICATE_PAYMENT",
                        existingPaymentId: existingPayment.paymentIntentId
                    }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        console.log("Creating payment intent with amount:", amount, "cents ($" + (amount / 100).toFixed(2) + ")");

        // 🔥 Create payment intent with comprehensive metadata for fraud protection
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Amount in cents
            currency: "usd",
            metadata: {
                // Booking details for verification
                carNumber: bookingDetails?.carNumber || "N/A",
                phoneNumber: bookingDetails?.phoneNumber || "N/A",
                lotId: bookingDetails?.lotId || "N/A",
                lotName: bookingDetails?.lotName || "N/A",
                slotNumber: String(bookingDetails?.slotNumber || "N/A"),
                duration: bookingDetails?.duration || "N/A",
                // Amount verification data
                expectedAmount: String(amount),
                totalPriceDollars: String(bookingDetails?.totalPrice || (amount / 100)),
                // Timestamp for additional verification
                createdTimestamp: new Date().toISOString(),
            },
            description: `Parking booking - ${bookingDetails?.carNumber || "Unknown plate"} at ${bookingDetails?.lotName || "Unknown lot"}`,
        });

        // 📝 LOG TRANSACTION FOR AUDIT TRAIL
        await prisma.paymentTransaction.create({
            data: {
                paymentIntentId: paymentIntent.id,
                amount: Math.round(amount),
                currency: "usd",
                status: "pending",
                vehicleNumber: bookingDetails?.carNumber || null,
                lotId: bookingDetails?.lotId || null,
                slotNumber: bookingDetails?.slotNumber ? parseInt(bookingDetails.slotNumber) : null,
                phoneNumber: bookingDetails?.phoneNumber || null,
            }
        });

        console.log("✅ Payment intent created:", paymentIntent.id);

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
        console.error("❌ Payment Intent Creation Error:", {
            message: error.message,
            type: error.type,
            code: error.code,
            status: error.statusCode,
        });

        const errorMessage = error.message || "Failed to create payment intent";
        
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { 
                status: 500, 
                headers: { "Content-Type": "application/json" } 
            }
        );
    }
}
