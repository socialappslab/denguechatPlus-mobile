import React from "react";
import { Redirect } from "expo-router";

import { Loading } from "@/components/themed/Loading";
import { useAuth } from "@/context/AuthProvider";
import { View } from "@/components/themed";
import { useQuery } from "@tanstack/react-query";

export default function Logout() {
  const { logout, meData } = useAuth();

  const logoutQuery = useQuery({
    queryKey: ["logout"],
    queryFn: async () => {
      await logout(meData);
    },
  });

  if (logoutQuery.isLoading) {
    return (
      <View className="flex flex-1 flex-col justify-center">
        <Loading size={"large"} />
      </View>
    );
  }

  return <Redirect href="/login" />;
}
