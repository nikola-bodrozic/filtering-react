import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect } from "react";

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const FilterMap = () => {
  useEffect(() => {
    console.log("FilterMap mounted");
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Coordinates
  const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
  const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };

  // Center = midpoint between the two
  const mapCenter = {
    lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
    lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
  };

  const mapStyles = { height: "80vh", width: "100%" };

  if (!apiKey) {
    return <div>Missing API Key</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={GOOGLE_MAP_LIBRARIES}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={14}
        center={mapCenter}
        onLoad={() => {
          console.log("map loaded");
        }}
      >
        {/* ----- MARKERS ADDED HERE ----- */}
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
      </GoogleMap>
    </LoadScript>
  );
};

export default FilterMap;