"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";

export type DetectedLocation = {
  lat: number;
  lng: number;
  address: string;
  /** City matched to our department routing keys, or "Default". */
  city: string;
};

const KNOWN_CITIES = ["Chennai", "Mumbai", "Delhi", "Bengaluru"];

function matchCity(raw: string | undefined): string {
  if (!raw) return "Default";
  const r = raw.toLowerCase();
  if (r.includes("bengaluru") || r.includes("bangalore")) return "Bengaluru";
  const found = KNOWN_CITIES.find((c) => r.includes(c.toLowerCase()));
  return found ?? "Default";
}

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    const a = data.address ?? {};
    const cityRaw = a.city || a.town || a.village || a.state_district || a.county || a.state;
    return {
      address: data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      city: matchCity(cityRaw || data.display_name),
    };
  } catch {
    return { address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, city: "Default" };
  }
}

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:1;transform:translate(-50%,-100%)">📍</div>`,
  iconSize: [0, 0],
});

export default function LocationPicker({
  onChange,
}: {
  onChange: (loc: DetectedLocation | null) => void;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loc, setLoc] = useState<DetectedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Initialize the map once we have a position.
  function ensureMap(lat: number, lng: number) {
    if (!mapEl.current) return;
    if (!mapRef.current) {
      const map = L.map(mapEl.current, { attributionControl: true, zoomControl: true }).setView([lat, lng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map);
      marker.on("dragend", async () => {
        const p = marker.getLatLng();
        await updateFrom(p.lat, p.lng);
      });
      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([lat, lng], 16);
      markerRef.current?.setLatLng([lat, lng]);
    }
    // Leaflet needs a size recalc when revealed inside a flex/card.
    setTimeout(() => mapRef.current?.invalidateSize(), 60);
  }

  async function updateFrom(lat: number, lng: number) {
    setGeocoding(true);
    const { address, city } = await reverseGeocode(lat, lng);
    const next: DetectedLocation = { lat, lng, address, city };
    setLoc(next);
    onChange(next);
    setGeocoding(false);
  }

  function detect() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMsg("Location is not supported on this device. You can still submit without it.");
      return;
    }
    setStatus("locating");
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatus("ready");
        ensureMap(latitude, longitude);
        await updateFrom(latitude, longitude);
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it, or submit without a pin."
            : "Couldn't get your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-saffron" />
        <span className="text-sm font-medium text-white/80">Location of the issue</span>
      </div>

      {status === "idle" && (
        <button
          onClick={detect}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-saffron/40 bg-saffron/10 px-4 py-2.5 text-sm font-semibold text-saffron transition hover:bg-saffron/20 active:scale-[0.99]"
        >
          <LocateFixed className="h-4 w-4" />
          Detect my current location
        </button>
      )}

      {status === "locating" && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Detecting your location…
        </div>
      )}

      {status === "error" && (
        <div className="mt-3">
          <p className="text-sm text-amber-300/90">{errorMsg}</p>
          <button
            onClick={detect}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )}

      {/* Map (kept mounted once ready so Leaflet can size it) */}
      <div className={status === "ready" ? "mt-3 block" : "hidden"}>
        <p className="mb-2 text-xs text-white/50">Drag the 📍 pin to the exact spot.</p>
        <div
          ref={mapEl}
          className="h-56 w-full overflow-hidden rounded-xl border border-white/10"
          style={{ background: "#111" }}
        />
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
          <p className="text-xs leading-relaxed text-white/70">
            {geocoding ? "Finding address…" : loc?.address ?? "—"}
            {loc && loc.city !== "Default" && (
              <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80">
                {loc.city}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={detect}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Re-detect
        </button>
      </div>
    </div>
  );
}
