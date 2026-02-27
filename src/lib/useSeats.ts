import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// Estratégia 50/100:
// - PUBLIC_SEATS (50): anunciado publicamente na landing
// - REAL_MAX (100): limite real liberado silenciosamente
// O contador na landing mostra X / 50
// O backend permite até 100 totais
const PUBLIC_SEATS = 50;
const REAL_MAX = 100;

export function useSeats() {
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadSeats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_seats_count');
      if (!error && data !== null) {
        setSeatsUsed(data);
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

  // Para a landing: mostra vagas sobre o total público (50)
  const publicRemaining = Math.max(0, PUBLIC_SEATS - seatsUsed);
  // Internamente: permite até 100
  const realRemaining = Math.max(0, REAL_MAX - seatsUsed);

  return {
    seatsUsed,
    seatsTotal: PUBLIC_SEATS,       // Exibido na UI
    seatsRemaining: publicRemaining, // Exibido na UI
    isFull: publicRemaining <= 0,    // UI mostra "esgotado" após 50
    isReallyFull: realRemaining <= 0, // Verdadeiro limite (100)
    isLoading,
    refreshSeats: loadSeats,
    // Para uso interno (painel soberano)
    realMax: REAL_MAX,
    realRemaining,
  };
}
