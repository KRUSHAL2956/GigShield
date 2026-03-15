const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let rzp;
if (key_id && key_secret && key_id !== 'rzp_test_xxxxx') {
  rzp = new Razorpay({ key_id, key_secret });
  console.log('🛡️ Razorpay initialized');
} else {
  console.warn('⚠️ Razorpay keys missing or using mock ID. Payouts will be simulated.');
}

// Helper to mask PII for logs
const getSafeRiderRef = (rider) => {
  const phone = String(rider?.phone ?? '');
  return `Rider_${rider?.id || 'unknown'}_${phone.slice(-4) || 'xxxx'}`;
};

/**
 * Initiates a payout to a rider.
 * @param {object} rider 
 * @param {number} amount 
 * @returns {Promise<object>}
 */
async function initiatePayout(rider, amount) {
  // Input Validation
  if (!rider || !rider.id || !rider.name || !rider.phone || !Number.isFinite(amount) || amount <= 0) {
    console.error('[PaymentService] Invalid input for payout:', { riderId: rider?.id, amount });
    return { success: false, error: 'invalid input' };
  }

  const riderRef = getSafeRiderRef(rider);

  if (!rzp) {
    console.log(`[PaymentService] MOCK PAYOUT: ₹${amount} to ${riderRef}`);
    return { success: true, payout_id: `mock_pay_${Date.now()}`, status: 'processed' };
  }

  try {
    // NOTE: Real Razorpay X Payouts require a fund_account_id which isn't in our current schema.
    // We've implemented the structure here. In a production env, you would fetch the rider's fund account.
    console.log(`[PaymentService] INITIATING LIVE PAYOUT: ₹${amount} to ${riderRef}`);
    
    // const payout = await rzp.payouts.create({
    //   account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER,
    //   fund_account_id: rider.fund_account_id, // TODO: Add to schema
    //   amount: Math.round(amount * 100), // convert to paise
    //   currency: "INR",
    //   mode: "IMPS",
    //   purpose: "payout",
    //   queue_if_low_balance: true,
    //   reference_id: `pay_${rider.id}_${Date.now()}`,
    //   narration: "GigShield Disruption Payout"
    // });

    // return { 
    //   success: true, 
    //   payout_id: payout.id,
    //   status: payout.status
    // };

    // Keeping demo return but with "LIVE TRACE" indicator as requested for now
    return { 
      success: true, 
      payout_id: `live_trace_${Math.random().toString(36).substr(2, 9)}`,
      status: 'queued',
      isDemo: true
    };
  } catch (err) {
    console.error(`[PaymentService] Payout failed for ${riderRef}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { initiatePayout };
