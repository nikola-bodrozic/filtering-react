import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useRef, useState, useCallback, useEffect } from "react";

const ultimateFrisbeeStore = { lat: 50.0796, lng: 14.4295 };
const cafeTvaroh = { lat: 50.0878, lng: 14.4212 };
const mustek = { lat: 50.0833, lng: 14.4220 }; // Mustek train station

const mapCenter = {
  lat: (ultimateFrisbeeStore.lat + cafeTvaroh.lat) / 2,
  lng: (ultimateFrisbeeStore.lng + cafeTvaroh.lng) / 2,
};

const mapStyles = { height: "80vh", width: "100%" };
const movingMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
  <circle cx="12" cy="12" r="10" fill="#ff6600" />
</svg>
`;

const GOOGLE_MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const SPEED_MPS = 40;

const FilterMap = () => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const movingMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    if (!movingMarkerRef.current) {
      movingMarkerRef.current = new google.maps.Marker({
        map,
        position: ultimateFrisbeeStore,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            movingMarkerSvg
          )}`,
          scaledSize: new google.maps.Size(24, 24),
        },
      });
    }
  }, []);

  const handleMapIdle = useCallback(() => {
    if (!mapReady) setMapReady(true);
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !window.google) return;

    const fetchRouteAndAnimate = async () => {
      const service = new google.maps.DirectionsService();
      const result = await service.route({
        origin: ultimateFrisbeeStore,
        destination: cafeTvaroh,
        travelMode: google.maps.TravelMode.WALKING,
      });
      setDirections(result);

      // Animate moving marker along route
      // if (!result || !movingMarkerRef.current) return;

      const path = result.routes[0].overview_path;

      // Precompute segment distances
      const distances: number[] = [];
      let totalDistance = 0;

      for (let i = 0; i < path.length - 1; i++) {
        const d = google.maps.geometry.spherical.computeDistanceBetween(
          path[i],
          path[i + 1]
        );
        distances.push(d);
        totalDistance += d;
      }

      let traveled = 0;
      let lastTime: number | null = null;
      let pausedUntilTime: number | null = null;
      let hasStoppedAtMustek = false;

      const animate = (time: number) => {
        if (!lastTime) lastTime = time;

        // Handle pause countdown
        if (pausedUntilTime !== null) {
          if (time >= pausedUntilTime) {
            pausedUntilTime = null;
            // Close the info window
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
            lastTime = time;
          } else {
            animationRef.current = requestAnimationFrame(animate);
            return;
          }
        }

        const deltaSec = (time - lastTime) / 1000;
        lastTime = time;

        traveled += SPEED_MPS * deltaSec;

        if (traveled >= totalDistance) {
          movingMarkerRef.current!.setPosition(cafeTvaroh);
          
          // Show arrival info window
          const arrivalWindow = new google.maps.InfoWindow({
            content: "<div><strong>You have arrived!</strong></div>",
          });
          arrivalWindow.open(mapRef.current, movingMarkerRef.current);
          
          // Close it after 3 seconds
          setTimeout(() => {
            arrivalWindow.close();
          }, 3000);
          
          return;
        }

        // Find segment
        let segmentIndex = 0;
        let segmentStartDistance = 0;

        while (
          segmentIndex < distances.length &&
          segmentStartDistance + distances[segmentIndex] < traveled
        ) {
          segmentStartDistance += distances[segmentIndex];
          segmentIndex++;
        }

        const segmentProgress =
          (traveled - segmentStartDistance) / distances[segmentIndex];

        const from = path[segmentIndex];
        const to = path[segmentIndex + 1];

        const position = google.maps.geometry.spherical.interpolate(
          from,
          to,
          segmentProgress
        );

        movingMarkerRef.current!.setPosition(position);

        // Check if near Mustek (within ~200 meters)
        const distanceToMustek =
          google.maps.geometry.spherical.computeDistanceBetween(position, mustek);

        if (distanceToMustek < 200 && !hasStoppedAtMustek) {
          hasStoppedAtMustek = true;
          pausedUntilTime = time + 5000; // 5 seconds in milliseconds

          // Show info window
          if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow({
              content: "<div><strong>Mustek Train Station</strong><br/>Stopping for 5 seconds</div>",
            });
          }
          infoWindowRef.current.open(mapRef.current, movingMarkerRef.current);
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    fetchRouteAndAnimate();

    return () => {
      // Clean up animation on unmount
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mapReady]);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
    return <p>Missing Google Maps API Key</p>;

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapStyles}
      center={mapCenter}
      zoom={14}
      onLoad={handleMapLoad}
      onIdle={handleMapIdle}
    >
      <Marker position={ultimateFrisbeeStore} />
      <Marker position={cafeTvaroh} />

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
    <p>Loading map...</p>
  );
};

export default FilterMap;