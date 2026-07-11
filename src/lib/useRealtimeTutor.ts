"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, unwrap } from "./api";

export interface TutorTurn {
  role: "tutor" | "learner";
  content: string;
}

export type ToolCall =
  | { name: "draw_diagram"; args: { mermaid: string; title?: string } }
  | { name: "draw_illustration"; args: { title?: string; shapes: unknown[] } }
  | { name: "write_code"; args: { language?: string; code: string; note?: string } }
  | { name: "ask_quiz"; args: { question: string; options: string[]; answerIndex?: number; explanation?: string } }
  | { name: "start_challenge"; args: { focus?: string } };

type Status = "idle" | "connecting" | "connected" | "error";

const TUTOR_TOOLS = [
  {
    type: "function",
    name: "draw_diagram",
    description:
      "Render a diagram on the learner screen using Mermaid syntax. Best for data structures, control flow, trees, graphs, state machines, sequences and relationships.",
    parameters: {
      type: "object",
      properties: {
        mermaid: { type: "string", description: 'Valid Mermaid source, e.g. "graph TD; A-->B;"' },
        title: { type: "string" },
      },
      required: ["mermaid"],
    },
  },
  {
    type: "function",
    name: "draw_illustration",
    description:
      "Sketch a live illustration on a 600x400 canvas (origin top-left) from simple shapes (rect, circle, line, arrow, text). Call repeatedly to grow the picture step by step; each call redraws the whole scene.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        shapes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["rect", "circle", "line", "arrow", "text"] },
              x: { type: "number" },
              y: { type: "number" },
              x2: { type: "number" },
              y2: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
              r: { type: "number" },
              text: { type: "string" },
              color: { type: "string", description: "'accent','primary','muted','good','bad' or a CSS color" },
            },
            required: ["kind"],
          },
        },
      },
      required: ["shapes"],
    },
  },
  {
    type: "function",
    name: "write_code",
    description:
      "Write or replace the code in the shared editor so the learner watches it appear. Use to demo, scaffold, or fix their code.",
    parameters: {
      type: "object",
      properties: {
        language: { type: "string", enum: ["javascript", "python", "java", "cpp"] },
        code: { type: "string" },
        note: { type: "string" },
      },
      required: ["code"],
    },
  },
  {
    type: "function",
    name: "ask_quiz",
    description:
      "Pop a quick multiple-choice comprehension check on the learner screen. Use it often to keep them active. Keep options short.",
    parameters: {
      type: "object",
      properties: {
        question: { type: "string" },
        options: { type: "array", items: { type: "string" } },
        answerIndex: { type: "integer" },
        explanation: { type: "string" },
      },
      required: ["question", "options"],
    },
  },
  {
    type: "function",
    name: "start_challenge",
    description:
      "Give the learner a small auto-graded coding challenge to apply what you just taught. Use when they seem ready. The problem and a Submit button appear in their editor; you'll be told how they did.",
    parameters: {
      type: "object",
      properties: { focus: { type: "string", description: "Optional sub-topic to target." } },
    },
  },
];

/** Live speech-to-speech tutoring (Sage) over the OpenAI Realtime API, with
 *  agentic tools that draw/type on the learner's screen. */
export function useRealtimeTutor({
  enabled,
  topic,
  language,
  coachId,
  muted,
  onToolCall,
}: {
  enabled: boolean;
  topic: string;
  language?: string;
  coachId?: string;
  muted: boolean;
  onToolCall?: (call: ToolCall) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [turns, setTurns] = useState<TutorTurn[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bufferRef = useRef("");
  const onToolCallRef = useRef(onToolCall);
  const pendingToolsRef = useRef<string[]>([]);
  const activeResponseRef = useRef(false);
  const pendingUserTurnRef = useRef(false);

  useEffect(() => {
    onToolCallRef.current = onToolCall;
  }, [onToolCall]);

  const handleEvent = useCallback((evt: { type: string; [k: string]: unknown }) => {
    switch (evt.type) {
      case "response.audio_transcript.delta":
      case "response.output_audio_transcript.delta":
        bufferRef.current += (evt.delta as string) || "";
        setCurrentMessage(bufferRef.current);
        break;
      case "response.audio_transcript.done":
      case "response.output_audio_transcript.done": {
        const text = ((evt.transcript as string) || bufferRef.current).trim();
        if (text) {
          setCurrentMessage(text);
          setTurns((p) => [...p, { role: "tutor", content: text }]);
        }
        bufferRef.current = "";
        break;
      }
      case "conversation.item.input_audio_transcription.completed": {
        const text = ((evt.transcript as string) || "").trim();
        if (text) setTurns((p) => [...p, { role: "learner", content: text }]);
        break;
      }
      case "output_audio_buffer.started":
        setIsSpeaking(true);
        break;
      case "output_audio_buffer.stopped":
      case "output_audio_buffer.cleared":
        setIsSpeaking(false);
        break;
      case "response.output_item.done": {
        const item = evt.item as { type?: string; name?: string; arguments?: string; call_id?: string } | undefined;
        if (item?.type === "function_call") {
          let args: unknown = {};
          try {
            args = JSON.parse(item.arguments || "{}");
          } catch {}
          try {
            onToolCallRef.current?.({ name: item.name, args } as ToolCall);
          } catch {}
          if (item.call_id) pendingToolsRef.current.push(item.call_id);
        }
        break;
      }
      case "response.created":
        activeResponseRef.current = true;
        break;
      case "response.done": {
        activeResponseRef.current = false;
        const pending = pendingToolsRef.current;
        pendingToolsRef.current = [];
        const wantUser = pendingUserTurnRef.current;
        pendingUserTurnRef.current = false;
        const dc = dcRef.current;
        if (!dc || dc.readyState !== "open") break;
        for (const callId of pending) {
          dc.send(
            JSON.stringify({
              type: "conversation.item.create",
              item: { type: "function_call_output", call_id: callId, output: JSON.stringify({ ok: true }) },
            })
          );
        }
        if (pending.length || wantUser) dc.send(JSON.stringify({ type: "response.create" }));
        break;
      }
      case "error":
        setErrorMsg(((evt.error as { message?: string })?.message as string) || "Realtime error");
        break;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    try {
      dcRef.current?.close();
    } catch {}
    dcRef.current = null;
    micRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    try {
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    startedRef.current = false;
    activeResponseRef.current = false;
    pendingToolsRef.current = [];
    pendingUserTurnRef.current = false;
    bufferRef.current = "";
  }, []);

  const connect = useCallback(async () => {
    if (startedRef.current || !topic) return;
    startedRef.current = true;
    setStatus("connecting");
    setErrorMsg("");
    try {
      const data = unwrap<{ token: string; model: string; voice?: string; instructions?: string }>(
        await api("/v1/concept-coach/realtime-session", {
          method: "POST",
          body: { topic, ...(language ? { language } : {}), ...(coachId ? { coachId } : {}) },
        })
      );
      const { token, model, voice, instructions } = data;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const audio = new Audio();
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0];
      };

      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micRef.current = mic;
      mic.getTracks().forEach((track) => pc.addTrack(track, mic));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.onmessage = (ev) => {
        try {
          handleEvent(JSON.parse(ev.data));
        } catch {}
      };
      dc.onopen = () => {
        try {
          dc.send(
            JSON.stringify({
              type: "session.update",
              session: {
                type: "realtime",
                ...(instructions ? { instructions } : {}),
                tools: TUTOR_TOOLS,
                tool_choice: "auto",
                audio: {
                  input: {
                    // Server-side noise reduction so background sound isn't
                    // mistaken for speech / transcribed as a bogus reply.
                    noise_reduction: { type: "near_field" },
                    transcription: { model: "whisper-1" },
                    turn_detection: { type: "semantic_vad", eagerness: "medium", interrupt_response: true },
                  },
                  output: { voice: voice || "ash" },
                },
              },
            })
          );
          dc.send(JSON.stringify({ type: "response.create" }));
        } catch {}
      };

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        if (st === "connected") setStatus("connected");
        else if (st === "failed") {
          setErrorMsg("Connection failed. Please try again.");
          setStatus("error");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`, {
        method: "POST",
        body: offer.sdp,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/sdp" },
      });
      if (!sdpRes.ok) throw new Error(`Realtime handshake failed (${sdpRes.status})`);
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

      // Meter per minute — charge the first minute immediately on connect so
      // short sessions still pay (a realtime voice minute costs real money).
      const doTick = async () => {
        try {
          const r = unwrap<{ ok: boolean }>(await api("/v1/concept-coach/tick", { method: "POST" }));
          if (!r?.ok) {
            setErrorMsg("You have run out of credits. The session will close.");
            disconnect();
          }
        } catch {}
      };
      void doTick();
      tickRef.current = setInterval(doTick, 60000);
    } catch (e) {
      const err = e as { name?: string; message?: string };
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError")
        setErrorMsg("Microphone access is blocked. Allow the mic, then try again.");
      else if (err?.name === "NotFoundError" || err?.name === "NotReadableError")
        setErrorMsg("No microphone found, or it is in use by another app.");
      else setErrorMsg(err?.message || "Could not start the session.");
      setStatus("error");
      startedRef.current = false;
    }
  }, [topic, language, coachId, handleEvent, disconnect]);

  useEffect(() => {
    micRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }, [muted, status]);

  useEffect(() => {
    if (enabled && topic) connect();
    else disconnect();
    return () => disconnect();
  }, [enabled, topic, connect, disconnect]);

  const sendText = useCallback((text: string) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !text.trim()) return;
    dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
      })
    );
    if (activeResponseRef.current) pendingUserTurnRef.current = true;
    else dc.send(JSON.stringify({ type: "response.create" }));
  }, []);

  return { status, isSpeaking, currentMessage, turns, errorMsg, sendText };
}
