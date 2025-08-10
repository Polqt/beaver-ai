"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${userMessage.content}". This is a demo response. In a real implementation, this would be connected to an AI service like OpenAI, Claude, or a custom AI model.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-border p-4 md:p-6 bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl md:text-2xl text-foreground flex items-center gap-2">
              🤖 Beaver AI Assistant
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Ask me anything about our services and get personalized recommendations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground hidden sm:block">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto chat-scrollbar p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-background/50 to-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start",
              message.isUser ? "message-enter-user" : "message-enter-ai"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 text-sm md:text-base shadow-sm",
                message.isUser
                  ? "bg-primary text-primary-foreground ml-4 md:ml-8"
                  : "bg-muted text-foreground mr-4 md:mr-8 border border-border"
              )}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              <div className={cn(
                "text-xs mt-2 opacity-70",
                message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground border border-border rounded-2xl p-3 md:p-4 text-sm md:text-base mr-4 md:mr-8 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-muted-foreground text-xs">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 md:p-6 bg-card/50 backdrop-blur-sm">
        <div className="flex items-end space-x-3 md:space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send)"
              className="w-full min-h-[44px] md:min-h-[50px] max-h-[120px] md:max-h-[150px] p-3 md:p-4 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder-muted-foreground text-sm md:text-base transition-all duration-200"
              disabled={isLoading}
              rows={1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {inputValue.length}/500
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="h-[44px] md:h-[50px] px-4 md:px-6 rounded-xl font-medium text-sm md:text-base shadow-sm hover:shadow-md transition-all duration-200"
            size="lg"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden">→</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setInputValue("What services do you offer?")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            💼 Services
          </button>
          <button
            onClick={() => setInputValue("Show me recommendations")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            ⭐ Recommendations
          </button>
          <button
            onClick={() => setInputValue("How does this work?")}
            className="px-3 py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-full transition-colors duration-200 hover:scale-105"
            disabled={isLoading}
          >
            ❓ Help
          </button>
        </div>
      </div>
    </div>
  );
}
