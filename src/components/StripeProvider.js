"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function StripeProvider({ children }) {
    const options = {
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#1877f2",
                colorBackground: "#ffffff",
                colorText: "#30313d",
                colorDanger: "#df1b41",
                borderRadius: "8px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSizeBase: "16px",
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
