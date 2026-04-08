"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { EchoState } from "./EchoBlob";

type Intent = "opener" | "discovery" | "checkin" | "closer" | "freeform";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceControllerProps {
  onStateChange: (state: EchoState) => void;
  onEchoSpeak?: (text: string) => void;
  children?: (props: {
    speak: (intent: Intent, userMessage?: string) => Promise<void>;
    startListening: () => void;
    stopListening: () => void;
    isListening: boolean;
    isSpeaking: boolean;
    lastEchoMessage: string;
  }) => React.ReactNode;
}

export default function VoiceController({
  onStateChange,
  onEchoSpeak,
  children,
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastEchoMessage, setLastEchoMessage] = useState("");
  const historyRef = useRef<Message[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        historyRef.current.push({ role: "user", content: transcript });
        setIsListening(false);
        onStateChange("thinking");
        // Send to Echo
        fetchEchoResponse("freeform", transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      onStateChange("idle");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onStateChange]);

  const fetchEchoResponse = useCallback(
    async (intent: Intent, userMessage?: string) => {
      onStateChange("thinking");

      try {
        const response = await fetch("/api/echo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: historyRef.current,
            intent,
          }),
        });

        const data = await response.json();
        const text = data.text;

        if (text) {
          historyRef.current.push({ role: "assistant", content: text });
          setLastEchoMessage(text);
          onEchoSpeak?.(text);
          speakText(text);
        } else {
          onStateChange("idle");
        }
      } catch {
        onStateChange("idle");
      }
    },
    [onStateChange, onEchoSpeak]
  );

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to pick a warm voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Samantha") ||
            v.name.includes("Google US English") ||
            v.name.includes("Aria") ||
            v.name.includes("Natural"))
      );
      if (preferred) {
        utterance.voice = preferred;
      } else {
        const enVoice = voices.find((v) => v.lang.startsWith("en-US"));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStateChange("speaking");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onStateChange("idle");
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        onStateChange("idle");
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [onStateChange]
  );

  const speak = useCallback(
    async (intent: Intent, userMessage?: string) => {
      if (userMessage) {
        historyRef.current.push({ role: "user", content: userMessage });
      }
      await fetchEchoResponse(intent, userMessage);
    },
    [fetchEchoResponse]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      onStateChange("listening");
    } catch {
      // Already started
    }
  }, [onStateChange]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  return (
    <>
      {children?.({
        speak,
        startListening,
        stopListening,
        isListening,
        isSpeaking,
        lastEchoMessage,
      })}
    </>
  );
}
