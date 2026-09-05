import HouseWarning from "@/assets/images/icons/house-warning.svg";
import Ring from "@/assets/images/icons/ring.svg";
import Stoplight from "@/assets/images/icons/stoplight.svg";
import { Text, View } from "@/components/themed";
import Separator from "@/components/Separator";
import { StatusColor } from "@/types";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CircularCounter, CircularCounterValue } from "./ui/circular-counter";

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

const statusToCounterClasses = {
  RED: { border: "border-red-600", value: "text-red-600" },
  GREEN: { border: "border-verde-700", value: "text-verde-700" },
  YELLOW: { border: "border-yellow-400", value: "text-yellow-400" },
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

function IconStatus({ color }: { color: keyof typeof statusToAssets }) {
  const styles = StyleSheet.create({
    circle: { backgroundColor: statusToAssets[color].color },
  });

  return (
    <View
      className="rounded-full w-20 h-20 flex items-center justify-center"
      style={styles.circle}
    >
      {statusToAssets[color].image}
    </View>
  );
}

function ContainerCounter({
  count,
  status,
}: {
  count: number;
  status: keyof typeof statusToCounterClasses;
}) {
  const { t } = useTranslation();
  // A count of zero is a result, not an alert, so it keeps the neutral default
  const classes = count > 0 ? statusToCounterClasses[status] : undefined;

  return (
    <View className="flex flex-1 items-center justify-center">
      <CircularCounter className={classes?.border}>
        <CircularCounterValue className={classes?.value}>
          {count}
        </CircularCounterValue>
      </CircularCounter>
      <Text className="mt-2 text-center" type="small">
        {t(`visit.summary.statusColor.${status.toLocaleLowerCase()}`)}
      </Text>
    </View>
  );
}

export default function VisitSummary({
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
          <ContainerCounter count={greens} status="GREEN" />
          <ContainerCounter count={yellows} status="YELLOW" />
          <ContainerCounter count={reds} status="RED" />
        </View>
      </View>
    </View>
  );
}
