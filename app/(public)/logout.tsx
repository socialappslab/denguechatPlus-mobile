import React, { useEffect } from "react";

import { Loading } from "@/components/themed/Loading";
import { useAuth } from "@/context/AuthProvider";
import { View } from "@/components/themed";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex flex-1 flex-col justify-center">
      <Loading />
    </View>
  );
}
