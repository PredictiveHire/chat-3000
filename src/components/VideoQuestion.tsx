"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Circle, Square, RotateCcw, Send, Play, Pause } from "lucide-react";

const MAX_TRIES = 5;

type Stage = "prepare" | "countdown" | "recording" | "review";

type VideoQuestionProps = {
  question: string;
  currentIndex?: number;
  total?: number;
  maxSeconds?: number;
  initialTriesUsed?: number;
  onTriesUsedChange?: (triesUsed: number) => void;
  onSubmit: (value: string, videoUrl?: string) => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoQuestion({
  question,
  currentIndex,
  total,
  maxSeconds = 120,
  initialTriesUsed = 0,
  onTriesUsedChange,
  onSubmit,
}: VideoQuestionProps) {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stage, setStage] = useState<Stage>("prepare");
  const [recLeft, setRecLeft] = useState(maxSeconds);
  const [countdown, setCountdown] = useState(3);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [triesUsed, setTriesUsed] = useState(initialTriesUsed);
  const [isPlaying, setIsPlaying] = useState(false);

  const triesLeft = MAX_TRIES - triesUsed;
  const canRetry = triesLeft > 0;

  const attachStream = useCallback(async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch {
      // stream may already be open from CameraSetup
    }
  }, []);

  useEffect(() => {
    attachStream();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync live feed whenever stage changes back to a live stage
  useEffect(() => {
    if (liveVideoRef.current && streamRef.current && stage !== "review") {
      liveVideoRef.current.srcObject = streamRef.current;
    }
  }, [stage]);

  const startCountdown = useCallback(() => {
    setStage("countdown");
    setCountdown(3);
    let c = 3;
    timerRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timerRef.current!);
        startRecording();
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordingUrl(url);
      setStage("review");
      setIsPlaying(false);
    };
    recorder.start();
    setStage("recording");
    setRecLeft(maxSeconds);

    timerRef.current = setInterval(() => {
      setRecLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          recorder.stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [maxSeconds]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setTriesUsed(t => {
      const next = t + 1;
      onTriesUsedChange?.(next);
      return next;
    });
  }, [onTriesUsedChange]);

  const reRecord = useCallback(() => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setRecLeft(maxSeconds);
    setStage("prepare");
    setIsPlaying(false);
  }, [maxSeconds, recordingUrl]);

  const togglePlayback = useCallback(() => {
    const vid = reviewVideoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onSubmit("__video_submitted__", recordingUrl ?? undefined);
  }, [onSubmit, recordingUrl]);

  const recPct = (recLeft / maxSeconds) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Video area */}
      <div className="relative flex-1 overflow-hidden bg-[#111]">
        {/* Live camera */}
        {stage !== "review" && (
          <video
            ref={liveVideoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover scale-x-[-1]"
          />
        )}

        {/* Review playback */}
        {stage === "review" && recordingUrl && (
          <>
            <video
              ref={reviewVideoRef}
              src={recordingUrl}
              playsInline
              onEnded={() => setIsPlaying(false)}
              className="h-full w-full object-cover"
            />
            {/* Play/pause overlay */}
            <button
              onClick={togglePlayback}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className={cn(
                "flex size-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity duration-200",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}>
                {isPlaying
                  ? <Pause className="size-6 fill-white" />
                  : <Play className="size-6 fill-white translate-x-[2px]" />
                }
              </span>
            </button>
          </>
        )}

        {/* Countdown overlay */}
        {stage === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-[80px] font-bold text-white tabular-nums leading-none">
              {countdown}
            </span>
          </div>
        )}

        {/* REC badge */}
        {stage === "recording" && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
            <span className="text-[11px] font-medium text-white">REC {formatTime(recLeft)}</span>
          </div>
        )}

        {/* Review badge */}
        {stage === "review" && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-white">Preview</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 bg-background px-4 pb-5 pt-4">
        {stage === "prepare" && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={startCountdown}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
            >
              <span className="flex items-center justify-center gap-2">
                <Circle className="size-3.5 fill-current" />
                Start recording
              </span>
            </button>
            <p className="text-[12px] text-foreground/40">
              {triesUsed + 1}/{MAX_TRIES} attempt{MAX_TRIES > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {stage === "countdown" && (
          <p className="text-center text-[13px] text-foreground/40">Get ready…</p>
        )}

        {stage === "recording" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-foreground/50">Time remaining</p>
              <p className={cn("text-[13px] font-semibold tabular-nums", recLeft <= 10 ? "text-red-500" : "text-foreground/70")}>
                {formatTime(recLeft)}
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-linear",
                  recLeft <= 10 ? "bg-red-400" : "bg-[#3770E5]"
                )}
                style={{ width: `${recPct}%` }}
              />
            </div>
            <button
              onClick={stopRecording}
              className="w-full rounded-2xl bg-[#f3f2ed] py-3.5 text-sm font-semibold text-foreground/70 transition-[opacity,scale] duration-150 ease-out hover:opacity-80 active:scale-[0.96]"
            >
              <span className="flex items-center justify-center gap-2">
                <Square className="size-3.5 fill-current" />
                Stop recording
              </span>
            </button>
          </div>
        )}

        {stage === "review" && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-foreground/50 text-center">
              Happy with your response? Submit, or re-record{canRetry ? ` (${triesLeft} attempt${triesLeft === 1 ? "" : "s"} left)` : " — no attempts left"}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={reRecord}
                disabled={!canRetry}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-medium transition-[opacity,scale] duration-150 ease-out",
                  canRetry
                    ? "border-[#e5e5e5] text-foreground/60 hover:opacity-80 active:scale-[0.96]"
                    : "cursor-not-allowed border-[#f0f0f0] text-foreground/20"
                )}
              >
                <RotateCcw className="size-3.5" />
                Re-record
              </button>
              <button
                onClick={handleSubmit}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
              >
                <Send className="size-3.5" />
                Submit answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
