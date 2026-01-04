import { useState, useEffect } from "react";
import { ChatMessage, BookingUser } from "../types";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [bookingUser, setBookingUser] = useState<BookingUser | null>(() => {
    try {
      const stored = localStorage.getItem("bookingUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Função para adicionar mensagem
  const sendMessage = (message: { text: string }) => {
    const id = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "assistant",
        parts: [{ type: "text", text: message.text }],
      },
    ]);
  };

  // Registrar cliente no Supabase apenas se tiver nome e telefone
  useEffect(() => {
    if (bookingUser?.name && bookingUser?.phone) {
      fetch("/api/register-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: bookingUser.name, phone: bookingUser.phone }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.customerId) {
            setCustomerId(data.customerId);
          }
        })
        .catch(() => {
          // Handle error silently
        });
    }
  }, [bookingUser]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    bookingUser,
    setBookingUser,
    customerId,
    setCustomerId,
    sendMessage,
  };
};
