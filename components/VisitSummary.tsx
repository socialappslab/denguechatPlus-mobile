import HouseWarning from "@/assets/images/icons/house-warning.svg";
import Ring from "@/assets/images/icons/ring.svg";
import Stoplight from "@/assets/images/icons/stoplight.svg";
import { Text, View } from "@/components/themed";
import { StatusColor } from "@/types";
import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

const StatusAssets = {
  RED: {
    color: "#FC0606",
    image: HouseWarning,
  },
  GREEN: {
    color: "#00A300",
    image: Stoplight,
  },
  YELLOW: {
    color: "#FCC914",
    image: Ring,
  },
};

export interface VisitSummaryProps {
  date: string;
  color: StatusColor;
  greens: number;
  reds: number;
  yellows: number;
  sector?: string;
  house?: string;
}

const IconStatus = ({ color }: { color: keyof typeof StatusAssets }) => {
  const styles = StyleSheet.create({
    circle: { backgroundColor: StatusAssets[color].color },
  });

  return (
    <View
      className="rounded-full w-20 h-20 flex items-center justify-center"
      style={[styles.circle]}
    >
      {createElement(StatusAssets[color].image)}
    </View>
  );
};

const VisitSummary = ({
  date,
  sector,
  house,
  color,
  greens,
  reds,
  yellows,
}: VisitSummaryProps) => {
  const { t } = useTranslation();

  return (
    <View className="flex px-2">
      <View className="border-b border-neutral-200 flex flex-row justify-center justify-around py-6 flex flex-col mb-8">
        <Text className="font-semibold text-xl mb-8">
          {t("visit.summary.siteStatus")}
        </Text>
        <View className="flex flex-row gap-4 mb-4">
          <View>
            <IconStatus color={color} />
          </View>
          <View className="justify-center">
            <Text className="font-semibold text-xl">
              {t("visit.summary.site")}{" "}
              {t(`visit.summary.statusColor.${color?.toLocaleLowerCase()}`)}
            </Text>
            <Text className="font-normal text-base opacity-80 text">
              {t("visit.summary.description")}
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="font-semibold text-xl">
          {t("visit.summary.containerStatus")}
        </Text>
        <View className="flex align-center flex-row py-6 justify-between border-b border-neutral-200 mb-6">
          <View className="flex flex-1 items-center justify-center ">
            <CircularProgress
              value={greens}
              maxValue={4}
              radius={35}
              duration={0}
              activeStrokeColor="#00A300"
              activeStrokeWidth={8}
              inActiveStrokeWidth={8}
            />
            <Text className="mt-2 text-center" type="small">
              {t("visit.summary.statusColor.green")}
            </Text>
          </View>
          <View className="flex flex-1 items-center justify-center">
            <CircularProgress
              value={yellows}
              maxValue={4}
              radius={35}
              duration={0}
              activeStrokeColor="#FCC914"
              activeStrokeWidth={8}
              inActiveStrokeWidth={8}
            />
            <Text className="mt-2 text-center" type="small">
              {t("visit.summary.statusColor.yellow")}
            </Text>
          </View>
          <View className="flex flex-1 items-center justify-center">
            <CircularProgress
              duration={0}
              value={reds}
              maxValue={5}
              radius={35}
              activeStrokeWidth={8}
              inActiveStrokeWidth={8}
              activeStrokeColor="#FC0606"
            />
            <Text className="mt-2 text-center" type="small">
              {t("visit.summary.statusColor.red")}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex flex-row justify-between gap-4 mb-8">
        <View>
          <Text className="mb-2 text-base text-gray-300">Fecha</Text>
          <Text type="subtitle">{date}</Text>
        </View>

        <View className="flex">
          <Text className="mb-2 text-base text-gray-300">{sector}</Text>
          <Text type="subtitle">{house}</Text>
        </View>
      </View>
    </View>
  );
};

export default VisitSummary;
