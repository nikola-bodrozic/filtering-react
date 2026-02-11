import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState, useRef, useCallback } from "react";

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const FilterMap = () => {
  useEffect(() => {
    console.log("FilterMap mounted");
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
  const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };

  const mapCenter = {
    lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
    lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
  };

  const mapStyles = { height: "80vh", width: "100%" };

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);

  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const aniMarker = useRef<number | null>(null);
  const resolveDirectionsRendered = useRef<(() => void) | null>(null); // 🔁 Promise resolver

  const extractPath = useCallback((result: google.maps.DirectionsResult, stepSize = 20) => {
    const route = result.routes[0];
    const path: google.maps.LatLngLiteral[] = [];
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        step.path.forEach((point, index) => {
          if (index % stepSize === 0) {
            path.push({ lat: point.lat(), lng: point.lng() });
          }
        });
      });
    });
    return path;
  }, []);

  const getDirections = useCallback((): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject("Google Maps not loaded");
        return;
      }
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
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
  }, []);

  const animateMarker = useCallback((path: google.maps.LatLngLiteral[], speed = 60): Promise<void> => {
    return new Promise((resolve) => {
      let index = 0;
      const move = () => {
        if (!movingMarkerRef.current || index >= path.length) {
          setShowArrivalPopup(true);
          resolve();
          return;
        }
        movingMarkerRef.current.setPosition(path[index]);
        index++;
        aniMarker.current = setTimeout(move, speed);
      };
      move();
    });
  }, []);

  const onMapLoad = useCallback(
    async (map: google.maps.Map) => {
      console.log("map loaded");

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
        const extractedPath = extractPath(result);

        // ⏳ Wait for DirectionsRenderer to actually render the polyline
        await new Promise<void>((resolve) => {
          resolveDirectionsRendered.current = resolve;
        });

        // ✅ Polyline is now on the map – safe to animate
        await animateMarker(extractedPath, 80);
      } catch (err) {
        console.error("Directions request failed:", err);
      }
    },
    [getDirections, extractPath, animateMarker]
  );

  useEffect(() => {
    return () => {
      if (aniMarker.current) clearTimeout(aniMarker.current);
    };
  }, []);

  useEffect(() => {
    if (!showArrivalPopup) return;
    const timer = setTimeout(() => setShowArrivalPopup(false), 4000);
    return () => clearTimeout(timer);
  }, [showArrivalPopup]);

  if (!apiKey) {
    return (
      <div style={{ padding: 20, color: "red", textAlign: "center" }}>
        <h2>Google Maps API Key Missing</h2>
        <p>Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "80vh", marginTop: 50 }}>
      <LoadScript googleMapsApiKey={apiKey} libraries={GOOGLE_MAP_LIBRARIES}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={mapCenter}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: "cooperative",
            clickableIcons: false,
            keyboardShortcuts: false,
          }}
          onLoad={onMapLoad}
        >
          <Marker
            position={ultimateFrisbeeStore}
            title="Ultimate Frisbee Store"
            icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
          />
          <Marker
            position={cafeTvaroh}
            title="Café Tvaroh"
            icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
          />

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
              onLoad={() => {
                console.log("DirectionsRenderer loaded – polyline is on map");
                resolveDirectionsRendered.current?.(); // ✅ Release the await
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {showArrivalPopup && (
        <div
          role="alert"
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
              aria-label="Close arrival message"
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