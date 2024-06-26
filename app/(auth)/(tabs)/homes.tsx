import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { Text, View } from "@/components/themed";
import Button from "@/components/themed/Button";

export default function Homes() {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log("homes", user);
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab 2</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Text>Account</Text>
      <Text className="font-semibold text-md color-primary">
        {user?.username || "No username"}
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
