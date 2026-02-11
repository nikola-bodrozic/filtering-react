import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";

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

  // --- NEW: state for directions result ---
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  // --- NEW: ref to store map instance ---
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    console.log("map loaded");

    // --- NEW: request directions ---
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
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  };

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

        {/* --- NEW: render the route --- */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }} // prevent default markers (we have our own)
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default FilterMap;