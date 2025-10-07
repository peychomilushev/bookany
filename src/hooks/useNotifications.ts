import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface NotificationTemplate {
  type: 'email' | 'sms';
  trigger: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled';
  subject?: string;
  content: string;
  timing: number; // hours before appointment
}

export function useNotifications(businessId: string | null) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadDefaultTemplates();
    }
    setLoading(false);
  }, [businessId]);

  const loadDefaultTemplates = () => {
    const defaultTemplates: NotificationTemplate[] = [
      {
        type: 'email',
        trigger: 'booking_confirmed',
        subject: 'Потвърждение на резервация - {business_name}',
        content: `Здравейте {customer_name},

Вашата резервация е потвърдена!

Детайли:
- Услуга: {service_name}
- Дата: {date}
- Час: {time}
- Адрес: {business_address}

Ако имате въпроси, моля свържете се с нас.

С уважение,
{business_name}`,
        timing: 0
      },
      {
        type: 'sms',
        trigger: 'booking_reminder',
        content: 'Напомняне: Имате резервация в {business_name} утре в {time}. За промени: {business_phone}',
        timing: 24
      },
      {
        type: 'email',
        trigger: 'booking_reminder',
        subject: 'Напомняне за резервация - {business_name}',
        content: `Здравейте {customer_name},

Това е напомняне за вашата резервация утре:

- Услуга: {service_name}
- Дата: {date}
- Час: {time}
- Адрес: {business_address}

Очакваме ви!

С уважение,
{business_name}`,
        timing: 24
      }
    ];
    setTemplates(defaultTemplates);
  };

  const scheduleNotification = async (
    reservationId: string,
    template: NotificationTemplate,
    recipient: string,
    scheduledFor: Date
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          business_id: businessId!,
          reservation_id: reservationId,
          type: template.type,
          recipient,
          subject: template.subject,
          content: template.content,
          status: 'pending',
          scheduled_for: scheduledFor.toISOString()
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error };
    }
  };

  const scheduleReservationNotifications = async (reservation: any, business: any) => {
    if (!businessId) return;

    const reservationDate = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
    
    // Schedule confirmation email immediately
    if (reservation.customer_email) {
      const confirmationTemplate = templates.find(t => t.trigger === 'booking_confirmed' && t.type === 'email');
      if (confirmationTemplate) {
        await scheduleNotification(
          reservation.id,
          confirmationTemplate,
          reservation.customer_email,
          new Date()
        );
      }
    }

    // Schedule reminder notifications
    const reminderTemplates = templates.filter(t => t.trigger === 'booking_reminder');
    
    for (const template of reminderTemplates) {
      const recipient = template.type === 'email' ? reservation.customer_email : reservation.customer_phone;
      if (recipient) {
        const reminderTime = new Date(reservationDate.getTime() - (template.timing * 60 * 60 * 1000));
        if (reminderTime > new Date()) {
          await scheduleNotification(
            reservation.id,
            template,
            recipient,
            reminderTime
          );
        }
      }
    }
  };

  return {
    templates,
    scheduleReservationNotifications,
    scheduleNotification,
    loading
  };
}