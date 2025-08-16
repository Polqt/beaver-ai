import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchChatbotResponse(userId: string, queryText: string) {
  const res = await fetch('http://127.0.0.1:8000/api/v1/chatbot/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, queryText }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail = data?.detail || `API error: ${res.status}`;
    throw new Error(detail);
  }
  return data;
}
