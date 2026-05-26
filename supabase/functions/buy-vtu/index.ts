import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyReq = await req.json()
    const { actionType, networkId, phoneNumber, planId, amount, meterNumber, discoId, meterType, smartCardNumber, cableId } = bodyReq
    const VTU_KEY = Deno.env.get('VTU_API_KEY')

    console.log(`Processing ${actionType} for ${phoneNumber}`);

    let endpoint = '';
    let apiBody: any = { Ported_number: true }; // Always include this now!

    if (actionType === 'data') {
      endpoint = 'https://gladtidingsdata.com/api/data/';
      apiBody = { ...apiBody, network: networkId, mobile_number: phoneNumber, plan: planId };
    } 
    else if (actionType === 'airtime') {
      endpoint = 'https://gladtidingsdata.com/api/topup/';
      // Airtime needs the Recharge ID in the 'plan' field for Glad Tidings
      apiBody = { ...apiBody, network: networkId, mobile_number: phoneNumber, plan: planId, amount: amount, airtime_type: "VTU" };
    }
    else if (actionType === 'electricity') {
      endpoint = 'https://gladtidingsdata.com/api/billpayment/';
      apiBody = { ...apiBody, disco_name: discoId, meter_number: meterNumber, Meter_Type: meterType, amount: amount };
    }
    else if (actionType === 'cable') {
      endpoint = 'https://gladtidingsdata.com/api/cablesub/';
      apiBody = { ...apiBody, cablename: cableId, smart_card_number: smartCardNumber, cableplan: planId };
    }

    console.log("Payload to Provider:", apiBody);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Token ${VTU_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody)
    })

    const data = await response.json()
    console.log("Provider Response:", data);

    // Return the response back to your site
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
