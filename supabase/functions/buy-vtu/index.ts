import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const b = await req.json()
    const VTU_KEY = Deno.env.get('VTU_API_KEY')
    let url = ''
    let method = 'POST'
    let body: any = null

    if (b.actionType === 'validate-meter') {
      method = 'GET';
      url = `https://gladtidingsdata.com/api/validatemeter/?meternumber=${b.meterNumber}&disconame=${b.discoId}&mtype=${b.meterType}`;
    } else if (b.actionType === 'validate-iuc') {
      method = 'GET';
      url = `https://gladtidingsdata.com/api/validateiuc/?smart_card_number=${b.smartCardNumber}&cablename=${b.cableId}`;
    } else if (b.actionType === 'electricity') {
      url = 'https://gladtidingsdata.com/api/billpayment/';
      body = { disco_name: b.discoId, meter_number: b.meterNumber, Meter_Type: b.meterType, amount: b.amount };
    } else if (b.actionType === 'cable') {
      url = 'https://gladtidingsdata.com/api/cablesub/';
      body = { cablename: b.cableId, smart_card_number: b.smartCardNumber, cableplan: b.planId };
    } else if (b.actionType === 'data') {
      url = 'https://gladtidingsdata.com/api/data/';
      body = { network: b.networkId, mobile_number: b.phoneNumber, plan: b.planId, Ported_number: true };
    } else if (b.actionType === 'airtime') {
      url = 'https://gladtidingsdata.com/api/topup/';
      body = { network: b.networkId, mobile_number: b.phoneNumber, plan: b.planId, amount: b.amount, airtime_type: "VTU", Ported_number: true };
    }

    const res = await fetch(url, {
      method: method,
      headers: { 'Authorization': `Token ${VTU_KEY}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
