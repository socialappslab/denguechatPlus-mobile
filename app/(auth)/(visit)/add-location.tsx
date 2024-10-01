import React, { useCallback, useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import useAxios from "axios-hooks";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

import {
  View,
  TextInput,
  SimpleBottomSheet,
  Button,
  Text,
} from "@/components/themed";
import { useVisit } from "@/hooks/useVisit";
import CustomMarker from "@/components/icons/CustomMarker";
import NoMap from "@/assets/images/no-internet-map.svg";

const AddLocation = () => {
  const { t } = useTranslation();
  const { isConnected, setVisitData } = useVisit();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject>();
  const [address, setAddress] = useState<string>("");
  const [status, requestPermission] = Location.useForegroundPermissions();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    console.log("status location", status);
    if (status?.status === "granted") {
      Location.getCurrentPositionAsync({}).then((location) => {
        console.log("location", location);
        setLocation(location);
      });
    } else if (status?.status === "undetermined") {
      requestPermission();
    }
  }, [requestPermission, status]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [markerCoords, setMarkerCoords] = useState({
    latitude: -3.738474,
    longitude: -73.246593,
  });

  useEffect(() => {
    if (location?.coords) {
      const { latitude, longitude } = location.coords;
      console.log("location", latitude, longitude);

      setMarkerCoords({ latitude, longitude });
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  const [{ data, error }, refetch] = useAxios({
    url: `/get_address?latitude=${markerCoords.latitude}&longitude=${markerCoords.longitude}`,
  });

  useEffect(() => {
    if (data) {
      const { address } = data;
      console.log("address>>", address);
      setAddress(address.address);
    }
  }, [data]);

  const handleDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log("handleDragEnd", latitude, longitude);
    setMarkerCoords({ latitude, longitude });
  };

  const handleConfirmAddress = () => {
    console.log("handleConfirmAddress");
    setVisitData({
      house: {
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
        address,
      },
    });
    router.back();
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <View className="flex flex-1">
      {isConnected && !Boolean(error) && (
        <MapView
          ref={mapRef}
          className="flex-1"
          initialRegion={{
            latitude: -3.738474,
            longitude: -73.246593,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={markerCoords}
            draggable
            onDragEnd={handleDragEnd}
            children={Platform.OS === "ios" ? <CustomMarker /> : null}
          />
        </MapView>
      )}
      {(!isConnected || Boolean(error)) && (
        <View className="flex-1 flex-col items-center justify-center px-10 -top-8">
          <NoMap className="mb-4"></NoMap>
          <Text className="text-2xl font-bold mb-4">
            {t("visit.newHouse.noConnection")}
          </Text>
          <Text className="mb-6 text-center">
            {t("visit.newHouse.noMapConnection")}
          </Text>
          <View className="w-2/3">
            <Button title={t("retry")} onPress={handleRetry} />
          </View>
        </View>
      )}
      <SimpleBottomSheet onChange={handleSheetChanges}>
        <View className="flex px-5 mt-6">
          <Text className="text-2xl font-bold text-center mb-4">
            {!isConnected
              ? t("visit.newHouse.addAddress")
              : t("visit.newHouse.siteLocation")}
          </Text>
          <View className="mb-6">
            <TextInput
              autoFocus={false}
              value={address}
              onChangeText={(value) => setAddress(value)}
              placeholder={t("visit.newHouse.houseNumberPlaceholder")}
              iconMaterial={!isConnected ? undefined : "map-marker"}
              isSheet
            />
          </View>

          <Button
            primary
            title={t("visit.newHouse.confirmLocation")}
            onPress={handleConfirmAddress}
          />
        </View>
      </SimpleBottomSheet>
    </View>
  );
};

export default AddLocation;
