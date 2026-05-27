import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { bankCode, accountNumber, amount, userId } = await req.json()
    const sk = Deno.env.get('PAYSTACK_SECRET_KEY')

    // 1. Resolve Account Name (Verification)
    const resolveRes = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      headers: { 'Authorization': `Bearer ${sk}` }
    })
    const accountData = await resolveRes.json()
    if (!accountData.status) throw new Error("Account verification failed")

    const accountName = accountData.data.account_name

    // 2. Create Transfer Recipient
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sk}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN"
      })
    })
    const recipientData = await recipientRes.json()

    // 3. Initiate the REAL Transfer
    const transferRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sk}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100, // Naira to Kobo
        recipient: recipientData.data.recipient_code,
        reason: "Elite Data Payout"
      })
    })

    const transferData = await transferRes.json()

    return new Response(JSON.stringify({ status: "success", data: transferData, accountName }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
    })
  }
})
