"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Camera, Mic, CheckCircle2, AlertCircle, RefreshCw, Circle, Square, RotateCcw, Play, Pause, HelpCircle } from "lucide-react";

type Permission = "idle" | "requesting" | "granted" | "denied";
type TestStage = "idle" | "recording" | "review";

type CameraSetupProps = {
  onReady: () => void;
  onSkip: () => void;
  onHelp: () => void;
};

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const TEST_MAX = 10; // seconds for test recording

export function CameraSetup({ onReady, onSkip, onHelp }: CameraSetupProps) {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [permission, setPermission] = useState<Permission>("idle");
  const [cameraLabel, setCameraLabel] = useState("");
  const [micLabel, setMicLabel] = useState("");

  const [testStage, setTestStage] = useState<TestStage>("idle");
  const [recLeft, setRecLeft] = useState(TEST_MAX);
  const [testUrl, setTestUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startStream = async () => {
    setPermission("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
      setCameraLabel(stream.getVideoTracks()[0]?.label || "Camera");
      setMicLabel(stream.getAudioTracks()[0]?.label || "Microphone");
      setPermission("granted");
    } catch {
      setPermission("denied");
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (testUrl) URL.revokeObjectURL(testUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep live feed synced when switching back from review
  useEffect(() => {
    if (liveVideoRef.current && streamRef.current && testStage !== "review") {
      liveVideoRef.current.srcObject = streamRef.current;
    }
  }, [testStage]);

  const startTestRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setTestUrl(URL.createObjectURL(blob));
      setTestStage("review");
      setIsPlaying(false);
    };
    recorder.start();
    setTestStage("recording");
    setRecLeft(TEST_MAX);
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
  }, []);

  const stopTestRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  }, []);

  const retakeTest = useCallback(() => {
    if (testUrl) URL.revokeObjectURL(testUrl);
    setTestUrl(null);
    setIsPlaying(false);
    setRecLeft(TEST_MAX);
    setTestStage("idle");
  }, [testUrl]);

  const togglePlayback = useCallback(() => {
    const vid = reviewVideoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setIsPlaying(true); }
    else { vid.pause(); setIsPlaying(false); }
  }, []);

  const recPct = (recLeft / TEST_MAX) * 100;

  return (
    <div className="animate-fade-up flex flex-col gap-4 px-3 pb-3 pt-2">
      <div className="overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white">

        {/* Video area */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#f3f2ed]">
          {/* Live feed */}
          {testStage !== "review" && (
            permission === "granted" ? (
              <video ref={liveVideoRef} autoPlay muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
            ) : permission === "denied" ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertCircle className="size-8 text-red-400" />
                <p className="text-[14px] font-medium text-foreground/70">Camera access was blocked</p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="size-10 animate-pulse rounded-full bg-foreground/10" />
                <p className="text-[13px] text-foreground/40">
                  {permission === "requesting" ? "Requesting access…" : "Initialising camera…"}
                </p>
              </div>
            )
          )}

          {/* Review playback */}
          {testStage === "review" && testUrl && (
            <>
              <video
                ref={reviewVideoRef}
                src={testUrl}
                playsInline
                onEnded={() => setIsPlaying(false)}
                className="h-full w-full object-cover"
              />
              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <span className={cn(
                  "flex size-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity duration-200",
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                  {isPlaying
                    ? <Pause className="size-5 fill-white" />
                    : <Play className="size-5 fill-white translate-x-[2px]" />
                  }
                </span>
              </button>
            </>
          )}

          {/* Live badge */}
          {permission === "granted" && testStage === "idle" && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
              <span className="text-[11px] font-medium text-white">Live preview</span>
            </div>
          )}

          {/* REC badge */}
          {testStage === "recording" && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
              <span className="text-[11px] font-medium text-white">REC {formatTime(recLeft)}</span>
            </div>
          )}

          {/* Preview badge */}
          {testStage === "review" && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-white">Test preview</span>
            </div>
          )}
        </div>

        {/* Device status */}
        {permission === "granted" && (
          <div className="flex flex-col divide-y divide-[#f0f0f0]">
            <div className="flex items-center gap-3 px-4 py-3">
              <Camera className="size-4 shrink-0 text-foreground/40" />
              <p className="flex-1 truncate text-[13px] text-foreground/70">{cameraLabel}</p>
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Mic className="size-4 shrink-0 text-foreground/40" />
              <p className="flex-1 truncate text-[13px] text-foreground/70">{micLabel}</p>
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            </div>
          </div>
        )}

        {/* Retry when denied */}
        {permission === "denied" && (
          <div className="px-4 py-3">
            <button onClick={startStream} className="flex items-center gap-2 text-[13px] font-medium text-foreground/60 hover:text-foreground transition-colors">
              <RefreshCw className="size-3.5" />
              Try again
            </button>
          </div>
        )}

        {/* Test recording status */}
        {permission === "granted" && (testStage === "recording" || testStage === "review") && (
          <div className="border-t border-[#f0f0f0] px-4 py-3 flex flex-col gap-2">
            {testStage === "recording" && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-foreground/50">Recording test…</p>
                  <p className={cn("text-[12px] font-semibold tabular-nums", recLeft <= 3 ? "text-red-500" : "text-foreground/60")}>
                    {formatTime(recLeft)}
                  </p>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-linear", recLeft <= 3 ? "bg-red-400" : "bg-[#3770E5]")}
                    style={{ width: `${recPct}%` }}
                  />
                </div>
              </>
            )}
            {testStage === "review" && (
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-foreground/50">Looks good? Play it back above.</p>
                <button
                  onClick={retakeTest}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-foreground/50 hover:text-foreground transition-colors"
                >
                  <RotateCcw className="size-3" />
                  Retake
                </button>
              </div>
            )}
          </div>
        )}

        {/* Troubleshooting note */}
        <div className="border-t border-[#f0f0f0] px-4 py-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold text-foreground/30">
              If your microphone and camera are not working
            </p>
            <button
              type="button"
              onClick={onHelp}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f6f0f6] px-2.5 py-1 text-[11px] font-semibold text-foreground/60 transition-[background-color,color,scale] duration-150 ease-out hover:bg-[#f0e4f0] hover:text-foreground active:scale-[0.96]"
            >
              <HelpCircle className="size-3" />
              Help
            </button>
          </div>
          <p className="text-[12px] leading-relaxed text-foreground/50">
            Issue may be caused by missing the &quot;Allow&quot; prompt or having restricted device settings. Double-check your system permissions.
          </p>
        </div>
      </div>

      {/* CTA */}
      {testStage === "review" ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={retakeTest}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3.5 text-sm font-semibold text-foreground transition-[opacity,scale] duration-150 ease-out hover:bg-black/5 active:scale-[0.96]"
          >
            <RotateCcw className="size-3.5" />
            Retry
          </button>
          <button
            onClick={onReady}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
          >
            Looks good — start video questions
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={testStage === "idle" ? startTestRecording : stopTestRecording}
            disabled={permission !== "granted"}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-semibold transition-[opacity,scale] duration-150 ease-out",
              permission === "granted"
                ? "border-border text-foreground hover:bg-black/5 active:scale-[0.96]"
                : "cursor-not-allowed border-transparent bg-[#f0f0f0] text-foreground/30"
            )}
          >
            {permission !== "granted" ? (
              "Waiting for camera access…"
            ) : testStage === "recording" ? (
              <><Square className="size-3.5 fill-current" /> Stop recording</>
            ) : (
              <><Circle className="size-3.5 fill-red-400 text-red-400" /> Record test clip</>
            )}
          </button>
          {permission !== "granted" && (
            <button
              onClick={onSkip}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
            >
              Continue anyway
            </button>
          )}
        </div>
      )}
    </div>
  );
}
