import React from "react";
import { Redirect } from "expo-router";

import { Loading } from "@/components/themed/Loading";
import { useAuth } from "@/context/AuthProvider";
import { View } from "@/components/themed";
import invariant from "tiny-invariant";
import { useQuery } from "@tanstack/react-query";

export default function Logout() {
  const { logout, meData } = useAuth();

  const logoutQuery = useQuery({
    queryKey: ["logout"],
    queryFn: async () => {
      invariant(meData, "Expected user object to be defined");
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
