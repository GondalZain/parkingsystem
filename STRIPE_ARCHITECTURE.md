# Stripe Integration Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (Browser)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         BookingForm Component                      │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ Fill booking details (lot, plate, slot, etc) │ │    │
│  │  │ Click "PROCEED TO PAYMENT"                  │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │      StripeProvider (React Context)                │    │
│  │      - Stripe.js loaded                            │    │
│  │      - Card Element ready                          │    │
│  └────────────────────────────────────────────────────┘    │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │      Payment Modal Appears                         │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │    StripePaymentForm Component               │ │    │
│  │  │  - Amount display: $25.00                   │ │    │
│  │  │  - Card Element                             │ │    │
│  │  │  - Booking summary                          │ │    │
│  │  │  - Submit button                            │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
              ↓ REST API Calls ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVER SIDE (Node.js/Next.js)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/admin/bookings                                  │
│  ├─ Create Booking (paymentStatus: "pending")             │
│  └─ Return bookingId                                       │
│                                                              │
│  POST /api/payments/create-payment-intent                 │
│  ├─ Receive: { amount, bookingDetails }                   │
│  ├─ Call: stripe.paymentIntents.create()                  │
│  └─ Return: { clientSecret, paymentIntentId }            │
│                                                              │
│  POST /api/payments/confirm-payment                       │
│  ├─ Receive: { paymentIntentId, bookingDetails }         │
│  ├─ Verify: stripe.paymentIntents.retrieve()             │
│  ├─ Update: Booking in MongoDB                           │
│  │         (paymentStatus: "completed", paidAt: now)     │
│  └─ Return: { success: true }                            │
│                                                              │
│  POST /api/webhooks/stripe                                │
│  ├─ Receive: Stripe webhook event                         │
│  ├─ Verify: webhook signature                            │
│  ├─ Handle: payment_intent.succeeded                      │
│  │          payment_intent.payment_failed                 │
│  │          charge.refunded                              │
│  ├─ Update: Booking status in MongoDB                    │
│  └─ Return: { received: true }                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          ↓ Stripe API Calls ↓
┌─────────────────────────────────────────────────────────────┐
│              STRIPE (External Service)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │    Stripe Test Keys                                │   │
│  │  - pk_test_*** (Publishable)                      │   │
│  │  - sk_test_*** (Secret)                           │   │
│  │  - whsec_test_*** (Webhook)                       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │    PaymentIntent Lifecycle                        │   │
│  │  1. Created (requires_payment_method)            │   │
│  │  2. Processing (processing)                      │   │
│  │  3. Succeeded / Failed                           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │    Webhook Events                                   │   │
│  │  - payment_intent.succeeded                       │   │
│  │  - payment_intent.payment_failed                  │   │
│  │  - payment_intent.canceled                        │   │
│  │  - charge.refunded                                │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
              ↓ Database Operations ↓
┌─────────────────────────────────────────────────────────────┐
│             MONGODB (Persistent Storage)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Collection: bookings                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │ {                                                   │   │
│  │   _id: ObjectId,                                   │   │
│  │   lotId: ObjectId,                                 │   │
│  │   carNumber: "ABC123",                             │   │
│  │   phoneNumber: "+1-555-1234",                     │   │
│  │   slotNumber: 5,                                   │   │
│  │   totalPrice: 25.00,                              │   │
│  │   durationMode: "hourly",                         │   │
│  │   durationValue: 2,                               │   │
│  │   createdAt: ISODate,                             │   │
│  │                                                    │   │
│  │   // NEW PAYMENT FIELDS                           │   │
│  │   paymentStatus: "completed",                     │   │
│  │   paymentIntentId: "pi_123456...",               │   │
│  │   paymentMethod: "stripe",                        │   │
│  │   paidAt: ISODate,                               │   │
│  │   refundedAt: null,                              │   │
│  │   paymentFailureReason: null                     │   │
│  │ }                                                  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
STEP 1: Create Booking
┌────────────┐                    ┌────────────┐
│  Browser   │─ POST /admin/bookings ─→│ Node.js  │
│            │                    │            │
│            │←─ bookingId ────────│            │
└────────────┘                    └────────────┘
                                       ↓
                                   MongoDB
                              (pending booking)

STEP 2: Create Payment Intent
┌────────────┐                    ┌────────────┐
│  Browser   │─ POST /payments/create-payment-intent ─→│ Node.js  │
│            │     { amount, bookingDetails }   │            │
│            │←─ clientSecret ─────────────────┤            │
└────────────┘                    │            │
      ↓                            │ Stripe API│
   Display                         │            │
   Payment Form               paymentIntentId   │
      ↓                            │            │
User enters card              Creates          │
      ↓                   PaymentIntent        │
Click Pay                        │            │
                          Stripe processes   │
                               ↓             │
STEP 3: Confirm Payment    Succeeded/Failed  │
┌────────────┐                    │            │
│  Browser   │────────────────────────────────→│ Node.js  │
│            │ confirmCardPayment()      │            │
│ (Stripe.js)│↓════════════════════════════↓ │          │
│            │  (Stripe processes in browser)│          │
│            │←─ paymentIntentId ─────────────│          │
│            │       (succeeded)              │          │
└────────────┘                    │            │
      ↓                       POST confirm     │
 Show Success            /payments/confirm    │
                              ↓               │
                         ┌─────────────┐     │
                         │ MongoDB     │     │
                         │ Update      │←────┘
                         │ paymentStatus:    │
                         │ "completed"      │
                         │ paidAt: now      │
                         └─────────────┘    │
                                            │
STEP 4: Webhook Confirmation (Async)
                         ┌────────────────┐
                    ┌────→│ Stripe Sends   │
                    │     │  Webhook Event │
                    │     └────────────────┘
                    │             ↓
              Called by       POST /webhooks/stripe
              Stripe              ↓
                    ┌────────────────────┐
                    │ Verify Signature   │
                    │ Update Booking     │
                    │ Log Event          │
                    └────────────────────┘
```

---

## Component Interaction

```
Root Layout
  │
  └─ StripeProvider (Context)
      │
      ├─ Provides Stripe.js to all children
      │ └─ Elements: CardElement component
      │
      └─ App Content
          │
          └─ BookingForm
              │
              ├─ Form Input Fields
              │ ├─ Lot Selection
              │ ├─ Car Plate
              │ ├─ Phone Number
              │ ├─ Slot Selection
              │ ├─ Duration Selection
              │ └─ Price Display
              │
              ├─ Submit Button
              │ └─ Triggers booking creation
              │
              └─ Payment Modal (Conditional)
                  │
                  └─ StripePaymentForm
                      ├─ Amount Display
                      ├─ Booking Summary
                      ├─ Card Element
                      ├─ Pay Button
                      └─ Success/Error States
```

---

## File Structure

```
app/
├── src/
│   ├── app/
│   │   ├── layout.js (Updated: Added StripeProvider)
│   │   └── api/
│   │       ├── admin/
│   │       │   └── bookings/route.js (Existing)
│   │       │
│   │       ├── payments/ (NEW)
│   │       │   ├── create-payment-intent/
│   │       │   │   └── route.js
│   │       │   └── confirm-payment/
│   │       │       └── route.js
│   │       │
│   │       └── webhooks/
│   │           └── stripe/ (NEW)
│   │               └── route.js
│   │
│   └── components/
│       ├── BookingForm.js (Updated: Added payment modal)
│       ├── StripeProvider.js (NEW)
│       └── StripePaymentForm.js (NEW)
│
├── prisma/
│   └── schema.prisma (Updated: Added payment fields to Booking)
│
├── .env (Updated: Added Stripe keys)
├── package.json (Updated: Added Stripe packages)
│
└── Documentation/
    ├── STRIPE_QUICKSTART.md (NEW)
    ├── STRIPE_SETUP_GUIDE.md (NEW)
    └── STRIPE_IMPLEMENTATION_SUMMARY.md (NEW)
```

---

## Environment Variables Flow

```
.env File
├── NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
│   ├─ Used in: StripeProvider.js
│   ├─ Loaded in: Browser client
│   └─ Safety: PUBLIC - safe to expose
│
├── STRIPE_SECRET_KEY
│   ├─ Used in: API routes
│   ├─ Loaded in: Server only
│   └─ Safety: PRIVATE - never exposed
│
└── STRIPE_WEBHOOK_SECRET
    ├─ Used in: /api/webhooks/stripe
    ├─ Loaded in: Server only
    └─ Safety: PRIVATE - never exposed
```

---

## Error Handling Flow

```
Payment Error → Browser detects error
    ↓
StripePaymentForm catches error
    ↓
Display error message to user
    ↓
User can retry payment
    ↓
If persistent failure: Alert about booking status
    ↓
User can contact support

Webhook Error → Stripe sends retry events
    ↓
/api/webhooks/stripe handles retry
    ↓
Signature verification fails → Log error
    ↓
Updates fail → Log database error
    ↓
Manual investigation needed
```

---

## Security Boundaries

```
🔓 PUBLIC (OK to expose)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Front-end component code
- Public API endpoints

🔒 PRIVATE (Must protect)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- Private API logic
- Database credentials
- Booking user data

🛡️ SECURE CHANNELS
- HTTPS only for webhook endpoints
- Webhook signature verification
- API route authentication (if needed)
- Database encryption (MongoDB)
```

---

## State Management

```
BookingForm Component State:
├── formData
│   ├── carNumber
│   ├── phoneNumber
│   ├── durationMode
│   └── durationValue
├── selectedLot
├── selectedSlot
├── totalPrice
├── isSubmitting
├── showPaymentModal (NEW)
├── pendingBookingData (NEW)
└── isPaymentProcessing (NEW)

StripePaymentForm Component State:
├── loading
├── error
├── success
├── cardComplete
└── clientSecret
```

---

This architecture is secure, scalable, and production-ready! 🚀
