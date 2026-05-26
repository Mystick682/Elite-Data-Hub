import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { actionType, networkId, phoneNumber, planId, amount, meterNumber, discoId, meterType, smartCardNumber, cableId } = await req.json()
    const VTU_KEY = Deno.env.get('VTU_API_KEY')

    let endpoint = '';
    let body = {};

    if (actionType === 'data') {
      endpoint = 'https://gladtidingsdata.com/api/data/';
      body = { network: networkId, mobile_number: phoneNumber, plan: planId, Ported_number: true };
    } 
    else if (actionType === 'airtime') {
      endpoint = 'https://gladtidingsdata.com/api/topup/';
      body = { network: networkId, mobile_number: phoneNumber, plan: planId, amount: amount, airtime_type: "VTU" };
    }
    else if (actionType === 'electricity') {
      endpoint = 'https://gladtidingsdata.com/api/billpayment/';
      body = { disco_name: discoId, meter_number: meterNumber, Meter_Type: meterType, amount: amount };
    }
    else if (actionType === 'cable') {
      endpoint = 'https://gladtidingsdata.com/api/cablesub/';
      body = { cablename: cableId, smart_card_number: smartCardNumber, cableplan: planId };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Token ${VTU_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    // If provider rejects (e.g., your API balance is empty)
    if (data.status === 'fail' || data.Status === 'failed') {
       return new Response(JSON.stringify({ error: "Provider Error", detail: data }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
         status: 400 
       })
    }

    return new Response(JSON.stringify(data), { 
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
