import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from "@react-google-maps/api";

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const FilterMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<google.maps.Map | null>(null);
  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  // Map container style
  const mapStyles = { height: "80vh", width: "100%" };

  // Start / End coordinates
  const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
  const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };

  // Map center
  const mapCenter = useMemo(
    () => ({
      lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
      lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
    }),
    []
  );

  const mapOptions = useMemo(
    () => ({
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      gestureHandling: "cooperative",
      disableDefaultUI: false,
      clickableIcons: false,
      keyboardShortcuts: false,
    }),
    []
  );

  // Get directions
  const getDirections = async (): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      if (!window.google) return reject("Google Maps not loaded");

      const ds = new google.maps.DirectionsService();
      ds.route(
        {
          origin: ultimateFrisbeeStore,
          destination: cafeTvaroh,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === "OK" && result) resolve(result);
          else reject(status);
        }
      );
    });
  };

  // Extract path for animation
  const extractPath = (result: google.maps.DirectionsResult, stepSize = 20) => {
    const route = result.routes[0];
    const path: google.maps.LatLngLiteral[] = [];

    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        step.path.forEach((p, index) => {
          if (index % stepSize === 0) {
            path.push({ lat: p.lat(), lng: p.lng() });
          }
        });
      });
    });

    return path;
  };

  // Animate marker imperatively
  const animateMarker = (path: google.maps.LatLngLiteral[], speed = 60) => {
    let index = 0;

    const move = () => {
      if (!movingMarkerRef.current || index >= path.length) {
        setShowArrivalPopup(true);
        return;
      }
      movingMarkerRef.current.setPosition(path[index]);
      index++;
      setTimeout(() => requestAnimationFrame(move), speed); // control speed here
    };

    move();
  };

  // On map load
  const onMapLoad = useCallback(async (map: google.maps.Map) => {
    mapRef.current = map;

    // Create moving marker only once
    if (!movingMarkerRef.current) {
      movingMarkerRef.current = new google.maps.Marker({
        map,
        position: ultimateFrisbeeStore,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        },
        zIndex: 9999,
      });
    }

    try {
      const result = await getDirections();
      setDirections(result);

      const path = extractPath(result);
      animateMarker(path, 80); // adjust speed in ms per step
    } catch (err) {
      console.error("Directions error:", err);
    }
  }, []);

  // auto-hide arrival popup after 4 seconds
  useEffect(() => {
    if (!showArrivalPopup) return;
    const t = window.setTimeout(() => setShowArrivalPopup(false), 4000);
    return () => clearTimeout(t);
  }, [showArrivalPopup]);

  if (!apiKey) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "red",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <h2>Google Maps API Key Missing</h2>
          <p>Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "80vh", marginTop: "50px" }}>
      <LoadScript googleMapsApiKey={apiKey} libraries={GOOGLE_MAP_LIBRARIES}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={mapCenter}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* Static markers */}
          <Marker
            position={ultimateFrisbeeStore}
            title={"ultimateFrisbeeStore"}
            icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
          />
          <Marker
            position={cafeTvaroh}
            title={"cafeTvaroh"}
            icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
          />
          {/* moving green marker */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}
        </GoogleMap>
      </LoadScript>
      {/* Arrival popup */}
      {showArrivalPopup && (
        <div
          id="arrival"
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#1976D2",
            color: "white",
            padding: "10px 14px",
            borderRadius: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <strong>Arrived</strong>
          <div style={{ fontSize: 12, marginTop: 4 }}>Destination reached</div>
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <button
              onClick={() => setShowArrivalPopup(false)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "white",
                padding: "4px 8px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterMap;
