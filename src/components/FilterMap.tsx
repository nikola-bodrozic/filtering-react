import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
} from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const GOOGLE_MAP_LIBRARIES: "places"[] = ["places"];

const FilterMap: React.FC = () => {
  const mapStyles = { height: "80vh", width: "100%" };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const renderCount = useRef<number>(0);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    renderCount.current += 1;
    console.log(
      `[TrackMap committed render #${renderCount.current}]`,
      performance.now().toFixed(2),
      "ms",
    );
  });

  const mapRef = useRef<google.maps.Map | null>(null);

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

  const getDirections = async (): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      if (!window.google) return reject("Google Maps not loaded");

      const ds = new google.maps.DirectionsService();
      ds.route(
        {
          origin: ultimateFrisbeeStore,
          destination: cafeTvaroh,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === "OK" && result) resolve(result);
          else reject(status);
        },
      );
    });
  };

 const onMapLoad = useCallback(async (map: google.maps.Map) => {
  mapRef.current = map;
  try {
    const result = await getDirections(); // ✅ await here
    setDirections(result);
  } catch (error) {
    console.log(String(error));
  }
}, []);


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
          libraries={GOOGLE_MAP_LIBRARIES}
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
            {/* Directions route */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{ suppressMarkers: true }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </>
  );
};

export default FilterMap;
