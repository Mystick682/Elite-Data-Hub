import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { action, bankCode, accountNumber, amount } = await req.json()
    const sk = Deno.env.get('PAYSTACK_SECRET_KEY')

    if (action === 'verify') {
      console.log(`Verifying: ${accountNumber} with bank ${bankCode}`)
      
      const res = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: { 'Authorization': `Bearer ${sk}` }
      })
      
      const data = await res.json()
      console.log("Paystack Response:", data) // View this in Supabase Logs
      
      return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
      })
    }

    if (action === 'transfer') {
      const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sk}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: "nuban", name: "Customer", account_number: accountNumber, bank_code: bankCode, currency: "NGN" })
      })
      const recipientData = await recipientRes.json()

      const transferRes = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sk}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: "balance", amount: amount * 100, recipient: recipientData.data.recipient_code })
      })
      const transferData = await transferRes.json()
      
      return new Response(JSON.stringify(transferData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
