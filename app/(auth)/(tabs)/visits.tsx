import { StyleSheet } from "react-native";

import { Text, View, SafeAreaView } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useTranslation } from "react-i18next";

import { useRouter } from "expo-router";
import { CheckTeam } from "@/components/segments/CheckTeam";

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView>
      <CheckTeam view="visit">
        <View style={styles.container}>
          <Text style={styles.title}>{t("tabs.visit")}</Text>
          <View
            style={styles.separator}
            lightColor="#eee"
            darkColor="rgba(255,255,255,0.1)"
          />
          <Button
            primary
            className="w-1/2 mt-6"
            title={t("visit.start")}
            onPress={() => router.push("select-house")}
          />
        </View>
      </CheckTeam>
    </SafeAreaView>
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
