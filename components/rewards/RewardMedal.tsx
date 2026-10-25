import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { RewardLevel } from "@/types";

const LOCKED = {
  ring: ["#EDEDED", "#BDBDBD"],
  face: "#F7F7F7",
  edge: "#BDBDBD",
  icon: "#A3A3A3",
} as const;

interface RewardMedalProps {
  level: RewardLevel;
  size: 112 | 72 | 30;
  locked?: boolean;
}

// A reward drawn as a medal: gradient ring, inner face and the reward's icon.
// Locked rewards fall back to the grey spec unless the backend sends a locked image.
export function RewardMedal({ level, size, locked = false }: RewardMedalProps) {
  const ring =
    level.ringGradient.length >= 2
      ? level.ringGradient
      : ["#EDEDED", "#BDBDBD"];
  const colors = (locked ? LOCKED.ring : ring) as [string, string];
  const face = size * 0.8;
  const icon = Math.round(size * 0.52);
  const lockedImage = locked ? level.lockedImageUrl : null;

  return (
    <View style={{ opacity: locked ? 0.6 : 1 }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: face,
            height: face,
            borderRadius: face / 2,
            borderWidth: size === 30 ? 1.5 : 3,
            borderColor: locked
              ? LOCKED.edge
              : (level.colorSecondary ?? LOCKED.edge),
            backgroundColor: locked
              ? LOCKED.face
              : (level.colorBackground ?? LOCKED.face),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={{ uri: (lockedImage ?? level.imageUrl) || undefined }}
            style={{ width: icon, height: icon }}
            tintColor={locked && !lockedImage ? LOCKED.icon : undefined}
            contentFit="contain"
          />
        </View>
      </LinearGradient>
    </View>
  );
}
