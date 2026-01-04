// Service interface
export interface Service {
  id: string;
  name: string;
  duration: string | number;
  price: number;
  imageUrl?: string;
  category?: string;
  description?: string;
}

// Professional interface
export interface Professional {
  id: string;
  name: string;
  position?: string;
  department?: string;
  imageUrl?: string;
}

// Message option interface
export interface MessageOption {
  id: string;
  label: string;
}

// Appointment data interface
export interface AppointmentData {
  id: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  professional: string;
  service: string;
  email: string;
}

// Appointment state interface
export interface AppointmentState {
  service_id: string;
  professional_id: string;
  appointment_date: string;
  appointment_time: string;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: string; text: string }>;
}

// Booking user interface
export interface BookingUser {
  name?: string;
  phone?: string;
}

// Checkout form interface
export interface CheckoutForm {
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string;
  notes: string;
  password: string;
}
