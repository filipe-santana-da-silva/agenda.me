import { useState } from "react";
import { AppointmentState, Service, Professional, AppointmentData } from "../types";

export const useAppointment = () => {
  const [appointment, setAppointment] = useState<AppointmentState>({
    service_id: "",
    professional_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Gerar calendário do mês
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    // Ajustar para semana começar em segunda (SEG=0)
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Gerar horários disponíveis
  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  // Agrupar serviços por categoria
  const groupServicesByCategory = (services: Service[]) => {
    const grouped: { [key: string]: Service[] } = {};
    services.forEach((service) => {
      const category = service.category || "Outros";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    return grouped;
  };

  return {
    appointment,
    setAppointment,
    appointmentData,
    setAppointmentData,
    selectedService,
    setSelectedService,
    selectedProfessional,
    setSelectedProfessional,
    selectedCategory,
    setSelectedCategory,
    successMessage,
    setSuccessMessage,
    getCalendarDays,
    getAvailableTimes,
    groupServicesByCategory,
  };
};
