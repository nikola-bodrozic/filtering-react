import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  startTransition,
  useState,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const FilterMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /* -------------------- REFS (NO RERENDERS) -------------------- */
  const mapRef = useRef<google.maps.Map | null>(null);
  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const arrivalTriggeredRef = useRef(false);

  const movingPosRef = useRef<{ lat: number; lng: number }>({
    lat: 50.0796,
    lng: 14.4295,
  });

  /* -------------------- STATE (UI ONLY) -------------------- */
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);

  /* -------------------- CONSTANTS -------------------- */
  const STEPS = 10;

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

  /* -------------------- MEMOS -------------------- */
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

  /* -------------------- HELPERS -------------------- */
  const metersBetween = (
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const aa =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    return R * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
  };

  /* -------------------- MOVEMENT LOOP -------------------- */
  const startMovement = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    stepRef.current = 0;
    arrivalTriggeredRef.current = false;
    movingPosRef.current = ultimateFrisbeeStore;

    intervalRef.current = window.setInterval(() => {
      stepRef.current += 1;
      const t = stepRef.current / STEPS;

      if (t >= 1) {
        stepRef.current = 0;
        movingPosRef.current = ultimateFrisbeeStore;
      } else {
        movingPosRef.current = {
          lat:
            ultimateFrisbeeStore.lat +
            (cafeTvaroh.lat - ultimateFrisbeeStore.lat) * t,
          lng:
            ultimateFrisbeeStore.lng +
            (cafeTvaroh.lng - ultimateFrisbeeStore.lng) * t,
        };
      }

      // 🔥 Move marker imperatively (NO REACT RENDER)
      movingMarkerRef.current?.setPosition(movingPosRef.current);

      // Arrival detection
      const dist = metersBetween(movingPosRef.current, cafeTvaroh);

      if (dist <= 200 && !arrivalTriggeredRef.current) {
        arrivalTriggeredRef.current = true;

        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        movingMarkerRef.current?.setPosition(cafeTvaroh);

        startTransition(() => {
          setShowArrivalPopup(true);
        });
      }
    }, 1000);
  };

  /* -------------------- MAP LOAD -------------------- */
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
        if (status === "OK" && result) setDirections(result);
        else setDirectionsError(status);
      },
    );

    startMovement();
  }, []);

  /* -------------------- CLEANUP -------------------- */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* -------------------- RENDER -------------------- */
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
          <Marker position={ultimateFrisbeeStore} />
          <Marker position={cafeTvaroh} />

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}

          {/* Moving marker (renders once) */}
          <Marker
            onLoad={(marker) => (movingMarkerRef.current = marker)}
            position={ultimateFrisbeeStore}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        </GoogleMap>
      </LoadScript>

      {showArrivalPopup && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#1976D2",
            color: "white",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <strong>Arrived</strong>
          <div style={{ marginTop: 6 }}>
            <button onClick={() => setShowArrivalPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterMap;
