import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const PUBLIC_SEATS = 50;
const REAL_MAX = 100;

export function useSeats() {
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadSeats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_seats_count');
      if (!error && data !== null) setSeatsUsed(data);
    } catch (err) {
      console.error('Erro ao contar vagas:', err);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadSeats(); }, [loadSeats]);

  const publicRemaining = Math.max(0, PUBLIC_SEATS - seatsUsed);
  const realRemaining = Math.max(0, REAL_MAX - seatsUsed);

  return {
    seatsUsed, seatsTotal: PUBLIC_SEATS, seatsRemaining: publicRemaining,
    isFull: publicRemaining <= 0, isReallyFull: realRemaining <= 0, isLoading,
    refreshSeats: loadSeats, realMax: REAL_MAX, realRemaining,
  };
}
