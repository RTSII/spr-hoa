import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing captcha token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const secret = Deno.env.get('RECAPTCHA_SECRET')
    if (!secret) {
      console.error('RECAPTCHA_SECRET not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Captcha not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Verify with Google reCAPTCHA v2
    const params = new URLSearchParams()
    params.append('secret', secret)
    params.append('response', token)

    const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const result = await verifyResp.json()

    if (!verifyResp.ok) {
      console.error('reCAPTCHA verify HTTP error:', result)
      return new Response(
        JSON.stringify({ success: false, error: 'Captcha verification failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const success = !!result.success
    const hostname = result.hostname ?? null
    const challenge_ts = result.challenge_ts ?? null
    const errorCodes = result['error-codes'] ?? []

    return new Response(
      JSON.stringify({ success, hostname, challenge_ts, errorCodes }),
      { status: success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('verify-captcha error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
