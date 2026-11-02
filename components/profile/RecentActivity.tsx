import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

import { Text, View } from "@/components/themed";
import { MyVisit } from "@/types";

const STATUS_COLORS = {
  green: "#04BF00",
  yellow: "#FCC914",
  red: "#FC0606",
} as const;

interface RecentActivityProps {
  visits: MyVisit[];
  isLoading: boolean;
  isError: boolean;
}

export function RecentActivity({
  visits,
  isLoading,
  isError,
}: RecentActivityProps) {
  const { t } = useTranslation();

  return (
    <View className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
      <View className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <Text className="text-base font-bold">
          {t("brigadistProfile.recentActivity.title")}
        </Text>
      </View>

      {isLoading && visits.length === 0 ? (
        <ActivityIndicator className="my-6" color="#067507" />
      ) : visits.length === 0 ? (
        <Text className="px-4 py-6 text-center text-neutral-500">
          {isError
            ? t("brigadistProfile.recentActivity.error")
            : t("brigadistProfile.recentActivity.empty")}
        </Text>
      ) : (
        visits.map((visit, index) => (
          <VisitRow
            key={visit.id}
            visit={visit}
            last={index === visits.length - 1}
          />
        ))
      )}
    </View>
  );
}

function VisitRow({ visit, last }: { visit: MyVisit; last: boolean }) {
  const { t } = useTranslation();
  const result = visit.permissionGranted
    ? t("brigadistProfile.recentActivity.complete")
    : (visit.permissionLabel ??
      t("brigadistProfile.recentActivity.incomplete"));

  return (
    <View
      className={`flex-row items-center px-4 py-3 ${last ? "" : "border-b border-neutral-100"}`}
    >
      <View
        className="mr-3 items-center justify-center rounded-full"
        style={{
          width: 36,
          height: 36,
          backgroundColor: visit.status
            ? STATUS_COLORS[visit.status]
            : "#D6D3D1",
        }}
      >
        <MaterialDesignIcons name="home" size={20} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold" numberOfLines={1}>
          {`${visit.houseReferenceCode} · ${result}`}
        </Text>
        <Text className="text-xs text-neutral-500">
          {[
            relativeDay(visit.visitedAt, t),
            visit.status &&
              t(`brigadistProfile.recentActivity.house.${visit.status}`),
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>
      {visit.offline && (
        <View className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-yellow-800">
            {t("brigadistProfile.recentActivity.unsynced")}
          </Text>
        </View>
      )}
    </View>
  );
}

function relativeDay(date: string, t: (key: string) => string) {
  const day = moment(date).startOf("day");
  const today = moment().startOf("day");
  if (day.isSame(today)) return t("brigadistProfile.recentActivity.today");
  if (day.isSame(today.clone().subtract(1, "day"))) {
    return t("brigadistProfile.recentActivity.yesterday");
  }
  return day.format("DD/MM/YYYY");
}
