import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StripeProvider } from "@/components/StripeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Detroit Parking System",
  description: "Fast, secure and reliable parking reservations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StripeProvider>
          {children}
        </StripeProvider>
      </body>
    </html>
  );
}

