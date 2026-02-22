import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMap,
  Polyline,
} from "react-leaflet";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./LocationMap.css";
import L from "leaflet";

// Fix vector icon issue with Leaflet in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const LocationMap = ({
  coordinates,
  title = "Bike Location",
  draggable = false,
  onLocationChange = null,
}) => {
  const [userDistance, setUserDistance] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userPosition, setUserPosition] = useState(null); // [lat, lng]
  const [viewMode, setViewMode] = useState("bike"); // 'bike', 'user', 'both'

  // coordinates are usually [longitude, latitude] from MongoDB GeoJSON
  if (!coordinates || (Array.isArray(coordinates) && coordinates.length !== 2))
    return null;

  // Extract lat/lng correctly regardless of format
  const [lng, lat] = Array.isArray(coordinates)
    ? coordinates
    : coordinates.coordinates;
  const bikePosition = [lat, lng]; // Leaflet uses [lat, lng]

  const handleCheckDistance = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = calculateDistance(latitude, longitude, lat, lng);
        setUserDistance(dist.toFixed(1));
        setUserPosition([latitude, longitude]);
        setViewMode("both");
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        alert("Unable to fetch your location. Please check your permissions.");
        setIsLocating(false);
      },
      { timeout: 10000 },
    );
  };

  const handleOpenInMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  // Component to handle marker drag events (Phase 2)
  const DraggableMarker = () => {
    return (
      <Marker
        draggable={draggable}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            if (onLocationChange) {
              const { lat: newLat, lng: newLng } = marker.getLatLng();
              onLocationChange([newLng, newLat]);
            }
          },
        }}
        position={bikePosition}
      />
    );
  };

  // Component to update map center and fit bounds (Phase 3)
  const MapController = ({ bikePos, userPos, mode }) => {
    const map = useMap();

    useEffect(() => {
      if (mode === "both" && userPos) {
        const bounds = L.latLngBounds([bikePos, userPos]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (mode === "user" && userPos) {
        map.setView(userPos, 14);
      } else {
        map.setView(bikePos, 13);
      }
    }, [bikePos, userPos, mode, map]);

    return null;
  };

  return (
    <div className="location-map-wrapper">
      <div
        className="location-map-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h3 className="location-map-title" style={{ margin: 0 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {title}
        </h3>
        {userPosition && (
          <div className="map-view-toggles">
            <button
              className={`view-toggle-btn ${viewMode === "bike" ? "active" : ""}`}
              onClick={() => setViewMode("bike")}
              title="Focus on Bike"
            >
              🚲
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "both" ? "active" : ""}`}
              onClick={() => setViewMode("both")}
              title="See Both"
            >
              🗺️
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "user" ? "active" : ""}`}
              onClick={() => setViewMode("user")}
              title="Focus on Me"
            >
              👤
            </button>
          </div>
        )}
      </div>

      <div className="location-map-container">
        <MapContainer
          center={bikePosition}
          zoom={13}
          scrollWheelZoom={false}
          className="location-map"
          attributionControl={false}
        >
          <MapController
            bikePos={bikePosition}
            userPos={userPosition}
            mode={viewMode}
          />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {draggable ? (
            <DraggableMarker />
          ) : (
            <>
              {/* Bike Location Marker */}
              <Marker position={bikePosition}>
                <Circle
                  center={bikePosition}
                  pathOptions={{
                    fillColor: "var(--primary-color, #7c3aed)",
                    color: "var(--primary-color, #7c3aed)",
                    fillOpacity: 0.1,
                  }}
                  radius={800}
                />
              </Marker>

              {/* User Location Marker */}
              {userPosition && (
                <>
                  <Marker
                    position={userPosition}
                    icon={L.divIcon({
                      className: "user-location-marker",
                      html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>',
                      iconSize: [18, 18],
                    })}
                  />
                  {/* Visual Line between pins */}
                  <Polyline
                    positions={[bikePosition, userPosition]}
                    pathOptions={{
                      color: "var(--primary-color, #7c3aed)",
                      dashArray: "10, 10",
                      weight: 2,
                      opacity: 0.6,
                    }}
                  />
                </>
              )}
            </>
          )}
        </MapContainer>

        {/* Buttons Overlay */}
        {!draggable && (
          <div className="map-overlay-bottom">
            {userDistance !== null && (
              <div className="distance-badge">
                <span>📍</span>
                <span>{userDistance} km away</span>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {!userPosition ? (
                <button
                  className="btn-map-action btn-map-primary"
                  onClick={handleCheckDistance}
                  disabled={isLocating}
                >
                  {isLocating ? "Detecting..." : "📍 Check Distance"}
                </button>
              ) : (
                <button className="btn-map-action" onClick={handleOpenInMaps}>
                  Open in Google Maps
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

LocationMap.propTypes = {
  coordinates: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.object,
  ]),
  title: PropTypes.string,
  draggable: PropTypes.bool,
  onLocationChange: PropTypes.func,
};

export default LocationMap;
