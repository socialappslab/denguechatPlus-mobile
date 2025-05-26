import React from "react";
import { View } from "./View";
import { Text } from "./Text";

export interface ProgressBarProps {
  label: string;
  progress: number;
  colorClassName: string;
}

export const ProgressBar = ({
  label,
  progress,
  colorClassName,
}: ProgressBarProps) => {
  return (
    <View className="flex items-start mb-4">
      <Text className="text-gray-800 font-medium mr-4 mb-2">{label}</Text>
      <View className="flex-row items-center">
        <View className="relative w-11/12 rounded-full h-2">
          <View
            className={`absolute top-0 left-0 h-full rounded-full ${colorClassName} opacity-30`}
            style={{ width: `100%` }}
          ></View>
          <View
            className={`absolute top-0 left-0 h-full rounded-full ${colorClassName}`}
            style={{ width: `${progress}%` }}
          ></View>
        </View>
        <Text className="text-gray-800 font-medium ml-2">{progress}%</Text>
      </View>
    </View>
  );
};
