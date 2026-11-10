import { useTranslation } from "react-i18next";

import { SimpleChip, Text, View } from "@/components/themed";
import Colors from "@/constants/Colors";

interface MonthVisitsCardProps {
  lastMonthCount: number;
  previousMonthCount: number;
}

export function MonthVisitsCard({
  lastMonthCount,
  previousMonthCount,
}: MonthVisitsCardProps) {
  const { t } = useTranslation();
  const variation = previousMonthCount
    ? Math.round(
        ((lastMonthCount - previousMonthCount) / previousMonthCount) * 100,
      )
    : null;

  return (
    <View className="mt-6 rounded-2xl border border-neutral-200 p-4">
      <Text className="mb-2 text-neutral-600">
        {t("brigadistProfile.lastMonthVisits")}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-semibold">{lastMonthCount}</Text>
        {variation !== null && variation !== 0 && (
          <SimpleChip
            border="1"
            padding="small"
            textColor="neutral-500"
            borderColor="neutral-500"
            iconMaterial={variation > 0 ? "arrow-up" : "arrow-down"}
            iconColor={Colors.light.neutral}
            label={t("brigadistProfile.vsPreviousMonth", {
              value: Math.abs(variation),
            })}
          />
        )}
      </View>
    </View>
  );
}
