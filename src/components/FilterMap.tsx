/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState, useCallback } from "react";

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };

const mapCenter = {
  lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
  lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
};

const mapStyles = { height: "80vh", width: "100%" };

const FilterMap = () => {
  useEffect(() => {
    console.log("FilterMap mounted");
  }, []);

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

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

  const onMapLoad = () => {
    console.log("map is ready");
    calculateRoute();
  };

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
