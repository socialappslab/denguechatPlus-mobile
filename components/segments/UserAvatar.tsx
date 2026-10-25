import { Image } from "expo-image";

import { Text, View } from "@/components/themed";
import { getInitials } from "@/util";

export interface UserAvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

// The brigadista's avatar picture, or their initials while they have none.
export function UserAvatar({ uri, name = "", size = 40 }: UserAvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={style}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <View className="items-center justify-center bg-green-400" style={style}>
      <Text
        className="font-bold text-green-700"
        style={{ fontSize: Math.round(size * 0.35) }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
