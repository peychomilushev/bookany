import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Stripe } from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting checkout session creation...')
    
    // Parse request body
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body))

    const { priceId, userId, successUrl, cancelUrl } = body

    // Validate required fields
    if (!priceId) {
      throw new Error('Missing priceId')
    }
    if (!userId) {
      throw new Error('Missing userId')
    }
    if (!successUrl) {
      throw new Error('Missing successUrl')
    }
    if (!cancelUrl) {
      throw new Error('Missing cancelUrl')
    }

    console.log('Creating Stripe checkout session...')

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    })

    console.log('Session created successfully:', session.id)

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        success: true 
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )

  } catch (error) {
    console.error('Error in create-checkout-session:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})