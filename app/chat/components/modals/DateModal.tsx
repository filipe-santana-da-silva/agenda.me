"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Service, Professional, AppointmentData } from "../../types";

interface DateModalProps {
  isOpen: boolean;
  currentMonth: Date;
  appointment: AppointmentData;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  getCalendarDays: (date: Date) => (number | null)[];
  getAvailableTimes: () => string[];
  onCurrentMonthChange: (date: Date) => void;
  onDateSelect: (dateStr: string) => void;
  onTimeSelect: (time: string) => void;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const DateModal = ({
  isOpen,
  currentMonth,
  appointment,
  selectedService,
  selectedProfessional,
  getCalendarDays,
  getAvailableTimes,
  onCurrentMonthChange,
  onDateSelect,
  onTimeSelect,
  onClose,
  onBack,
  onNext,
}: DateModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col w-full max-w-7xl max-h-[60vh] lg:max-h-[60vh]">
        {/* Progress Bar */}
        <div className="hidden lg:flex items-center justify-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === 4 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${step === 4 ? "bg-blue-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-auto gap-4 lg:gap-0">
          {/* Calendar */}
          <div className="w-full lg:flex-1 p-6 lg:p-8 flex flex-col lg:border-r border-gray-200">
            <div className="flex flex-col items-start">
              {/* Month Header */}
              <div className="flex items-center justify-between w-full mb-6 gap-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {(() => {
                    const dateStr = currentMonth
                      .toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })
                      .charAt(0)
                      .toUpperCase() +
                      currentMonth
                        .toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })
                        .slice(1);
                    const [month, year] = dateStr.split(" de ");
                    return (
                      <span>
                        {month} <span className="text-gray-400">{year}</span>
                      </span>
                    );
                  })()}
                </h3>

                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      onCurrentMonthChange(newMonth);
                    }}
                    disabled={
                      currentMonth.getFullYear() === new Date().getFullYear() &&
                      currentMonth.getMonth() === new Date().getMonth()
                    }
                    className="p-3 h-auto bg-transparent hover:bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-3xl text-gray-900">‹</span>
                  </button>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      onCurrentMonthChange(newMonth);
                    }}
                    className="p-3 h-auto bg-transparent hover:bg-transparent focus:outline-none"
                  >
                    <span className="text-3xl text-gray-900">›</span>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="w-full">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-blue-400 py-1"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays(currentMonth).map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="h-8" />;
                    }

                    const dateStr = `${currentMonth.getFullYear()}-${String(
                      currentMonth.getMonth() + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dateObj = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    );
                    const rawDay = dateObj.getDay();
                    const dayWeekday = rawDay === 0 ? 6 : rawDay - 1;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selectedDate = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    );
                    const isAvailable = selectedDate >= today;
                    const isSelected = appointment.date === dateStr;
                    const isWeekday = dayWeekday >= 0 && dayWeekday <= 4;

                    return (
                      <button
                        key={`date-${day}`}
                        onClick={() => {
                          if (isAvailable) {
                            onDateSelect(dateStr);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`h-12 rounded font-medium text-base transition-all flex items-center justify-center relative ${
                          isSelected
                            ? "bg-gray-900 text-white cursor-pointer"
                            : isAvailable
                            ? isWeekday
                              ? "text-teal-600 bg-white hover:bg-teal-50 cursor-pointer"
                              : "text-teal-600 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            : "text-gray-300 bg-gray-100 cursor-not-allowed"
                        }`}
                        style={
                          isAvailable && isWeekday && !isSelected
                            ? {
                                backgroundImage:
                                  "linear-gradient(to bottom, transparent 85%, #93c5fd 85%)",
                                backgroundSize: "100% 100%",
                                backgroundRepeat: "no-repeat",
                              }
                            : {}
                        }
                        onMouseEnter={(e) => {
                          if (isAvailable) {
                            (e.currentTarget as HTMLElement).style.transform =
                              "scale(1.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform =
                            "scale(1)";
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="w-full lg:flex-1 p-6 lg:p-8 flex flex-col lg:border-r border-gray-200">
            {appointment.date && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Escolha o horário para{" "}
                    {new Date(
                      appointment.date + "T00:00:00"
                    ).toLocaleDateString("pt-BR")}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-0 text-gray-600 hover:text-gray-800 text-xl shrink-0 bg-transparent cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableTimes().map((time) => (
                    <button
                      key={time}
                      onClick={() => onTimeSelect(time)}
                      className={`py-2 px-2 rounded font-medium text-sm transition-all flex items-center justify-center gap-1 border-2 border-transparent ${
                        appointment.time === time
                          ? "bg-gray-900 text-white cursor-pointer"
                          : "bg-green-200 text-gray-900 hover:bg-green-300 hover:border-blue-300 cursor-pointer"
                      }`}
                    >
                      {time}
                      {appointment.time === time && (
                        <span className="text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
              <Button onClick={onBack} variant="outline" className="w-full">
                ← Voltar
              </Button>
              <Button
                onClick={onNext}
                disabled={
                  !appointment.date ||
                  !appointment.time
                }
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                Próximo passo →
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
              <div className="space-y-0">
                {selectedService && (
                  <div className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Serviço</div>
                    <div className="flex items-center gap-2">
                      {selectedService.imageUrl ? (
                        <Image
                          src={selectedService.imageUrl}
                          alt={selectedService.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                          {selectedService.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-right font-semibold text-gray-900 text-sm">
                        {selectedService.name}
                      </div>
                    </div>
                  </div>
                )}
                {selectedProfessional && (
                  <div className="flex justify-between items-center gap-4 py-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Profissional</div>
                    <div className="flex items-center gap-2">
                      {selectedProfessional.imageUrl ? (
                        <Image
                          src={selectedProfessional.imageUrl}
                          alt={selectedProfessional.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs">
                          {selectedProfessional.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-right font-semibold text-gray-900 text-sm">
                        {selectedProfessional.name}
                      </div>
                    </div>
                  </div>
                )}
                {appointment.date && (
                  <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Data</div>
                    <div className="text-right font-semibold text-gray-900 text-sm">
                      {new Date(
                        appointment.date + "T00:00:00"
                      ).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                )}
                {appointment.time && (
                  <div className="flex justify-between items-start gap-4 pt-4">
                    <div className="text-sm text-gray-500">Hora</div>
                    <div className="text-right font-semibold text-gray-900 text-sm">
                      {appointment.time}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
