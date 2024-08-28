import React, { useEffect } from "react";
import { useRouter } from "expo-router";

import { Loading } from "@/components/themed/Loading";
import { useAuth } from "@/context/AuthProvider";
import { View } from "@/components/themed";

export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();

    const timeoutId = setTimeout(() => {
      router.replace("/login");
    }, 1000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex flex-1 flex-col justify-center">
      <Loading size={"large"} />
    </View>
  );
}
