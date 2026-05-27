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

    let endpoint = ''
    let apiBody: any = { Ported_number: true }
    let method = 'POST'

    // --- 1. DATA ---
    if (actionType === 'data') {
      endpoint = 'https://gladtidingsdata.com/api/data/'
      apiBody = { ...apiBody, network: networkId, mobile_number: phoneNumber, plan: planId }
    } 
    // --- 2. AIRTIME ---
    else if (actionType === 'airtime') {
      endpoint = 'https://gladtidingsdata.com/api/topup/'
      apiBody = { ...apiBody, network: networkId, mobile_number: phoneNumber, plan: planId, amount: amount, airtime_type: "VTU" }
    }
    // --- 3. ELECTRICITY ---
    else if (actionType === 'electricity') {
      endpoint = 'https://gladtidingsdata.com/api/billpayment/'
      apiBody = { ...apiBody, disco_name: discoId, meter_number: meterNumber, Meter_Type: meterType, amount: amount }
    }
    // --- 4. CABLE ---
    else if (actionType === 'cable') {
      endpoint = 'https://gladtidingsdata.com/api/cablesub/'
      apiBody = { ...apiBody, cablename: cableId, smart_card_number: smartCardNumber, cableplan: planId }
    }
    // --- 5. VALIDATION METER ---
    else if (actionType === 'validate-meter') {
      method = 'GET'
      endpoint = `https://gladtidingsdata.com/api/validatemeter/?meternumber=${meterNumber}&disconame=${discoId}&mtype=${meterType}`
    }
    // --- 6. VALIDATION IUC ---
    else if (actionType === 'validate-iuc') {
      method = 'GET'
      endpoint = `https://gladtidingsdata.com/api/validateiuc/?smart_card_number=${smartCardNumber}&cablename=${cableId}`
    }

    const fetchOptions: any = {
      method: method,
      headers: { 'Authorization': `Token ${VTU_KEY}`, 'Content-Type': 'application/json' }
    }
    if (method === 'POST') fetchOptions.body = JSON.stringify(apiBody)

    const response = await fetch(endpoint, fetchOptions)
    const data = await response.json()

    // Error handling
    if (data.status === 'fail' || data.Status === 'failed' || data.invalid) {
       return new Response(JSON.stringify({ error: data.invalid || data.error || "Request Failed", details: data }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
         status: 400 
       })
    }

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
