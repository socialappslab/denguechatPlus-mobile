import React from "react";
import { View, Text } from "@/components/themed";

export interface ProgressBarProps {
  label: string;
  progress: number;
  color: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  progress,
  color,
}) => {
  return (
    <View className="flex items-start mb-4">
      <Text className="text-gray-800 font-medium mr-4 mb-2">{label}</Text>
      <View className="flex-row items-center">
        <View className="relative w-11/12 rounded-full h-2">
          <View
            className={`absolute top-0 left-0 h-full rounded-full bg-${color} opacity-30`}
            style={{ width: `100%` }}
          ></View>
          <View
            className={`absolute top-0 left-0 h-full rounded-full bg-${color}`}
            style={{ width: `${progress}%` }}
          ></View>
        </View>
        <Text className="text-gray-800 font-medium ml-4">{progress}</Text>
      </View>
    </View>
  );
};
