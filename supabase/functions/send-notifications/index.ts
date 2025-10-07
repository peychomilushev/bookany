import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get pending notifications that should be sent now
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        *,
        reservations (
          *,
          services (name),
          businesses (name, address, phone)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())

    if (fetchError) throw fetchError

    for (const notification of notifications || []) {
      try {
        let success = false

        if (notification.type === 'email') {
          success = await sendEmail(notification)
        } else if (notification.type === 'sms') {
          success = await sendSMS(notification)
        }

        // Update notification status
        await supabase
          .from('notifications')
          .update({
            status: success ? 'sent' : 'failed',
            sent_at: success ? new Date().toISOString() : null
          })
          .eq('id', notification.id)

      } catch (error) {
        console.error(`Error sending notification ${notification.id}:`, error)
        
        await supabase
          .from('notifications')
          .update({ status: 'failed' })
          .eq('id', notification.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: notifications?.length || 0,
        message: 'Notifications processed successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendEmail(notification: any): Promise<boolean> {
  try {
    // Replace placeholders in content
    const content = replacePlaceholders(notification.content, notification.reservations)
    const subject = replacePlaceholders(notification.subject || '', notification.reservations)

    // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('Sending email:', {
      to: notification.recipient,
      subject,
      content
    })

    // For demo purposes, we'll just log and return true
    // In production, implement actual email sending
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

async function sendSMS(notification: any): Promise<boolean> {
  try {
    // Replace placeholders in content
    const content = replacePlaceholders(notification.content, notification.reservations)

    // Here you would integrate with your SMS service (Twilio, AWS SNS, etc.)
    console.log('Sending SMS:', {
      to: notification.recipient,
      content
    })

    // For demo purposes, we'll just log and return true
    // In production, implement actual SMS sending
    return true
  } catch (error) {
    console.error('SMS sending failed:', error)
    return false
  }
}

function replacePlaceholders(template: string, reservation: any): string {
  const business = reservation.businesses
  const service = reservation.services

  return template
    .replace(/{customer_name}/g, reservation.customer_name)
    .replace(/{business_name}/g, business?.name || '')
    .replace(/{service_name}/g, service?.name || 'Обща резервация')
    .replace(/{date}/g, new Date(reservation.reservation_date).toLocaleDateString('bg-BG'))
    .replace(/{time}/g, reservation.reservation_time)
    .replace(/{business_address}/g, business?.address || '')
    .replace(/{business_phone}/g, business?.phone || '')
}
</parameter>