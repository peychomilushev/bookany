import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import type { Database } from '../lib/supabase';

type Business = Database['public']['Tables']['businesses']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Reservation = Database['public']['Tables']['reservations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

export function useBusiness() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const { scheduleReservationNotifications } = useNotifications(currentBusiness?.id || null);
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's businesses
  const fetchBusinesses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
      
      // Set first business as current if none selected
      if (data && data.length > 0 && !currentBusiness) {
        setCurrentBusiness(data[0]);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  // Fetch services for current business
  const fetchServices = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Fetch reservations for current business
  const fetchReservations = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          services (
            name,
            duration,
            price
          )
        `)
        .eq('business_id', currentBusiness.id)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  // Fetch messages for current business
  const fetchMessages = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Create a new business
  const createBusiness = async (businessData: Omit<Business, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{ ...businessData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setBusinesses(prev => [data, ...prev]);
      setCurrentBusiness(data);
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  // Update business
  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setBusinesses(prev => prev.map(b => b.id === id ? data : b));
      if (currentBusiness?.id === id) {
        setCurrentBusiness(data);
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  // Create a new service
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;
      
      setServices(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  // Update service
  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setServices(prev => prev.map(s => s.id === id ? data : s));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  // Create a new reservation
  const createReservation = async (reservationData: Omit<Reservation, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select(`
          *,
          services (
            name,
            duration,
            price
          )
        `)
        .single();

      if (error) throw error;
      
      setReservations(prev => [...prev, data]);
      
      // Schedule notifications for the new reservation
      if (currentBusiness) {
        await scheduleReservationNotifications(data, currentBusiness);
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  // Update reservation
  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          services (
            name,
            duration,
            price
          )
        `)
        .single();

      if (error) throw error;
      
      setReservations(prev => prev.map(r => r.id === id ? data : r));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  // Update message
  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setMessages(prev => prev.map(m => m.id === id ? data : m));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      setServices([]);
      setReservations([]);
      setMessages([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (currentBusiness) {
      fetchServices();
      fetchReservations();
      fetchMessages();
    } else {
      setServices([]);
      setReservations([]);
      setMessages([]);
    }
  }, [currentBusiness]);

  return {
    businesses,
    currentBusiness,
    setCurrentBusiness,
    services,
    reservations,
    messages,
    loading,
    createBusiness,
    updateBusiness,
    createService,
    updateService,
    createReservation,
    updateReservation,
    updateMessage,
    refetch: {
      businesses: fetchBusinesses,
      services: fetchServices,
      reservations: fetchReservations,
      messages: fetchMessages,
    },
  };
}