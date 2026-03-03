# Stripe Integration - Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Installation & Setup Issues

### 1. "Cannot find module 'stripe'"
**Problem**: Stripe packages not installed

**Solution**:
```bash
cd e:\parkingsystem\app
npm install
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

**Note**: Restart dev server after installing

---

### 2. ".env file not being read"
**Problem**: Environment variables not loading

**Solution**:
1. Check `.env` is in root: `e:\parkingsystem\app\.env`
2. Verify format (no trailing spaces):
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Restart dev server: `npm run dev`
4. Verify in browser console: Log `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

### 3. "Prisma schema validation error"
**Problem**: Schema.prisma has syntax errors

**Solution**:
```bash
# Check schema file
npx prisma validate

# Run migration
npx prisma migrate dev --name add_payment_fields

# Regenerate client
npx prisma generate
```

---

## 🟡 Frontend/UI Issues

### 4. "Payment form not appearing"
**Problem**: Payment modal doesn't show after clicking submit

**Solution Checklist**:
- ✅ Check browser console for JS errors
- ✅ Verify StripeProvider wraps app in layout.js
- ✅ Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- ✅ Test in incognito mode (clear cache)
- ✅ Check network tab for failed fetch calls

**Debug**:
```javascript
// Add to BookingForm.js handleSubmit
console.log("About to show payment modal");
setPendingBookingData({ /* data */ });
setShowPaymentModal(true);
console.log("Payment modal state set");
```

---

### 5. "Card element is blank"
**Problem**: Card input field shows nothing

**Solution**:
1. Ensure StripeProvider in layout.js
2. Check Stripe key is correct:
   ```bash
   echo %NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY%  # Should start with pk_
   ```
3. Clear browser cache and reload
4. Check browser console for Stripe.js loading errors

---

### 6. "Cards accepted are limited"
**Problem**: Not all test cards work

**Solution**:
Use these verified test cards:
- ✅ `4242 4242 4242 4242` - Visa (Success)
- ✅ `5555 5555 5555 4444` - Mastercard
- ✅ `3782 822463 10005` - Amex
- ❌ `4000 0000 0000 0002` - Visa (Decline)

For any card:
- Date: 12/25 (any future date)
- CVC: 123 (any 3 digits)
- ZIP: 12345 (any 5 digits)

---

## 🟡 Backend/API Issues

### 7. "POST /api/payments/create-payment-intent returns 500"
**Problem**: Error creating payment intent

**Solution**:
1. Check server logs for error message
2. Verify `STRIPE_SECRET_KEY` is correct:
   ```bash
   echo %STRIPE_SECRET_KEY%  # Should start with sk_
   ```
3. Ensure amount is positive integer (in cents):
   ```javascript
   // Good: 2500 (for $25.00)
   // Bad: 25, 25.00, "2500"
   ```
4. Check required fields in request:
   ```json
   {
     "amount": 2500,
     "bookingDetails": {
       "carNumber": "ABC123",
       "phoneNumber": "+1234567890"
     }
   }
   ```

---

### 8. "POST /api/payments/confirm-payment fails - Booking not found"
**Problem**: Booking wasn't created or payment intent doesn't match

**Solution**:
1. Verify booking created before payment:
   ```bash
   # Check MongoDB for booking with:
   # paymentStatus: "pending"
   ```
2. Check booking was created by looking at request:
   ```javascript
   // handleSubmit should create booking first
   const booking = await response.json();
   setPendingBookingData({ bookingId: booking.id });
   ```
3. Verify `bookingId` matches in confirm call

---

### 9. "Webhook endpoint returns 401"
**Problem**: Webhook signature verification fails

**Solution**:
1. Get correct webhook secret from Stripe:
   - Dashboard → Developers → Webhooks → Click endpoint
   - Copy "Signing secret" (starts with `whsec_`)
2. Update `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret
   ```
3. Restart server
4. Test with Stripe CLI:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

---

### 10. "API route file not found (404)"
**Problem**: `create-payment-intent` or other routes return 404

**Solution**:
1. Check file structure:
   ```
   ✅ src/app/api/payments/create-payment-intent/route.js
   ✅ src/app/api/payments/confirm-payment/route.js
   ✅ src/app/api/webhooks/stripe/route.js
   ```
2. Restart dev server (Next.js caches routes)
3. Verify no typos in file names
4. Check endpoints from browser Network tab

---

## 🔴 Database Issues

### 11. "Booking update fails - field not found"
**Problem**: Payment fields not in MongoDB

**Solution**:
```bash
# Run migration
npx prisma migrate dev --name add_payment_fields

# Verify schema
npx prisma db push

# Check actual fields
npx prisma studio  # Opens UI to inspect
```

**Verify fields exist**:
```javascript
const booking = await prisma.booking.findUnique({
  where: { id: bookingId }
});
console.log(booking.paymentStatus); // Should work now
```

---

### 12. "MongoDB connection error"
**Problem**: Can't connect to database

**Solution**:
1. Check CONNECTION URL in `.env`:
   ```env
   DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/parkingsystem
   ```
2. Verify in MongoDB Atlas:
   - User exists with correct password
   - IP address is whitelisted (0.0.0.0/0 for dev)
   - Database name is correct
3. Test connection:
   ```bash
   npx prisma db push --skip-generate
   ```

---

## 🟡 Stripe Integration Issues

### 13. "Stripe test API unavailable"
**Problem**: Can't reach Stripe servers

**Solution**:
1. Check internet connection
2. Verify not behind VPN that blocks Stripe
3. Check Stripe status: https://status.stripe.com/
4. Try different network (mobile hotspot)

---

### 14. "Payment succeeds but booking not updated"
**Problem**: Payment processed but `paymentStatus` still "pending"

**Solution**:
1. Check confirm-payment endpoint was called:
   ```javascript
   // Add logging to handlePaymentSuccess
   console.log("Payment successful, confirming...");
   ```
2. Verify response from confirming:
   ```javascript
   const response = await fetch("/api/payments/confirm-payment", ...);
   console.log(await response.json()); // Check for errors
   ```
3. Manually update booking in MongoDB:
   ```bash
   npx prisma studio
   # Find booking, manually set paymentStatus: "completed"
   ```

---

### 15. "Webhook events not being received"
**Problem**: Stripe webhook not triggering or updating booking

**Solution For Local Development** (ngrok):
```bash
# 1. Install ngrok from https://ngrok.com/

# 2. Start ngrok tunnel
ngrok http 3000
# Copy HTTPS URL (e.g., https://abc123.ngrok.io)

# 3. Update Stripe webhook URL
# Dashboard → Developers → Webhooks → Add endpoint
# URL: https://abc123.ngrok.io/api/webhooks/stripe
# Events: payment_intent.succeeded, payment_intent.payment_failed, etc.

# 4. Test
# Use Stripe Dashboard's "Send test event" or:
stripe trigger payment_intent.succeeded
```

**Check webhook delivery**:
1. Stripe Dashboard → Developers → Webhooks → Click endpoint
2. Scroll to "Recent events"
3. Click event to see response (should be 200 OK)

---

## 🟢 Testing Checklist

### Before Testing Payment

- [ ] `.env` has valid Stripe keys
- [ ] `npm install` completed
- [ ] `npx prisma migrate dev` completed
- [ ] `npm run dev` running without errors
- [ ] No TypeScript/ESLint errors
- [ ] StripeProvider wraps app in layout.js

### During Payment Test

- [ ] Form submits and shows loading state
- [ ] Payment modal appears with amount
- [ ] Card element is interactive
- [ ] Test card is accepted
- [ ] Success message appears after payment
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

### After Payment

- [ ] Booking created with correct data
- [ ] `paymentStatus` is "completed"
- [ ] `paidAt` timestamp is set
- [ ] `paymentIntentId` matches Stripe
- [ ] Slots refresh automatically
- [ ] Form clears for next booking

---

## 🆘 Get Help

### If You're Still Stuck

1. **Check Server Logs**
   ```bash
   # Terminal logs in npm run dev
   # Look for error stack traces
   ```

2. **Check Browser Console**
   - Press F12 → Console tab
   - Look for red error messages

3. **Check Network Tab**
   - Press F12 → Network tab
   - Make payment
   - Look for failed requests
   - Click to see response details

4. **Manually Test Endpoints**
   ```bash
   # Using PowerShell
   $headers = @{"Content-Type" = "application/json"}
   $body = @{
       amount = 2500
       bookingDetails = @{
           carNumber = "TEST"
           phoneNumber = "+1234567890"
       }
   } | ConvertTo-Json
   
   Invoke-WebRequest -Uri "http://localhost:3000/api/payments/create-payment-intent" `
     -Method Post -Headers $headers -Body $body
   ```

5. **Stripe Support**
   - https://support.stripe.com/
   - Check documentation: https://stripe.com/docs

---

## 📋 Debug Logging

Add this to debug issues:

**In BookingForm.js**:
```javascript
const handleSubmit = async (e) => {
  console.log("🔵 Form submit started");
  console.log("📍 Selected lot:", selectedLot);
  console.log("🚗 Car number:", formData.carNumber);
  console.log("💰 Total price:", totalPrice);
  // ... rest of submit
};
```

**In StripePaymentForm.js**:
```javascript
const handleSubmit = async (e) => {
  console.log("💳 Payment submit started");
  console.log("🔐 Client secret exists:", !!clientSecret);
  console.log("✅ Card complete:", cardComplete);
  // ... rest of submit
};
```

**In API route**:
```javascript
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📥 API request received:", body);
    // ... process
    console.log("✅ Success response:", result);
    return Response.json(result);
  } catch (error) {
    console.error("❌ API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## ✅ Verification Commands

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm packages installed
npm list stripe
npm list @stripe/react-stripe-js

# Check Prisma
npx prisma --version

# Check database connection
npx prisma db execute --stdin  # Type: SELECT 1

# View Prisma schema
type prisma\schema.prisma | grep -i payment

# Check .env file
type .env | grep STRIPE

# See all VS Code errors
# Press Ctrl+Shift+M (shows Problems panel)
```

---

## 🎯 Quick Decision Tree

```
Payment not working?
│
├─ Modal not showing?
│  ├─ Check console for errors
│  ├─ Verify StripeProvider in layout
│  └─ Restart dev server
│
├─ Card element blank?
│  ├─ Check STRIPE_PUBLISHABLE_KEY
│  └─ Clear browser cache
│
├─ Payment fails?
│  ├─ Try test card: 4242...
│  ├─ Check console for error
│  └─ Verify API endpoints
│
├─ Booking not updating?
│  ├─ Run: npx prisma migrate dev
│  ├─ Check MongoDB connection
│  └─ Verify payment route response
│
└─ Webhook not working?
   ├─ Use ngrok for local testing
   ├─ Check webhook URL in Stripe
   └─ Verify STRIPE_WEBHOOK_SECRET
```

---

**Last Updated**: January 2026  
**Version**: 1.0.0

Problems persisting? Review the full STRIPE_SETUP_GUIDE.md 📖
