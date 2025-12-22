"use client"

import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import { useChat } from "@ai-sdk/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setLoading(true)
    try {
      const userMessage = { id: Date.now().toString(), role: "user" as const, content: inputValue }
      setMessages([...messages, userMessage])
      setInputValue("")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue }),
      })

      const data = await response.json()
      const assistantMessage = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: data.content || data.message }
      setMessages((prev: any) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-bold">Bem-vindo ao Agenda.ai</h2>
                <p className="text-muted-foreground mt-2">
                  Converse comigo para agendar um serviço
                </p>
              </div>
            </div>
          )}

          {messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-xs ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t px-5 py-6">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
