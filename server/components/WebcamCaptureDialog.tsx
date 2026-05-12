"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { useEffect, useRef, useState } from "react";
import {
  X,
  AlertCircle,
  Loader2,
  Camera,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

export function WebcamCaptureDialog({
  open,
  onCapture,
  onClose,
}: {
  open: boolean;
  onCapture: (file: File, base64: string, previewUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStarting(true);
    let cancelled = false;

    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง");
        }
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : {
                facingMode: "environment",
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        // List devices after permission granted (labels are populated then)
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setDevices(list.filter((d) => d.kind === "videoinput"));
        }
        setStarting(false);
      } catch (e) {
        const err = e as Error;
        let message = err.message;
        if (err.name === "NotAllowedError" || err.name === "SecurityError") {
          message =
            "เบราว์เซอร์ไม่อนุญาตให้เข้าถึงกล้อง — กด 'อนุญาต' ในป๊อปอัพแล้วลองใหม่";
        } else if (err.name === "NotFoundError") {
          message = "ไม่พบกล้อง — เครื่องนี้ไม่มี webcam หรือกล้องถูกปิด";
        } else if (err.name === "NotReadableError") {
          message = "กล้องถูกใช้งานโดยโปรแกรมอื่น — ปิดโปรแกรมที่ใช้กล้องก่อน";
        }
        setError(message);
        setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deviceId]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        const file = new File([blob], `webcam-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = dataUrl.split(",")[1] ?? "";
        onCapture(file, base64, previewUrl);
        onClose();
      },
      "image/jpeg",
      0.85
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full h-full sm:max-w-3xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden flex flex-col bg-black">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 px-5 py-3 flex items-center justify-between bg-gradient-to-b from-black/70 via-black/40 to-transparent text-white">
          <div className="flex items-center gap-2 font-semibold">
            <Camera className="h-4 w-4" />
            ถ่ายรูปด้วยกล้อง Webcam
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 transition-colors"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video / error state */}
        <div className="flex-1 flex items-center justify-center relative">
          {error ? (
            <div className="text-center p-8 max-w-md">
              <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-3" />
              <p className="text-white text-sm leading-relaxed mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setStarting(true);
                  setDeviceId((d) => d);
                }}
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
                ลองใหม่
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
          )}

          {starting && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">กำลังเปิดกล้อง...</span>
            </div>
          )}

          {/* Card frame guide overlay */}
          {!error && !starting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-xl border-2 border-white/70"
                style={{
                  width: "min(80%, 560px)",
                  aspectRatio: "1.65 / 1",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                }}
              >
                <div className="absolute top-3 left-3 right-3 text-center text-white text-xs font-medium">
                  วางนามบัตรในกรอบให้ครบทั้งใบ
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Device picker */}
        {devices.length > 1 && !error && (
          <div className="absolute top-16 left-0 right-0 z-10 flex justify-center">
            <div className="relative">
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur text-white text-sm rounded-full pl-4 pr-8 py-1.5 border border-white/20 focus:outline-none"
              >
                <option value="">กล้องอัตโนมัติ</option>
                {devices.map((d, idx) => (
                  <option
                    key={d.deviceId}
                    value={d.deviceId}
                    className="text-slate-900"
                  >
                    {d.label || `กล้อง ${idx + 1}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white pointer-events-none" />
            </div>
          </div>
        )}

        {/* Capture button */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3">
          <button
            onClick={handleCapture}
            disabled={starting || !!error}
            className="w-16 h-16 rounded-full bg-white shadow-soft-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="ถ่ายรูป"
          >
            <span className="w-12 h-12 rounded-full bg-white border-4 border-slate-900" />
          </button>
          <p className="text-white/70 text-xs">กดเพื่อถ่ายรูป</p>
        </div>
      </div>
    </div>
  );
}
