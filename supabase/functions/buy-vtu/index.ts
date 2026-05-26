import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const bodyReq = await req.json()
    console.log("Incoming Request Body:", bodyReq); // This will show in logs

    const { actionType, networkId, phoneNumber, planId, amount } = bodyReq
    const VTU_KEY = Deno.env.get('VTU_API_KEY')

    let endpoint = (actionType === 'data') 
      ? 'https://gladtidingsdata.com/api/data/' 
      : 'https://gladtidingsdata.com/api/topup/';
    
    let apiBody = (actionType === 'data')
      ? { network: networkId, mobile_number: phoneNumber, plan: planId, Ported_number: true }
      : { network: networkId, mobile_number: phoneNumber, plan: planId, amount: amount, airtime_type: "VTU" };

    console.log("Sending to Glad Tidings:", apiBody);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Token ${VTU_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody)
    })

    const data = await response.json()
    console.log("Glad Tidings Response:", data); // THIS IS THE IMPORTANT ONE

    if (data.Status !== 'successful' && data.status !== 'success') {
       return new Response(JSON.stringify({ error: "API_REJECTED", details: data }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
         status: 400 
       })
    }

    return new Response(JSON.stringify({ status: "success", provider_resp: data }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })

  } catch (error) {
    console.error("Critical Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    })
  }
})
