import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  startTransition,
  useEffect,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const FilterMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* ======================= REFS ======================= */
  const mapRef = useRef<google.maps.Map | null>(null);
  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeIndexRef = useRef(0);
  const arrivalTriggeredRef = useRef(false);
  const arrivalTimerRef = useRef<number | null>(null);

  /* ======================= STATE ======================= */
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
  const cafeTvaroh = { lat: 50.0878, lng: 14.4212, name: "Café Tvaroh" };

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

  /* ======================= HELPERS ======================= */
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const getDirections = async (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
  ): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      const ds = new google.maps.DirectionsService();
      ds.route(
        { origin, destination, travelMode: google.maps.TravelMode.WALKING },
        (result, status) => {
          if (status === "OK" && result) resolve(result);
          else reject(status);
        },
      );
    });
  };

  const moveMarkerAlongPath = async (path: google.maps.LatLng[]) => {
    if (!movingMarkerRef.current || path.length === 0) return;

    arrivalTriggeredRef.current = false;

    for (let i = 0; i < path.length; i++) {
      movingMarkerRef.current.setPosition(path[i]);
      routeIndexRef.current = i;

      // Trigger arrival popup at last point
      if (i === path.length - 1 && !arrivalTriggeredRef.current) {
        arrivalTriggeredRef.current = true;
        startTransition(() => {
          setShowArrivalPopup(true);
          arrivalTimerRef.current = setTimeout(
            () => setShowArrivalPopup(false),
            4000,
          );
        });
      }

      await sleep(300); // speed: 300ms per point
    }
  };

  useEffect(() => {
    return () => {
      if (arrivalTimerRef.current) {
        clearTimeout(arrivalTimerRef.current);
        arrivalTimerRef.current = null;
      }
    };
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    (async () => {
      try {
        const result = await getDirections(ultimateFrisbeeStore, cafeTvaroh);
        setDirections(result);

        const path: google.maps.LatLng[] = result.routes[0].overview_path;

        // Start movement only after path is ready
        await moveMarkerAlongPath(path);
      } catch (error) {
        console.error("Directions error:", error);
        setDirectionsError(String(error));
      }
    })();
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

          {/* Moving marker */}
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

      {directionsError && (
        <div style={{ color: "red", marginTop: 10 }}>
          Route error: {directionsError}
        </div>
      )}
    </div>
  );
};

export default FilterMap;
