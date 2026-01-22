import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  startTransition,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const FilterMap: React.FC = () => {
  const mapStyles = { height: "80vh", width: "100%" };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(
      `[TrackMap committed render #${renderCount.current}]`,
      performance.now().toFixed(2),
      "ms",
    );
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const [directions, setDirections] =
    React.useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = React.useState<string | null>(
    null,
  );

  // Moving marker state (starts at Ultimate Frisbee Store and moves toward Café Tvaroh)
  const [movingPos, setMovingPos] = React.useState<{
    lat: number;
    lng: number;
  }>({ lat: 50.0796, lng: 14.4295 });
  const stepRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const STEPS = 10; // number of steps to reach destination (one step per second)

  // Coordinates
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

  // Map center
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
      disableDefaultUI: false,
      clickableIcons: false,
      keyboardShortcuts: false,
    }),
    [],
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.addListener("tilesloaded", () => {
      console.log("[Map tilesloaded]", performance.now().toFixed(2), "ms");
    });
    // Request walking directions when the map is ready
    try {
      const ds = new google.maps.DirectionsService();
      ds.route(
        {
          origin: ultimateFrisbeeStore,
          destination: cafeTvaroh,
          travelMode: google.maps.TravelMode.WALKING,
          provideRouteAlternatives: false,
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
          } else {
            setDirectionsError(status);
            console.error("Directions request failed:", status);
          }
        },
      );
    } catch (err) {
      console.error("DirectionsService error", err);
    }

    // Start moving marker interval (updates every second)
    // If an interval is already running, clear it first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset position and step
    stepRef.current = 0;
    setMovingPos(ultimateFrisbeeStore);

    intervalRef.current = window.setInterval(() => {
      stepRef.current += 1;
      const t = stepRef.current / STEPS;
      if (t >= 1) {
        // reached destination, reset to start and restart
        stepRef.current = 0;
        setMovingPos(ultimateFrisbeeStore);
        return;
      }
      const lat =
        ultimateFrisbeeStore.lat +
        (cafeTvaroh.lat - ultimateFrisbeeStore.lat) * t;
      const lng =
        ultimateFrisbeeStore.lng +
        (cafeTvaroh.lng - ultimateFrisbeeStore.lng) * t;
      setMovingPos({ lat, lng });
    }, 1000);
  }, []);

  // Cleanup moving marker interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Haversine distance helper (meters)
  const metersBetween = (
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa =
      sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  // Log moving marker coords whenever they update
  useEffect(() => {
    console.log(
      `[MovingPin] ${new Date().toISOString()} lat=${movingPos.lat.toFixed(6)} lng=${movingPos.lng.toFixed(6)}`,
    );
  }, [movingPos]);

  // Arrival detection: show popup when within 200m of destination
  const arrivalTriggeredRef = useRef<boolean>(false);
  const [showArrivalPopup, setShowArrivalPopup] =
    React.useState<boolean>(false);

  useEffect(() => {
    const dist = metersBetween(movingPos, cafeTvaroh);
    let arrivalAutoDismissTimer: number | null = null;

    // if within 200m and not yet triggered, show popup and stop movement
    if (dist <= 200 && !arrivalTriggeredRef.current) {
      arrivalTriggeredRef.current = true;
      console.log(
        "[MovingPin] arrived (within 200m) dist=",
        Math.round(dist),
        "m",
      );

      // stop the movement interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log("[MovingPin] movement stopped");
      }
      // not
      // setMovingPos({ lat: cafeTvaroh.lat, lng: cafeTvaroh.lng });
      // setShowArrivalPopup(true);
      // but 
      // wrap in startTransition
      startTransition(() => {
        setMovingPos({ lat: cafeTvaroh.lat, lng: cafeTvaroh.lng });
        setShowArrivalPopup(true);
      });
    }

    // reset trigger if moved away beyond 250m so we can re-trigger on next arrival
    if (dist > 250) {
      arrivalTriggeredRef.current = false;
    }

    arrivalAutoDismissTimer = window.setTimeout(
      () => setShowArrivalPopup(false),
      4000,
    );
    return () => {
      if (arrivalAutoDismissTimer) clearTimeout(arrivalAutoDismissTimer);
    };
  }, [movingPos]);

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
    <>
      <div
        style={{
          position: "relative",
          height: "80vh",
          overflow: "hidden",
          marginTop: "50px",
        }}
      >
        <LoadScript
          googleMapsApiKey={apiKey}
          loadingElement={
            <div
              style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "18px",
                color: "#666",
              }}
            >
              Loading Prague Map...
            </div>
          }
          onError={(error) =>
            console.error("Error loading Google Maps:", error)
          }
          libraries={["places"]}
        >
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={14}
            center={mapCenter}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Markers */}
            <Marker
              position={ultimateFrisbeeStore}
              title={ultimateFrisbeeStore.name}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />
            <Marker
              position={cafeTvaroh}
              title={cafeTvaroh.name}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
            />

            {/* Walking route between markers */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: { strokeColor: "#1976D2", strokeWeight: 5 },
                }}
              />
            )}

            {/* Moving marker (green) */}
            <Marker
              position={movingPos}
              title="Moving Pin"
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
              zIndex={999}
            />
          </GoogleMap>
        </LoadScript>
        {directionsError && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.95)",
              padding: "8px 12px",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 5,
            }}
          >
            <strong>Route error:</strong>&nbsp;{directionsError}
          </div>
        )}

        {/* Arrival popup */}
        {showArrivalPopup && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(25,118,210,0.95)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 6,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14 }}>Arrived</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              Within 200 meters of destination
            </div>
            <div style={{ marginTop: 6, textAlign: "right" }}>
              <button
                onClick={() => setShowArrivalPopup(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
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
    </>
  );
};

export default FilterMap;
