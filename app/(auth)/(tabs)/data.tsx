import { ScrollView, Text } from "@/components/themed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { axios } from "@/config/axios";
import { useStore } from "@/hooks/useStore";
import { BaseObject } from "@/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  useWindowDimensions,
  View,
  Platform,
  RefreshControl,
} from "react-native";
import {
  BarChart,
  barDataItem,
  PieChart,
  pieDataItem,
} from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";
import { Picker as AndroidPicker } from "@expo/ui/jetpack-compose";
import { Host, Picker as IOSPicker } from "@expo/ui/swift-ui";
import moment from "moment";

const COLORS_MAP = {
  green: "#27AE60",
  yellow: "#F2C94C",
  red: "#EB5757",
  grey: "#828282",
  blue: "#2F80ED",
  purple: "#BB6BD9",
};
const COLORS = Object.values(COLORS_MAP);

const CONTAINER_TYPE_COLORS: Record<string, string> = {
  Drums: "#E67E22",
  Buckets: "#2D9CDB",
  Tires: "#EB5757",
  Tanks: "#27AE60",
  Bottles: "#9B51E0",
  Other: "#828282",
  Tambores: "#E67E22",
  Baldes: "#2D9CDB",
  Neumáticos: "#EB5757",
  Tanques: "#27AE60",
  Botellas: "#9B51E0",
  Otro: "#828282",
  Pneus: "#EB5757",
  Garrafas: "#9B51E0",
  Outro: "#828282",
};

const FALLBACK_COLORS = [
  "#BB6BD9",
  "#56CCF2",
  "#F2994A",
  "#219653",
  "#2F80ED",
  "#F2C94C",
  "#4F4F4F",
  "#BDBDBD",
];

type DateRange = { from: string; to: string };
function useStatsQuery(wedgeId?: number, range?: DateRange) {
  interface TeamStatsResponse {
    data: {
      id: string;
      type: "wedgeStats";
      attributes: WedgeStatsAttributes;
    };
  }

  interface WedgeStatsAttributes {
    housesVisited: number;
    positiveContainers: number;
    coveragePercentage: number;
    housesWithAedesPercentage: number;
    houseAccessStatus: HouseAccessStatusItem[];
    houseAccessStatusChart: HouseAccessStatusChartItem[];
    containerPositives: ContainerItem[];
    containerPositivesChart: ContainerChartItem[];
    containerTypesInspected: ContainerItem[];
    containerTypesInspectedChart: ContainerChartItem[];
    riskChange: PeriodColorDistribution[];
  }

  interface HouseAccessStatusItem {
    option_id: number;
    name_es: string;
    name_en: string;
    name_pt: string;
    count: number;
  }

  interface HouseAccessStatusChartItem {
    option_id: number;
    name_es: string;
    name_en: string;
    name_pt: string;
    value: number;
  }

  interface ContainerItem {
    breeding_site_type_id: number;
    name_es: string;
    name_en: string;
    name_pt: string;
    count: number;
  }

  interface ContainerChartItem {
    breeding_site_type_id: number;
    name_es: string;
    name_en: string;
    name_pt: string;
    value: number;
  }

  interface PeriodColorDistribution {
    period: string;
    start_date: string;
    end_date: string;
    green: number;
    yellow: number;
    red: number;
  }

  return useQuery({
    enabled: !!wedgeId,
    queryKey: ["wedges", wedgeId, "stats", range],
    queryFn: () =>
      axios.get<TeamStatsResponse>(`/wedges/${wedgeId}/stats`, {
        params: range,
      }),
    select: ({ data }) => data.data.attributes,
  });
}

enum Preset {
  Today,
  Last30Days,
  Last6Months,
}
function getDataRange(preset: Preset): DateRange {
  const now = moment();
  const today = now.format("YYYY/MM/DD");

  switch (preset) {
    case Preset.Last30Days:
      const last30Days = now.subtract(30, "days").format("YYYY/MM/DD");
      return { from: last30Days, to: today };

    case Preset.Last6Months:
      const last6Months = now.subtract(6, "months").format("YYYY/MM/DD");
      return { from: last6Months, to: today };

    case Preset.Today:
    default:
      return { from: today, to: today };
  }
}

export default function Data() {
  const userProfile = useStore((state) => state.userProfile);
  const { t, i18n } = useTranslation();

  const { width } = useWindowDimensions();
  const [selectedPreset, setSelectedPreset] = useState<Preset>(
    Preset.Last30Days,
  );
  const [selectedHouseAccess, setSelectedHouseAccess] = useState<{
    label: string;
    value: number;
    percentage: number;
  } | null>(null);

  const padding = 20;
  const gap = 16;
  const cardWidth = (width - padding * 2 - gap) / 2;
  const chartWidth = width - padding * 2 - 32; // 32 = card horizontal padding (16 * 2)
  const chartInnerWidth = Math.max(chartWidth - 24, 0); // 24 = CardContent padding

  // NOTE: order matters here
  const presetToLabel: Record<Preset, string> = {
    [Preset.Today]: t("data.presets.today"),
    [Preset.Last30Days]: t("data.presets.last30Days"),
    [Preset.Last6Months]: t("data.presets.last6Months"),
  };
  const presetOptions = Object.values(presetToLabel);

  const dateRange = getDataRange(selectedPreset);
  // @ts-expect-error
  const wedgeId = userProfile?.userProfile?.team?.wedge_id;
  const stats = useStatsQuery(wedgeId, dateRange);

  type LocalizedItem = { name_es: string; name_en: string; name_pt: string };
  function getLocalizedName(item: LocalizedItem): string {
    // @ts-expect-error can index with `name_${string}`, has to be `name_${'es' | 'en' | 'pt'}`
    return item[`name_${i18n.language}`] ?? item.name_es;
  }

  const getColorForItem = (
    name: string,
    colorMap: Record<string, string>,
    fallbackIndex: number,
  ): string => {
    if (colorMap[name]) {
      return colorMap[name];
    }

    const lowerName = name.toLowerCase();
    const matchingKey = Object.keys(colorMap).find(
      (key) => key.toLowerCase() === lowerName,
    );

    if (matchingKey) {
      return colorMap[matchingKey];
    }

    return FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
  };

  const formatPeriodLabel = (period: string): string => {
    if (!period) return "";

    if (period.includes("-W")) {
      return period.split("-W")[1] ? `W${period.split("-W")[1]}` : period;
    }

    if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, month] = period.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString(i18n.language, { month: "short" });
    }

    if (period.includes("-Q")) {
      return period.split("-Q")[1] ? `Q${period.split("-Q")[1]}` : period;
    }

    return period;
  };

  type HouseAccessChart = {
    data: pieDataItem[];
    legends: LegendProps[];
  };
  function getHouseAccessChart(): HouseAccessChart {
    const data = stats.data?.houseAccessStatusChart ?? [];
    if (data.length === 0) return { data: [], legends: [] };

    const final: HouseAccessChart = { data: [], legends: [] };

    // Calculate total for percentage calculation
    const total = data.reduce((sum, item) => sum + item.value, 0);

    for (const [index, item] of data.entries()) {
      const label = getLocalizedName(item);
      const color = COLORS[index];

      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

      final.data.push({
        value: item.value,
        color,
        focused: selectedHouseAccess?.label === label,
        onPress: () =>
          setSelectedHouseAccess({ label, value: item.value, percentage }),
      });
      final.legends.push({ color, label });
    }

    return final;
  }

  type PositiveContainersChart = {
    data: barDataItem[];
    legends: LegendProps[];
  };
  function getPositiveContainersChart(): PositiveContainersChart {
    const data = stats.data?.containerPositivesChart ?? [];
    if (data.length === 0) return { data: [], legends: [] };

    const final: PositiveContainersChart = { data: [], legends: [] };

    for (const [index, item] of data.entries()) {
      const name = getLocalizedName(item);
      const color = getColorForItem(name, CONTAINER_TYPE_COLORS, index);

      final.data.push({
        value: item.value,
        frontColor: color,
      });
      final.legends.push({ color, label: name });
    }

    return final;
  }

  type RiskChartData = {
    stacks: { value: number; color: string }[];
    label: string;
  };
  function getRiskChart(): RiskChartData[] {
    const apiData = stats.data?.riskChange ?? [];

    if (apiData.length === 0) {
      return [];
    }

    return apiData.map((item) => ({
      stacks: [
        { value: item.green, color: COLORS_MAP.green },
        { value: item.yellow, color: COLORS_MAP.yellow },
        { value: item.red, color: COLORS_MAP.red },
      ],
      label: formatPeriodLabel(item.period),
    }));
  }

  const houseAccessChart = getHouseAccessChart();
  const positiveContainersChart = getPositiveContainersChart();

  type ContainerTypesChart = {
    data: barDataItem[];
    legends: LegendProps[];
  };
  function getContainerTypesChart(): ContainerTypesChart {
    const data = stats.data?.containerTypesInspectedChart ?? [];
    if (data.length === 0) return { data: [], legends: [] };

    const final: ContainerTypesChart = { data: [], legends: [] };

    for (const [index, item] of data.entries()) {
      const name = getLocalizedName(item);
      const color = getColorForItem(name, CONTAINER_TYPE_COLORS, index);

      final.data.push({
        value: item.value,
        frontColor: color,
      });
      final.legends.push({ color, label: name });
    }

    return final;
  }

  const containerTypesChart = getContainerTypesChart();

  // NOTE: add 10% padding to max value to leave room for top labels
  const containersMaxValue =
    Math.max(...positiveContainersChart.data.map((d) => d.value ?? 0), 0) * 1.1;

  const containerTypesMaxValue =
    Math.max(...containerTypesChart.data.map((d) => d.value ?? 0), 0) * 1.1;

  const riskChartData = getRiskChart();

  const riskMaxValue =
    Math.max(
      ...riskChartData.map((d) =>
        d.stacks.reduce((sum, s) => sum + s.value, 0),
      ),
      0,
    ) * 1.1;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={stats.isLoading}
          onRefresh={stats.refetch}
        />
      }
    >
      <View style={{ padding }}>
        <View className="items-center">
          {Platform.OS === "android" ? (
            <AndroidPicker
              options={presetOptions}
              selectedIndex={selectedPreset}
              onOptionSelected={({ nativeEvent: { index } }) => {
                setSelectedPreset(index);
              }}
              variant="segmented"
              elementColors={{
                activeContentColor: "#FFFFFF",
                activeContainerColor: COLORS_MAP.green,
                inactiveContainerColor: "#F1FCF2",
                inactiveContentColor: "#000000",
              }}
            />
          ) : Platform.OS === "ios" ? (
            <Host style={{ width: "100%", height: 32 }}>
              <IOSPicker
                options={presetOptions}
                selectedIndex={selectedPreset}
                onOptionSelected={({ nativeEvent: { index } }) => {
                  setSelectedPreset(index);
                }}
                variant="segmented"
              />
            </Host>
          ) : null}
        </View>
        <View className="flex-row flex-wrap w-full mt-6" style={{ gap }}>
          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>{t("data.kpi.housesVisited")}</CardTitle>
              <CardDescription>
                {t("data.kpi.housesVisitedDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.housesVisited}
              </Text>
            </CardContent>
          </Card>

          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>{t("data.kpi.positiveContainers")}</CardTitle>
              <CardDescription>
                {t("data.kpi.positiveContainersDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.positiveContainers}
              </Text>
            </CardContent>
          </Card>

          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>{t("data.kpi.coverage")}</CardTitle>
              <CardDescription>{t("data.kpi.coverageDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.coveragePercentage} %
              </Text>
            </CardContent>
          </Card>

          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>{t("data.kpi.housesWithAedes")}</CardTitle>
              <CardDescription>
                {t("data.kpi.housesWithAedesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.housesWithAedesPercentage} %
              </Text>
            </CardContent>
          </Card>
        </View>

        <View className="mt-6" style={{ gap: 16 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t("data.charts.houseAccessStatus")}</CardTitle>
              <CardDescription>
                {t("data.charts.houseAccessStatusDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View className="items-center">
                <PieChart
                  data={houseAccessChart.data}
                  donut
                  focusOnPress
                  radius={100}
                  innerRadius={60}
                  centerLabelComponent={() =>
                    selectedHouseAccess ? (
                      <View className="items-center justify-center">
                        <Text className="text-2xl font-bold">
                          {selectedHouseAccess.percentage}%
                        </Text>
                        <Text className="text-sm text-gray-500">
                          ({selectedHouseAccess.value})
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-sm text-gray-400">
                        {t("data.charts.tapSlice")}
                      </Text>
                    )
                  }
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {houseAccessChart.legends.map((legend) => (
                  <Legend
                    key={legend.label}
                    color={legend.color}
                    label={legend.label}
                  />
                ))}
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("data.charts.containerTypesWithMostPositives")}
              </CardTitle>
              <CardDescription>
                {t("data.charts.containerTypesWithMostPositivesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View style={{ overflow: "hidden" }}>
                <BarChart
                  data={positiveContainersChart.data}
                  adjustToWidth
                  showValuesAsTopLabel
                  maxValue={containersMaxValue}
                  topLabelTextStyle={{
                    color: "#111827",
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {positiveContainersChart.legends.map((legend) => (
                  <Legend
                    key={legend.label}
                    color={legend.color}
                    label={legend.label}
                  />
                ))}
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("data.charts.containerTypesInspected")}</CardTitle>
              <CardDescription>
                {t("data.charts.containerTypesInspectedDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View style={{ overflow: "hidden" }}>
                <BarChart
                  data={containerTypesChart.data}
                  adjustToWidth
                  showValuesAsTopLabel
                  maxValue={containerTypesMaxValue}
                  topLabelTextStyle={{
                    color: "#111827",
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {containerTypesChart.legends.map((legend) => (
                  <Legend
                    key={legend.label}
                    color={legend.color}
                    label={legend.label}
                  />
                ))}
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("data.charts.riskChangeInCity")}</CardTitle>
              <CardDescription>
                {t("data.charts.riskChangeInCityDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View style={{ overflow: "hidden" }}>
                <BarChart
                  stackData={riskChartData}
                  adjustToWidth
                  maxValue={riskMaxValue}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {[
                  { label: t("data.legends.green"), color: COLORS_MAP.green },
                  { label: t("data.legends.yellow"), color: COLORS_MAP.yellow },
                  { label: t("data.legends.red"), color: COLORS_MAP.red },
                ].map((item) => (
                  <Legend
                    key={item.label}
                    color={item.color}
                    label={item.label}
                  />
                ))}
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

interface LegendProps {
  color: string;
  label: string;
}
function Legend(props: LegendProps) {
  return (
    <View key={props.label} className="flex-row items-center">
      <View
        style={{ backgroundColor: props.color }}
        className="w-3 h-3 rounded-sm"
      />
      <Text className="ml-1 text-xs">{props.label}</Text>
    </View>
  );
}
