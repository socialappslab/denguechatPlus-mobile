import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { Text, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useTranslation } from "react-i18next";
import useAxios from "axios-hooks";

export default function TabTwoScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [{ data, error }] = useAxios({
    url: `/users/${user?.id}`,
  });

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  useEffect(() => {
    console.log("error", error);
  }, [error]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab 3 - {t("tabs.profile")}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Text>Account</Text>
      <Text className="font-semibold text-md color-primary">
        {`${user?.firstName} ${user?.lastName} ` || "No username"}
      </Text>
      <Button className="w-1/2 mt-6" title="Log out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
