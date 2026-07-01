import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2 } from "lucide-react";

// Toshkent markazi
const TASHKENT: [number, number] = [41.3111, 69.2797];

// Oltin pin (rasm asset muammosidan qochish uchun divIcon)
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="transform:translate(-50%,-100%)">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s7-7.16 7-12A7 7 0 0 0 5 10c0 4.84 7 12 7 12z" fill="#B08D57" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12" cy="10" r="2.6" fill="#fff"/>
      </svg>
    </div>`,
  iconSize: [34, 34],
  iconAnchor: [0, 0],
});

export interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  onChange: (loc: PickedLocation) => void;
}

// Xaritada bosishni ushlovchi
function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ onChange }: Props) {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  // Koordinatadan manzilni aniqlash (reverse geocoding — Nominatim)
  async function resolve(lat: number, lng: number) {
    setPos([lat, lng]);
    setLoading(true);
    let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
      );
      const data = await res.json();
      if (data?.display_name) address = data.display_name as string;
    } catch {
      /* manzil aniqlanmasa, koordinata qoladi */
    }
    setLoading(false);
    onChange({ lat, lng, address });
  }

  // "Mening joylashuvim" — brauzer GPS
  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p.coords.latitude, p.coords.longitude),
      () => setLoading(false)
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          Xaritadan joyni belgilang
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          className="tap flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium text-charcoal"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MapPin className="h-3.5 w-3.5 text-gold" />
          )}
          Mening joyim
        </button>
      </div>

      <div className="overflow-hidden rounded-ios-lg border border-white/10 shadow-glass">
        <MapContainer
          center={TASHKENT}
          zoom={12}
          style={{ height: "320px", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={resolve} />
          {pos && (
            <Marker
              position={pos}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng();
                  resolve(ll.lat, ll.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
