import HouseWarning from "@/assets/images/icons/house-warning.svg";
import Ring from "@/assets/images/icons/ring.svg";
import Stoplight from "@/assets/images/icons/stoplight.svg";
import { Text, View } from "@/components/themed";
import Separator from "@/components/Separator";
import { StatusColor } from "@/types";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const statusToAssets = {
  RED: {
    color: "#FC0606",
    image: <HouseWarning />,
  },
  GREEN: {
    color: "#00A300",
    image: <Stoplight />,
  },
  YELLOW: {
    color: "#FCC914",
    image: <Ring />,
  },
};

export interface VisitSummaryProps {
  date: string;
  color?: StatusColor;
  greens?: number;
  reds?: number;
  yellows?: number;
  sector?: string;
  house?: string;
  permissionToVisitGranted: boolean;
}

const IconStatus = ({ color }: { color: keyof typeof statusToAssets }) => {
  const styles = StyleSheet.create({
    circle: { backgroundColor: statusToAssets[color].color },
  });

  return (
    <View
      className="rounded-full w-20 h-20 flex items-center justify-center"
      style={[styles.circle]}
    >
      {statusToAssets[color].image}
    </View>
  );
};

function VisitSummary({
  date,
  sector,
  house,
  color = StatusColor.NotInfected,
  greens = 0,
  reds = 0,
  yellows = 0,
  permissionToVisitGranted,
}: VisitSummaryProps) {
  const { t } = useTranslation();

  return (
    <View className="border border-neutral-200 overflow-hidden rounded-2xl p-6">
      <View className="space-y-6">
        <Text className="font-semibold text-xl">
          {t("visit.summary.siteStatus")}
        </Text>

        <View className="flex-row">
          <View>
            <IconStatus color={color} />
          </View>

          <View className="justify-center ml-4">
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

      <Separator />

      <View className="space-y-6">
        <View className="flex-row justify-center items-center">
          {permissionToVisitGranted ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="green"
            />
          ) : (
            <MaterialCommunityIcons name="close-circle" size={24} color="red" />
          )}
          <Text className="ml-1 text-base">
            {permissionToVisitGranted
              ? t("visit.summary.permissionGranted")
              : t("visit.summary.permissionNotGranted")}
          </Text>
        </View>
      </View>

      <Separator />

      <View className="space-y-6">
        <View className="flex flex-row justify-between gap-4">
          <View>
            <Text className="mb-2 text-base text-gray-300">
              {t("visit.summary.date")}
            </Text>
            <Text type="subtitle">{date}</Text>
          </View>

          <View className="flex">
            <Text className="mb-2 text-base text-gray-300">
              {sector || t("visit.summary.site")}
            </Text>
            <Text type="subtitle">{house}</Text>
          </View>
        </View>
      </View>

      <Separator />

      <View className="space-y-6">
        <Text className="font-semibold text-xl">
          {t("visit.summary.containerStatus")}
        </Text>

        <View className="flex align-center flex-row justify-between">
          <View className="flex flex-1 items-center justify-center ">
            <CircularProgress
              value={greens}
              maxValue={1}
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
              maxValue={1}
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
              maxValue={1}
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
    </View>
  );
}

export default VisitSummary;
