import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
  startTransition,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const FilterMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* ======================= REFS (NO RERENDERS) ======================= */
  const mapRef = useRef<google.maps.Map | null>(null);
  const movingMarkerRef = useRef<google.maps.Marker | null>(null);

  const intervalRef = useRef<number | null>(null);
  const routePathRef = useRef<google.maps.LatLng[]>([]);
  const routeIndexRef = useRef(0);
  const arrivalTriggeredRef = useRef(false);

  /* ======================= STATE (UI ONLY) ======================= */
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);

  /* ======================= CONSTANTS ======================= */
  const ultimateFrisbeeStore = {
    lat: 50.0796,
    lng: 14.4295,
    name: "Ultimate Frisbee Store",
  };

  const cafeTvaroh = {
    lat: 50.0878,
    lng: 14.4212,
    name: "Café Tvaroh",
  };

  /* ======================= MEMOS ======================= */
  const mapCenter = useMemo(
    () => ({
      lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
      lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
    }),
    [],
  );

  const mapOptions = useMemo(
    () => ({
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      gestureHandling: "cooperative",
      clickableIcons: false,
    }),
    [],
  );

  /* ======================= ROUTE MOVEMENT ======================= */
  const startMovement = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    routeIndexRef.current = 0;
    arrivalTriggeredRef.current = false;

    intervalRef.current = window.setInterval(() => {
      const path = routePathRef.current;
      const i = routeIndexRef.current;

      if (!path.length || !movingMarkerRef.current) return;

      // reached destination
      if (i >= path.length - 1) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        startTransition(() => {
          setShowArrivalPopup(true);
        });
        return;
      }

      // move marker along route
      movingMarkerRef.current.setPosition(path[i]);
      routeIndexRef.current += 1;
    }, 300); // adjust speed here
  };

  /* ======================= MAP LOAD ======================= */
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    const ds = new google.maps.DirectionsService();
    ds.route(
      {
        origin: ultimateFrisbeeStore,
        destination: cafeTvaroh,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status !== "OK" || !result) {
          setDirectionsError(status);
          return;
        }

        setDirections(result);

        // 🔥 Extract route geometry
        const route = result.routes[0];
        const path: google.maps.LatLng[] = [];

        route.legs[0].steps.forEach((step) => {
          step.path.forEach((point) => path.push(point));
        });

        routePathRef.current = path;

        startMovement();
      },
    );
  }, []);

  /* ======================= CLEANUP ======================= */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* ======================= RENDER ======================= */
  if (!apiKey) {
    return <div style={{ color: "red" }}>Missing Google Maps API key</div>;
  }

  return (
    <div style={{ height: "80vh", marginTop: 50, position: "relative" }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ height: "100%", width: "100%" }}
          zoom={14}
          center={mapCenter}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* Static markers */}
          <Marker position={ultimateFrisbeeStore} />
          <Marker position={cafeTvaroh} />

          {/* Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}

          {/* Moving marker (renders ONCE) */}
          <Marker
            onLoad={(marker) => (movingMarkerRef.current = marker)}
            position={ultimateFrisbeeStore}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
            zIndex={999}
          />
        </GoogleMap>
      </LoadScript>

      {/* Arrival popup */}
      {showArrivalPopup && (
        <div
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
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Destination reached
          </div>
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

      {directionsError && (
        <div style={{ color: "red", marginTop: 10 }}>
          Route error: {directionsError}
        </div>
      )}
    </div>
  );
};

export default FilterMap;
