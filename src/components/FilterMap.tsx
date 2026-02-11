import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState, useRef, useCallback } from "react";

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const FilterMap = () => {
  useEffect(() => {
    console.log("FilterMap mounted");
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Coordinates
  const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
  const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };

  // Center = midpoint
  const mapCenter = {
    lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
    lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
  };

  const mapStyles = { height: "80vh", width: "100%" };

  // --- State and refs ---
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // --- NEW: ref for the moving marker and animation timer ---
  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const aniMarker = useRef<number | null>(null);

  // --- NEW: extract path points from directions result ---
  const extractPath = (result: google.maps.DirectionsResult, stepSize = 20) => {
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
  };

  // --- NEW: animate the marker along the path ---
  const animateMarker = (path: google.maps.LatLngLiteral[], speed = 60) => {
    let index = 0;

    const move = () => {
      if (!movingMarkerRef.current || index >= path.length) {
        // We'll handle arrival popup in Step 5
        console.log("Animation finished");
        return;
      }
      movingMarkerRef.current.setPosition(path[index]);
      index++;
      aniMarker.current = setTimeout(move, speed);
    };

    move();
  };

  // --- Map load handler ---
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    console.log("map loaded");

    // --- Create moving marker only once ---
    if (!movingMarkerRef.current) {
      movingMarkerRef.current = new google.maps.Marker({
        map,
        position: ultimateFrisbeeStore,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        },
        zIndex: 9999, // keep it on top
      });
    }

    // --- Request directions ---
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: ultimateFrisbeeStore,
        destination: cafeTvaroh,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          
          // --- NEW: start animation ---
          const path = extractPath(result);
          animateMarker(path, 80); // 80ms per step = smooth movement
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  };

  // --- Cleanup animation on unmount ---
  useEffect(() => {
    return () => {
      if (aniMarker.current) clearTimeout(aniMarker.current);
    };
  }, []);

  if (!apiKey) {
    return <div>Missing API Key</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={GOOGLE_MAP_LIBRARIES}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={14}
        center={mapCenter}
        onLoad={onMapLoad}
      >
        {/* Static markers */}
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

        {/* Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
          />
        )}

        {/* The moving green marker is created imperatively, not as a JSX component */}
      </GoogleMap>
    </LoadScript>
  );
};

export default FilterMap;