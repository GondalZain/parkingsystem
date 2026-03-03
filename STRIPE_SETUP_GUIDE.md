# Stripe Payment Integration Guide

## Overview
This guide walks you through the complete Stripe payment integration setup for the Detroit Parking System. The payment system is fully implemented with a professional UI and secure payment processing.

---

## What Has Been Implemented

### 1. **Frontend Components**
- ✅ **StripePaymentForm.js** - Professional payment form with Card Element
- ✅ **StripeProvider.js** - React context wrapper for Stripe initialization
- ✅ **BookingForm.js** - Updated with payment modal integration

### 2. **Backend API Routes**
- ✅ `/api/payments/create-payment-intent` - Creates Stripe PaymentIntent
- ✅ `/api/payments/confirm-payment` - Confirms successful payment
- ✅ `/api/webhooks/stripe` - Handles Stripe webhook events

### 3. **Database Updates**
- ✅ Prisma schema updated with payment fields:
  - `paymentStatus` - Track payment state
  - `paymentIntentId` - Link to Stripe payment
  - `paymentMethod` - Payment method used
  - `paidAt` - Payment timestamp
  - `refundedAt` - Refund timestamp
  - `paymentFailureReason` - Error details

### 4. **Dependencies**
- ✅ `stripe` - Server-side Stripe library
- ✅ `@stripe/react-stripe-js` - React Stripe components
- ✅ `@stripe/stripe-js` - Stripe client library

---

## Step 1: Get Your Stripe Keys

### Option A: Using Stripe Test Mode (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in to your account
3. Navigate to **Developers > API Keys**
4. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### Option B: Using Stripe Live Mode (Production)

1. In Stripe Dashboard, switch from "Test mode" to "Live mode"
2. Get your live keys:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

⚠️ **Important**: Keep your Secret Key private! Never commit it to version control.

---

## Step 2: Set Up Environment Variables

Update your `.env` file at `e:\parkingsystem\app\.env`:

```dotenv
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Getting the Webhook Secret

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click **Create endpoint**
6. Copy the **Signing secret** and add it to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Step 3: Install Dependencies

Run in terminal:

```bash
cd e:\parkingsystem\app
npm install
```

---

## Step 4: Update Prisma Database

Run Prisma migrations to add payment fields:

```bash
npx prisma migrate dev --name add_payment_fields
```

This will:
- Create a new migration
- Update your MongoDB schema
- Regenerate Prisma Client

---

## Step 5: Test the Integration

### Frontend Testing

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the booking page
3. Fill in all booking details
4. Click **"PROCEED TO PAYMENT"**
5. A payment modal will appear with the Stripe card form

### Using Stripe Test Cards

In **test mode**, use these test card numbers:

| Card Type | Number | Exp | CVC |
|-----------|--------|-----|-----|
| **Visa** | 4242 4242 4242 4242 | 12/25 | 123 |
| **Visa (declined)** | 4000 0000 0000 0002 | 12/25 | 123 |
| **Mastercard** | 5555 5555 5555 4444 | 12/25 | 123 |
| **Amex** | 3782 822463 10005 | 12/25 | 123 |

For all test cards:
- **Email**: Any email
- **Name**: Any name
- **ZIP**: 12345

### Expected Flow

1. Enter booking details (lot, plate, slot, duration)
2. Click **PROCEED TO PAYMENT**
3. Payment modal opens
4. Enter test card details
5. Click **Pay $[amount]**
6. If using 4242..., payment succeeds ✅
7. Confirmation modal appears
8. Booking is completed!

---

## Step 6: Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Replace test keys with live keys in `.env`
   - Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is truly public (fine in client)
   - Keep `STRIPE_SECRET_KEY` secret (never commit or expose)

2. **Set Webhook Secret for Production**
   - Get production webhook secret from Stripe
   - Update `STRIPE_WEBHOOK_SECRET` in production environment

3. **Enable SSL/HTTPS**
   - Stripe requires HTTPS for production
   - Configure your domain SSL certificate

4. **Test Live Mode**
   - Create a test payment with real cards (no actual charge occurs)
   - Verify webhook delivery in Stripe Dashboard

5. **Update Webhook URL**
   - Change webhook endpoint to production domain
   - E.g., `https://parkingsystem.com/api/webhooks/stripe`

---

## Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Booking Flow                          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
    User fills booking form
         │
         ▼
   Click "PROCEED TO PAYMENT"
         │
         ├─► Create booking (paymentStatus: "pending")
         │
         ├─► Show payment modal
         │
         ◄─── Create PaymentIntent
         │   (POST /api/payments/create-payment-intent)
         │
         ▼
    User enters card details
         │
         ▼
   Click "Pay $[amount]"
         │
         ├─► Stripe processes payment
         │
         ├─► Payment succeeds/fails
         │
         ▼
   Confirm payment (POST /api/payments/confirm-payment)
         │
         ├─► Update booking (paymentStatus: "completed")
         │
         ▼
    Show confirmation
         │
         └─► Refresh available slots
```

---

## API Endpoints Reference

### POST `/api/payments/create-payment-intent`

Creates a Stripe PaymentIntent for the booking.

**Request:**
```json
{
  "amount": 2500,
  "bookingDetails": {
    "carNumber": "ABC123",
    "phoneNumber": "+13525551234",
    "lotId": "lot_123",
    "lotName": "Downtown Lot A",
    "slotNumber": 5,
    "duration": "2 hours"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_123456_secret_789",
  "paymentIntentId": "pi_123456"
}
```

### POST `/api/payments/confirm-payment`

Confirms the payment after Stripe processes it.

**Request:**
```json
{
  "paymentIntentId": "pi_123456",
  "bookingDetails": {
    "bookingId": "booking_789",
    "totalPrice": 25.00
  }
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ...booking data... },
  "message": "Payment confirmed successfully"
}
```

### POST `/api/webhooks/stripe`

Receives webhook events from Stripe.

**Events Handled:**
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment canceled
- `charge.refunded` - Charge refunded

---

## Error Handling

### Common Issues & Solutions

#### 1. "Stripe key not found"
- ✅ Ensure `.env` file has both keys
- ✅ Restart dev server after updating `.env`

#### 2. "Payment element not loading"
- ✅ Check browser console for errors
- ✅ Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
- ✅ Ensure StripeProvider wraps the component

#### 3. "Webhook not receiving events"
- ✅ Check webhook URL is correct and publicly accessible
- ✅ Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- ✅ Check Stripe Dashboard > Webhooks > Event log

#### 4. "Payment succeeds but booking not updated"
- ✅ Verify Prisma schema was migrated
- ✅ Check database connection is working
- ✅ Review server logs for database errors

---

## Testing Webhook Events

### Local Testing with ngrok (Recommended)

1. Install [ngrok](https://ngrok.com/)
2. Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update Stripe webhook URL to: `https://abc123.ngrok.io/api/webhooks/stripe`
5. Trigger test event from Stripe Dashboard
6. Check server logs for webhook delivery

### Manual Webhook Testing

Use Stripe CLI (recommended for development):

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Run test events
stripe trigger payment_intent.succeeded
```

---

## Monitoring & Analytics

### Monitor Payments in Stripe Dashboard

1. **Payments** section shows all transactions
2. **Disputes** section shows chargebacks
3. **Customers** section shows booking history
4. **API Activity** shows all API calls

### Monitor in Your App

Check booking records:
```javascript
// Example: Query paid bookings
const paidBookings = await prisma.booking.findMany({
  where: { paymentStatus: "completed" }
});
```

---

## Security Checklist

- ✅ Never expose `STRIPE_SECRET_KEY` in client code
- ✅ Always use HTTPS in production
- ✅ Validate webhook signatures with `STRIPE_WEBHOOK_SECRET`
- ✅ Don't log sensitive payment data
- ✅ Use test mode for development
- ✅ Implement rate limiting on payment endpoints
- ✅ Monitor failed payment attempts

---

## Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe React Library](https://stripe.com/docs/stripe-js/react)
- [Payment Processing Guide](https://stripe.com/docs/payments/payment-intents)
- [Webhook Documentation](https://stripe.com/docs/webhooks)

---

## Next Steps

1. ✅ Update `.env` with your Stripe keys
2. ✅ Run `npx prisma migrate dev`
3. ✅ Test with Stripe test cards
4. ✅ Set up webhooks in Stripe Dashboard
5. ✅ Deploy to production with live keys
6. ✅ Monitor payments and bookings

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
