import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState, useCallback, useRef } from "react";

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };

const mapCenter = {
  lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
  lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
};

const mapStyles = { height: "80vh", width: "100%" };

// Small SVG for animated marker
const movingMarkerSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="#ff6600" />
  </svg>
`;

const FilterMap = () => {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  
  // State to trigger the info window
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  // Ref to store the InfoWindow instance
  const infowindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const calculateRoute = useCallback(async () => {
    if (!window.google) return;
    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: ultimateFrisbeeStore,
        destination: cafeTvaroh,
        travelMode: google.maps.TravelMode.WALKING,
      });
      setDirections(result);
    } catch (error) {
      console.error("Directions request failed:", error);
    }
  }, []);

  const onMapLoad = (map: google.maps.Map) => {
    calculateRoute();

    // Create the animated marker once
    if (!movingMarkerRef.current) {
      movingMarkerRef.current = new google.maps.Marker({
        position: ultimateFrisbeeStore,
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            movingMarkerSvg
          )}`,
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });
    }

    // Initialize the InfoWindow
    if (!infowindowRef.current) {
      infowindowRef.current = new google.maps.InfoWindow({
        content: `<div style="font-weight:bold; color:#333;">Arrived at Café Tvaroh!</div>`,
      });
    }
  };

  // Animate the marker along the route using useRef
  const animateMarker = useCallback(() => {
    if (!directions || !movingMarkerRef.current) return;

    const path = directions.routes[0].overview_path;
    let index = 0;

    const step = () => {
      if (index < path.length) {
        movingMarkerRef.current!.setPosition({
          lat: path[index].lat(),
          lng: path[index].lng(),
        });
        index++;
        animationRef.current = requestAnimationFrame(step);
      } else {
        // Animation finished - trigger the info window
        setShowInfoWindow(true);
      }
    };

    step();
  }, [directions]);

  useEffect(() => {
    if (directions) {
      animateMarker();
    }
  }, [directions, animateMarker]);

  // Effect to open InfoWindow and close it after 4 seconds
  useEffect(() => {
    if (showInfoWindow && movingMarkerRef.current && infowindowRef.current) {
      infowindowRef.current.open({
        anchor: movingMarkerRef.current,
        shouldFocus: false,
      });

      // Close the info window after 4 seconds
      const timer = setTimeout(() => {
        if (infowindowRef.current) {
          infowindowRef.current.close();
        }
        // Optional: reset state if you need to trigger it again later
        setShowInfoWindow(false);
      }, 4000);

      // Cleanup timer if component unmounts during the countdown
      return () => clearTimeout(timer);
    }
  }, [showInfoWindow]);

  // Separate effect for cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel animation
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      if (movingMarkerRef.current) {
        movingMarkerRef.current.setMap(null);
        movingMarkerRef.current = null;
      }
      if (infowindowRef.current) {
        infowindowRef.current.close();
      }
    };
  }, []);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{ padding: 20, color: "red", textAlign: "center" }}>
        <h2>Google Maps API Key Missing</h2>
        <p>Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "80vh", marginTop: 50 }}>
      {isLoaded ? (
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
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
          <Marker
            position={cafeTvaroh}
            title="Café Tvaroh"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#2a7fff",
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default FilterMap;