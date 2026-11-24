import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="position: relative; width: 18px; height: 18px;">
      <span style="position: absolute; inset: 0; border-radius: 9999px; background: radial-gradient(circle, rgba(96,165,250,1) 0%, rgba(59,130,246,0.4) 100%); box-shadow: 0 0 0 8px rgba(96,165,250,0.14);"></span>
      <span style="position: absolute; inset: 4px; border-radius: 9999px; background: white;"></span>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function ContactMap() {
  const position: [number, number] = [10.9639, -74.7964];

  return (
    <div className="relative z-0 h-80 w-full overflow-hidden rounded-4xl border border-(--border) shadow-(--card-shadow) sm:h-105 lg:h-130">
      <MapContainer center={position} zoom={12} scrollWheelZoom className="relative z-0 h-full w-full" attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs text-white backdrop-blur">
        Barranquilla, Colombia
      </div>
    </div>
  );
}
