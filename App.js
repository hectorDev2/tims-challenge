import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Función para obtener la ubicación del usuario
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("No se pudo obtener la ubicación");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});

    const current = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    console.log(current, "current");
    setMarkers([
      ...markers,
      {
        coordinate: current,
      },
    ]);
    setUserLocation(current);
  };

  const addMarker = async (event) => {
    const newMarker = {
      coordinate: event.nativeEvent.coordinate,
    };
    setMarkers([...markers, newMarker]);
    try {
      const jsonValue = JSON.stringify([...markers, newMarker]);
      console.log(jsonValue, "jsonValue");
      await AsyncStorage.setItem("markers", jsonValue);
    } catch {
      console.error("Error al guardar el marcador:");
    }
  };
  const loadMarkers = async () => {
    try {
      const saveMarkers = await AsyncStorage.getItem("markers");

      if (saveMarkers !== null) {
        const markerParse = JSON.parse(saveMarkers);
        console.log(markerParse, "marks from ");
        setMarkers(markerParse);
      } else {
        return;
      }
    } catch {
      console.error("Error al guardar el marcador:");
    }
  };

  useEffect(() => {
    !userLocation && getLocation();

    markers.length == 0 && loadMarkers();
  }, [markers, setMarkers]);

  return (
    <MapView
      style={styles.map}
      initialRegion={
        userLocation && {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      }
      onLongPress={addMarker} // Escucha el evento de toque largo en el mapa
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinate}
          // Personalsadaiza el aspecto del marcador
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
    minHeight: "500px",
  },
});
