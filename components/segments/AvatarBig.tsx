import React from "react";

import { IUser } from "@/schema/auth";
import { getInitialsBase } from "@/util";
import { View, Text } from "@/components/themed";

export interface AvatarBigProps {
  user?: IUser;
}

export const AvatarBig: React.FC<AvatarBigProps> = ({ user }) => {
  const initials = getInitialsBase(
    String(user?.firstName),
    String(user?.lastName),
  );

  return (
    <View className="flex items-center justify-center w-24 h-24 rounded-full bg-green-400 mb-2">
      <Text className="font-selmibold text-4xl text-green-700">{initials}</Text>
    </View>
  );
};
