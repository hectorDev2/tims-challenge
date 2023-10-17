import { useEffect, useState } from "react";
import { StyleSheet, Button, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

//TODO: modularizar las funciones y ponerlas en una carpeta diferente
//TODO:  usar customHook para eliminar useEffect
//TODO: refactor
//TODO: testing en android y ios

export default function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [latInput, setLatInput] = useState("");
  const [longInput, setLongInput] = useState("");
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

  // Función para agregar un marcador
  const addMarker = async (event) => {
    const newMarker = {
      coordinate: event.nativeEvent.coordinate,
    };
    setMarkers([...markers, newMarker]);
    try {
      //transformamos y guardamos en el localStorage
      const jsonValue = JSON.stringify([...markers, newMarker]);
      console.log(jsonValue, "jsonValue");
      await AsyncStorage.setItem("markers", jsonValue);
    } catch {
      console.error("Error al guardar el marcador:");
    }
  };

  //funcion para traer los marcadores que tenemos en el local storage
  const loadMarkers = async () => {
    try {
      //traemos los marcadores
      const saveMarkers = await AsyncStorage.getItem("markers");
      if (saveMarkers !== null) {
        const markerParse = JSON.parse(saveMarkers);
        setMarkers(markerParse);
      } else {
        return;
      }
    } catch {
      //capturamos el error
      console.error("Error al guardar el marcador:");
    }
  };

  //funcion para guardar los marcadores del input en el local storage
  const saveInput = async () => {
    if (latInput && longInput) {
      const newLat = parseFloat(latInput);
      const newLong = parseFloat(longInput);
      if (!isNaN(newLat) && !isNaN(newLong)) {
        const newCoordinate = { latitude: newLat, longitude: newLong };
        console.log(newCoordinate, "newCoordinate");
        //guardamos el marcador en marcadores
        setMarkers([...markers, { coordinate: newCoordinate }]);
      }
      try {
        //transformamos y guardamos en el local storage
        const jsonValue = JSON.stringify([
          ...markers,
          { coordinate: newCoordinate },
        ]);
        await AsyncStorage.setItem("markers", jsonValue);
      } catch {
        //capturamos el error
        alert("Error al guardar el marcador:");
      }
    }
  };

  useEffect(() => {
    //garantizamos que no exista bucle
    !userLocation && getLocation();
    markers.length == 0 && loadMarkers();
  }, [markers, setMarkers]);

  return (
    <>
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
            image={require("./assets/pin.png")}
            width={"200px"}
            // Personalsadaiza el aspecto del marcador
          />
        ))}
      </MapView>

      <View>
        <Text>Ingrese Latitud:</Text>
        <TextInput
          placeholder="Latitud"
          value={latInput}
          onChangeText={(text) => setLatInput(text)}
        />

        <Text>Ingrese Longitud:</Text>
        <TextInput
          placeholder="Longitud"
          value={longInput}
          onChangeText={(text) => setLongInput(text)}
        />

        <Button title="Agregar Marcador" onPress={saveInput} />
      </View>
    </>
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
