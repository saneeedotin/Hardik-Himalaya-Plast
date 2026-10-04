"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  CheckCircle2,
  Volume2,
  VolumeX,
  ShieldAlert,
  Camera,
  CameraOff,
  Upload,
  RefreshCw,
  AlertCircle,
  Truck,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { Html5Qrcode } from "html5-qrcode";

export function DispatchScannerView({
  deliveryNotes,
}: {
  deliveryNotes: any[];
}) {
  const [selectedNote, setSelectedNote] = useState<any>(
    deliveryNotes[0] || null
  );
  const [manualCode, setManualCode] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  
  // Camera & Device State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);
  const isStarting = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playChime = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate([100]); } catch (e) {}
    }
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const playBuzzer = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate([200, 100, 200]); } catch (e) {}
    }
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const executeScan = async (code: string, isOverride = false) => {
    const trimmed = (code || "").trim();
    if (!trimmed) return;
    setScanning(true);

    try {
      const res = await fetch("/api/dispatch/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartonCode: trimmed,
          override: isOverride,
          overrideNote: isOverride ? overrideReason : "",
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      if (res.ok && data.success) {
        playChime();
        setLastScanResult({
          success: true,
          message: data.message || `Verified carton ${trimmed}`,
          code: trimmed,
        });

        // Update local carton state
        if (selectedNote && selectedNote.cartons) {
          const updatedCartons = selectedNote.cartons.map((c: any) =>
            c.cartonCode === trimmed
              ? { ...c, scanned: true, scannedAt: new Date() }
              : c
          );
          setSelectedNote({ ...selectedNote, cartons: updatedCartons });
        }

        if (data.isComplete) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } else {
        playBuzzer();
        setLastScanResult({
          success: false,
          message: data.error || "Scan rejected or duplicate.",
          code: trimmed,
        });
      }
    } catch (err: any) {
      playBuzzer();
      setLastScanResult({
        success: false,
        message: err.message || "Network error",
        code: trimmed,
      });
    } finally {
      setScanning(false);
      setManualCode("");
      if (isOverride) {
        setOverrideModalOpen(false);
        setOverrideReason("");
      }
    }
  };

  // Safe camera stop
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Camera stop error:", err);
      } finally {
        scannerRef.current = null;
        setCameraActive(false);
        isStarting.current = false;
      }
    }
  };

  // Robust camera start with device fallback
  const startCamera = async (overrideCameraId?: string) => {
    if (isStarting.current || scannerRef.current?.isScanning) return;
    isStarting.current = true;
    setCameraError(null);

    try {
      // 1. Check camera permissions & devices
      let cameras: Array<{ id: string; label: string }> = [];
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          cameras = devices;
          setAvailableCameras(devices);
          if (!selectedCameraId && devices[0]) {
            setSelectedCameraId(devices[0].id);
          }
        }
      } catch (devErr) {
        console.warn("Could not enumerate cameras:", devErr);
      }

      // Clean up previous instance if any
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) await scannerRef.current.stop();
          await scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const scanConfig = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      const handleDecoded = (decodedText: string) => {
        const now = Date.now();
        if (decodedText !== lastScannedCode.current || now - lastScanTime.current > 3000) {
          lastScannedCode.current = decodedText;
          lastScanTime.current = now;
          executeScan(decodedText);
        }
      };

      const targetCamera = overrideCameraId || selectedCameraId;

      // Try camera starting sequence: Specific ID -> Environment (back) -> User (front) -> First device
      if (targetCamera) {
        await html5QrCode.start(targetCamera, scanConfig, handleDecoded, () => {});
      } else {
        try {
          await html5QrCode.start({ facingMode: "environment" }, scanConfig, handleDecoded, () => {});
        } catch (backErr) {
          console.info("Back camera unavailable, attempting front/default camera...", backErr);
          if (cameras.length > 0) {
            await html5QrCode.start(cameras[0].id, scanConfig, handleDecoded, () => {});
          } else {
            await html5QrCode.start({ facingMode: "user" }, scanConfig, handleDecoded, () => {});
          }
        }
      }

      setCameraActive(true);
      setCameraError(null);
    } catch (err: any) {
      console.error("Camera startup failed:", err);
      setCameraActive(false);
      setCameraError(
        err?.message || "Webcam access denied or no camera device found on this system."
      );
    } finally {
      isStarting.current = false;
    }
  };

  // Image QR code scan from file
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScanning(true);
      const tempScanner = scannerRef.current || new Html5Qrcode("qr-reader");
      const decodedResult = await tempScanner.scanFile(file, true);
      if (decodedResult) {
        executeScan(decodedResult);
      }
    } catch (err: any) {
      playBuzzer();
      setLastScanResult({
        success: false,
        message: "No QR barcode detected in the uploaded file.",
        code: file.name,
      });
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    // Attempt camera start on mount
    const timer = setTimeout(() => {
      startCamera();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {}
      }
    };
  }, []);

  const cartons = selectedNote?.cartons || [];
  const scannedCount = cartons.filter((c: any) => c.scanned).length;
  const totalCount = cartons.length;
  const progressPercent =
    totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && scannedCount === totalCount;

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        .laser-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #10b981;
          box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
          z-index: 20;
          animation: scan 2s linear infinite;
          opacity: 0.85;
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem !important;
        }
      `}} />

      {/* Hidden File Input for Image QR Scanning */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileScan}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              Dock Gate Scanner
            </span>
            <span className="text-xs text-slate-400">PWA Barcode Terminal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Dispatch Loading Station
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time optical QR barcode verification before vehicle loading.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Delivery Note Selector */}
          {deliveryNotes.length > 0 && (
            <select
              value={selectedNote?.id || ""}
              onChange={(e) => {
                const dn = deliveryNotes.find((d: any) => d.id === e.target.value);
                if (dn) {
                  setSelectedNote(dn);
                  setLastScanResult(null);
                  lastScannedCode.current = null;
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
            >
              {deliveryNotes.map((dn: any) => (
                <option key={dn.id} value={dn.id}>
                  {dn.dnNumber} — {dn.customerName}
                </option>
              ))}
            </select>
          )}

          {/* Camera Selection Dropdown */}
          {availableCameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                stopCamera().then(() => startCamera(e.target.value));
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-slate-300"
            >
              {availableCameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id.slice(0, 4)}...`}
                </option>
              ))}
            </select>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Audio feedback"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Audio</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* File Upload Scan Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Scan from image file"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Upload QR</span>
          </button>

          {/* Camera Power Toggle */}
          <button
            onClick={cameraActive ? stopCamera : () => startCamera()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              cameraActive
                ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-400 hover:bg-rose-100"
                : "bg-[#0d382c] border-[#0d382c] text-white hover:bg-[#0a2e24]"
            }`}
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Turn Off</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Turn On Camera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Viewfinder & Progress + Cartons Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Viewport & Count (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Viewport Box */}
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col items-center justify-between min-h-[420px]">
            {/* Target Reticle / Camera Container */}
            <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-zinc-800 bg-slate-900 flex flex-col items-center justify-center shadow-inner">
              {/* HTML5 QR Container */}
              <div id="qr-reader" className="w-full h-full object-cover"></div>

              {cameraActive ? (
                <>
                  {/* Laser Sweeper */}
                  <div className="laser-line"></div>
                  {/* Targeting Brackets */}
                  <div className="absolute inset-5 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none z-10"></div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-center p-6 z-10">
                  <QrCode className="w-16 h-16 text-slate-600 mb-3" />
                  <h4 className="text-sm font-semibold text-white">Camera Standby</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {cameraError ? cameraError : "Click below to activate optical webcam or scan carton barcodes manually."}
                  </p>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startCamera()}
                      className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{cameraError ? "Retry Camera" : "Turn On"}</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>File</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Arm's Length Counter Display */}
            <div className="w-full mt-6 text-center">
              <div className="text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                <span className="text-[#0d382c] dark:text-emerald-400">
                  {scannedCount}
                </span>{" "}
                / {totalCount}
              </div>
              <span className="text-xs uppercase font-medium text-slate-400 mt-1 block">
                Cartons Verified ({progressPercent}%)
              </span>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#0d382c] dark:bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Scan Notification */}
            {lastScanResult && (
              <div
                className={`w-full mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  lastScanResult.success
                    ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300 border border-emerald-500/20"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {lastScanResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{lastScanResult.message}</span>
                </div>
                <span className="font-mono text-[10px] opacity-75 shrink-0">
                  {lastScanResult.code}
                </span>
              </div>
            )}
          </div>

          {/* Manual Barcode Input */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex gap-2">
            <input
              type="text"
              placeholder="Or enter barcode string manually (e.g. HP-CTN-BATCH-FG-00101-004)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeScan(manualCode)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
            />
            <button
              onClick={() => executeScan(manualCode)}
              disabled={scanning || !manualCode.trim()}
              className="py-1.5 px-4 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs transition-all shadow-2xs disabled:opacity-50"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Right Column: Cartons Checklist & Instant Simulation (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                {selectedNote?.dnNumber || "DN-26-00001"}
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {selectedNote?.customerName || "Apex Windows & Façade Ltd"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Vehicle: {selectedNote?.vehicleNumber || "GJ-01-EE-4921"} • LR: {selectedNote?.lrNumber || "VT-992140"}
              </p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isAllComplete
                  ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {isAllComplete ? "Dispatched" : "In Progress"}
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block sticky top-0 bg-white dark:bg-zinc-950 py-1 z-10">
              Cartons In Consignment
            </span>

            {cartons.length === 0 && (
              <div className="text-xs text-slate-500 py-6 text-center">
                No cartons associated with this delivery note.
              </div>
            )}

            {cartons.map((c: any) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  c.scanned
                    ? "bg-[#eaf3ef]/50 dark:bg-[#162a24]/40 border-[#0d382c]/20 text-slate-800 dark:text-slate-200"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {c.cartonCode}
                    </span>
                    {c.scanned && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0d382c] dark:text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {c.quantity} m • {c.scanned ? "Verified & Cleared" : "Pending dock scan"}
                  </span>
                </div>

                {!c.scanned ? (
                  <button
                    onClick={() => executeScan(c.cartonCode)}
                    disabled={scanning}
                    className="py-1 px-3 rounded-lg bg-[#0d382c] hover:bg-[#08261e] text-white font-semibold text-[11px] transition-all shadow-2xs"
                  >
                    Simulate Scan
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            {isAllComplete ? (
              <a
                href="/tally"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Proceed to Tally Invoicing &rarr;</span>
              </a>
            ) : (
              <button
                onClick={() => setOverrideModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Supervisor Override</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 max-w-sm w-full shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Supervisor Count Override
            </h3>
            <p className="text-xs text-slate-500">
              Provide authorization reason for manual carton verification.
            </p>

            <textarea
              rows={2}
              placeholder="e.g. Scuffed label on carton 5..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0a2e24]"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const pending = cartons.find((c: any) => !c.scanned);
                  if (pending) executeScan(pending.cartonCode, true);
                }}
                disabled={!overrideReason.trim()}
                className="flex-1 py-1.5 rounded-lg bg-[#0a2e24] text-white text-xs font-medium disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
