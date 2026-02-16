import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const MAX_SEATS = 30;

export function useSeats() {
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadSeats = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .in('role', ['member', 'founder', 'admin']);

      if (!error && count !== null) {
        setSeatsUsed(count);
      }
    } catch (err) {
      console.error('Erro ao contar vagas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  return {
    seatsUsed,
    seatsTotal: MAX_SEATS,
    seatsRemaining: Math.max(0, MAX_SEATS - seatsUsed),
    isFull: seatsUsed >= MAX_SEATS,
    isLoading,
    refreshSeats: loadSeats
  };
}
