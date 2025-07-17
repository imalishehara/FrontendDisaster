import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Alert {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function DisasterMap() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("http://localhost:5158/Alerts/all");
        const data = await res.json();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    }

    fetchAlerts();
  }, []);

  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={8}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {alerts.map(alert => (
        <CircleMarker
          key={alert.id}
          center={[alert.latitude, alert.longitude]}
          radius={10}
          pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.5 }}
        >
          <Popup>
            <strong>{alert.title}</strong>
            <br />
            {alert.description}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
