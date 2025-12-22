"use client";

import { useQuery } from "@tanstack/react-query";

interface UseGetDateAvailableTimeSlotsProps {
  barbershopId: string | undefined;
  date: Date | undefined;
}

interface UseGetDateAvailableTimeSlotsResponse {
  data: string[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useGetDateAvailableTimeSlots({
  barbershopId,
  date,
}: UseGetDateAvailableTimeSlotsProps): UseGetDateAvailableTimeSlotsResponse {
  const { data, isLoading, error } = useQuery({
    queryKey: ["available-time-slots", barbershopId, date],
    queryFn: async () => {
      if (!barbershopId || !date) {
        return undefined;
      }

      const formattedDate = date.toISOString().split("T")[0];

      const response = await fetch("/api/public/available-time-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barbershopId,
          date: formattedDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar horários disponíveis");
      }

      const result = await response.json();
      return result.availableTimeSlots || [];
    },
    enabled: !!barbershopId && !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
