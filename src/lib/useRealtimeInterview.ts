"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, unwrap } from "./api";

export interface RealtimeTurn {
  role: "interviewer" | "candidate";
  content: string;
}

type Status = "idle" | "connecting" | "connected" | "error";

const FILLER = new Set([
  "uh", "um", "umm", "uhh", "uhm", "hmm", "hm", "mm", "mmm", "ah", "er", "erm", "huh",
]);

/** Only respond to real speech (the VAD can end a "turn" on a cough or noise). */
function isMeaningful(raw: string): boolean {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return false;
  if (/^[[(].*[\])]$/.test(s)) return false;
  const cleaned = s.replace(/[^a-z0-9']/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return false;
  const words = cleaned.split(" ").filter((w) => w && !FILLER.has(w));
  return words.some((w) => w.length >= 2);
}

/**
 * Live speech-to-speech mock interview over the OpenAI Realtime API (WebRTC).
 * The backend mints a short-lived ephemeral token (our key never reaches the
 * browser). We drive Alex's replies ourselves — gating on a meaningful
 * transcript — so he never answers a cough or a pause.
 */
export function useRealtimeInterview({
  enabled,
  sessionId,
  muted,
}: {
  enabled: boolean;
  sessionId: string;
  muted: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [isAlexSpeaking, setIsAlexSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [turns, setTurns] = useState<RealtimeTurn[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [outOfCredits, setOutOfCredits] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bufferRef = useRef("");
  const activeResponseRef = useRef(false);
  const pendingRespondRef = useRef(false);

  const persistTurn = useCallback(
    (turn: RealtimeTurn) => {
      setTurns((prev) => [...prev, turn]);
      api(`/v1/live-interview/${sessionId}/transcript`, {
        method: "POST",
        body: { turns: [turn] },
      }).catch(() => {});
    },
    [sessionId]
  );

  const handleEvent = useCallback(
    (evt: { type: string; [k: string]: unknown }) => {
      switch (evt.type) {
        case "response.audio_transcript.delta":
        case "response.output_audio_transcript.delta":
          bufferRef.current += (evt.delta as string) || "";
          setCurrentQuestion(bufferRef.current);
          break;
        case "response.audio_transcript.done":
        case "response.output_audio_transcript.done": {
          const text = ((evt.transcript as string) || bufferRef.current).trim();
          if (text) {
            setCurrentQuestion(text);
            persistTurn({ role: "interviewer", content: text });
          }
          bufferRef.current = "";
          break;
        }
        case "conversation.item.input_audio_transcription.completed": {
          const text = ((evt.transcript as string) || "").trim();
          if (!isMeaningful(text)) break;
          persistTurn({ role: "candidate", content: text });
          const dc = dcRef.current;
          if (dc && dc.readyState === "open") {
            if (activeResponseRef.current) pendingRespondRef.current = true;
            else dc.send(JSON.stringify({ type: "response.create" }));
          }
          break;
        }
        case "response.created":
          activeResponseRef.current = true;
          break;
        case "response.done": {
          activeResponseRef.current = false;
          if (pendingRespondRef.current) {
            pendingRespondRef.current = false;
            const dc = dcRef.current;
            if (dc && dc.readyState === "open")
              dc.send(JSON.stringify({ type: "response.create" }));
          }
          break;
        }
        case "output_audio_buffer.started":
          setIsAlexSpeaking(true);
          break;
        case "output_audio_buffer.stopped":
        case "output_audio_buffer.cleared":
          setIsAlexSpeaking(false);
          break;
        case "error":
          setErrorMsg(
            ((evt.error as { message?: string })?.message as string) || "Realtime error"
          );
          break;
      }
    },
    [persistTurn]
  );

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
    setIsAlexSpeaking(false);
    startedRef.current = false;
    activeResponseRef.current = false;
    pendingRespondRef.current = false;
    bufferRef.current = "";
  }, []);

  const connect = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStatus("connecting");
    setErrorMsg("");
    try {
      const data = unwrap<{ token: string; model: string; voice?: string; instructions?: string }>(
        await api(`/v1/live-interview/${sessionId}/realtime-session`, { method: "POST" })
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
                audio: {
                  input: {
                    transcription: { model: "whisper-1" },
                    turn_detection: {
                      type: "server_vad",
                      threshold: 0.6,
                      prefix_padding_ms: 300,
                      silence_duration_ms: 900,
                      create_response: false,
                      interrupt_response: true,
                    },
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
      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`,
        {
          method: "POST",
          body: offer.sdp,
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/sdp" },
        }
      );
      if (!sdpRes.ok) throw new Error(`Realtime handshake failed (${sdpRes.status})`);
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

      tickRef.current = setInterval(async () => {
        try {
          const r = unwrap<{ ok: boolean }>(
            await api(`/v1/live-interview/${sessionId}/tick`, { method: "POST" })
          );
          if (!r?.ok) {
            setOutOfCredits(true);
            setErrorMsg("You have run out of credits. The interview will close.");
            disconnect();
          }
        } catch {}
      }, 60000);
    } catch (e) {
      const err = e as { name?: string; message?: string };
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setErrorMsg("Microphone access is blocked. Allow the mic in your browser, then try again.");
      } else if (err?.name === "NotFoundError" || err?.name === "NotReadableError") {
        setErrorMsg("No microphone was found, or it is in use by another app.");
      } else {
        setErrorMsg(err?.message || "Could not start the interview.");
      }
      setStatus("error");
      startedRef.current = false;
    }
  }, [sessionId, handleEvent, disconnect]);

  useEffect(() => {
    micRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }, [muted, status]);

  useEffect(() => {
    if (enabled && sessionId) connect();
    else disconnect();
    return () => disconnect();
  }, [enabled, sessionId, connect, disconnect]);

  const sendText = useCallback((text: string) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !text.trim()) return;
    dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
      })
    );
    if (activeResponseRef.current) pendingRespondRef.current = true;
    else dc.send(JSON.stringify({ type: "response.create" }));
  }, []);

  return { status, isAlexSpeaking, currentQuestion, turns, errorMsg, outOfCredits, sendText };
}
