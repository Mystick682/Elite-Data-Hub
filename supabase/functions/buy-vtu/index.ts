import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { actionType, networkId, phoneNumber, planId, amount } = await req.json()
    const VTU_KEY = Deno.env.get('VTU_API_KEY')

    let endpoint = '';
    let body = {};

    if (actionType === 'data') {
      endpoint = 'https://gladtidingsdata.com/api/data/';
      body = { network: networkId, mobile_number: phoneNumber, plan: planId, Ported_number: true };
    } else {
      // FOR AIRTIME: Glad Tidings uses the same plan logic for specific IDs
      endpoint = 'https://gladtidingsdata.com/api/topup/';
      body = { 
        network: networkId, 
        mobile_number: phoneNumber, 
        plan: planId, // This is your Recharge ID (1, 2, 3, etc.)
        amount: amount, 
        airtime_type: "VTU", 
        Ported_number: true 
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Token ${VTU_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
