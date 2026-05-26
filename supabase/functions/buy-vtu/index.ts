import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Added ": Request" here to fix the 'any' type error
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { networkId, planId, phoneNumber } = await req.json()
    // VS Code will now recognize 'Deno' once the extension is enabled
    const VTU_KEY = Deno.env.get('VTU_API_KEY')

    const response = await fetch('https://gladtidingsdata.com/api/data/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${VTU_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        network: networkId,
        mobile_number: phoneNumber,
        plan: planId,
        Ported_number: true
      })
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
