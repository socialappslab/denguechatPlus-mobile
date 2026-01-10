import { ScrollView, Text } from "@/components/themed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axios } from "@/config/axios";
import { useStore } from "@/hooks/useStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutChangeEvent, useWindowDimensions, View } from "react-native";
import {
  BarChart,
  barDataItem,
  LineChart,
  lineDataItem,
  PieChart,
  pieDataItem,
} from "react-native-gifted-charts";

enum Preset {
  Today,
  Last30Days,
  Last6Months,
}

interface DateRange {
  from: string;
  to: string;
}

function useStatsQuery(teamId?: number, range?: DateRange) {
  interface Stats {
    data: {
      id: string;
      type: "teamStats";
      attributes: {
        housesVisited: number;
        positiveContainers: number;
        coveragePercentage: number;
        housesWithAedesPercentage: number;
      };
    };
  }

  return useQuery({
    enabled: !!teamId,
    queryKey: ["teams", teamId, "stats"],
    queryFn: () =>
      axios.get<Stats>(`/teams/${teamId}/stats`, { params: range }),
    select: ({ data }) => data.data.attributes,
  });
}

export default function Data() {
  const user = useStore((state) => state.user);
  // @ts-expect-error
  const stats = useStatsQuery(user?.team?.id);

  const { width } = useWindowDimensions();
  const [chartContainerWidth, setChartContainerWidth] = useState(0);

  const padding = 20;
  const gap = 16;
  const cardWidth = (width - padding * 2 - gap) / 2;
  const chartWidthFallback = width - padding * 2 - 32;
  const chartWidth = chartContainerWidth || chartWidthFallback;
  const chartInnerWidth = Math.max(chartWidth - 24, 0);

  const handleChartLayout = (event: LayoutChangeEvent) => {
    setChartContainerWidth(Math.floor(event.nativeEvent.layout.width));
  };

  const houseAccessData: pieDataItem[] = [
    { value: 120, color: "#2D9CDB", text: "With Access" },
    { value: 35, color: "#EB5757", text: "House Closed" },
    { value: 28, color: "#F2C94C", text: "No Permission" },
    { value: 14, color: "#6FCF97", text: "Uninhabited" },
    { value: 19, color: "#9B51E0", text: "Asked to Return" },
    { value: 9, color: "#828282", text: "No Permission (Other)" },
  ];

  const containerPositiveData: barDataItem[] = [
    { value: 58, label: "Drums", frontColor: "#E67E22" },
    { value: 46, label: "Buckets", frontColor: "#2D9CDB" },
    { value: 41, label: "Tires", frontColor: "#EB5757" },
    { value: 33, label: "Tanks", frontColor: "#27AE60" },
    { value: 27, label: "Bottles", frontColor: "#9B51E0" },
    { value: 22, label: "Other", frontColor: "#828282" },
  ];

  const riskLabels = ["W1", "W2", "W3", "W4", "W5", "W6"];
  const riskGreen: lineDataItem[] = [
    { value: 38, label: riskLabels[0] },
    { value: 42, label: riskLabels[1] },
    { value: 35, label: riskLabels[2] },
    { value: 40, label: riskLabels[3] },
    { value: 46, label: riskLabels[4] },
    { value: 44, label: riskLabels[5] },
  ];
  const riskYellow: lineDataItem[] = [
    { value: 18 },
    { value: 22 },
    { value: 27 },
    { value: 24 },
    { value: 29 },
    { value: 26 },
  ];
  const riskRed: lineDataItem[] = [
    { value: 8 },
    { value: 12 },
    { value: 10 },
    { value: 14 },
    { value: 16 },
    { value: 13 },
  ];

  const distLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const distGreen: lineDataItem[] = [
    { value: 120, label: distLabels[0] },
    { value: 128, label: distLabels[1] },
    { value: 140, label: distLabels[2] },
    { value: 134, label: distLabels[3] },
    { value: 150, label: distLabels[4] },
    { value: 158, label: distLabels[5] },
  ];
  const distYellow: lineDataItem[] = [
    { value: 68 },
    { value: 74 },
    { value: 72 },
    { value: 80 },
    { value: 86 },
    { value: 90 },
  ];
  const distRed: lineDataItem[] = [
    { value: 24 },
    { value: 28 },
    { value: 32 },
    { value: 36 },
    { value: 34 },
    { value: 38 },
  ];

  return (
    <ScrollView>
      <View style={{ padding }}>
        <View className="flex-row flex-wrap w-full" style={{ gap }}>
          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>Casas visitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.housesVisited}
              </Text>
            </CardContent>
          </Card>

          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>Envases positivos</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.positiveContainers}
              </Text>
            </CardContent>
          </Card>

          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-3xl font-bold leading-none">
                {stats.data?.coveragePercentage} %
              </Text>
            </CardContent>
          </Card>

          <Card style={{ width: cardWidth }}>
            <CardHeader>
              <CardTitle>Casas con aedes</CardTitle>
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
              <CardTitle>House Access Status</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="items-center">
                <PieChart
                  data={houseAccessData}
                  showText
                  textColor="#111827"
                  radius={90}
                  showExternalLabels
                  labelsPosition="outward"
                  labelLineConfig={{ color: "#9CA3AF", length: 12 }}
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {houseAccessData.map((item) => (
                  <View key={item.text} className="flex-row items-center">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: item.color,
                        marginRight: 6,
                      }}
                    />
                    <Text className="text-xs">{item.text}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Container Types with Most Positives</CardTitle>
            </CardHeader>
            <CardContent>
              <View onLayout={handleChartLayout} style={{ overflow: "hidden" }}>
                <BarChart
                  data={containerPositiveData}
                  height={200}
                  width={chartInnerWidth}
                  barWidth={24}
                  spacing={16}
                  adjustToWidth
                  parentWidth={chartInnerWidth}
                  roundedTop
                  showValuesAsTopLabel
                  topLabelTextStyle={{ color: "#111827", fontSize: 12 }}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  isAnimated
                />
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Change Chart in the City</CardTitle>
            </CardHeader>
            <CardContent>
              <View onLayout={handleChartLayout} style={{ overflow: "hidden" }}>
                <LineChart
                  data={riskGreen}
                  data2={riskYellow}
                  data3={riskRed}
                  color1="#27AE60"
                  color2="#F2C94C"
                  color3="#EB5757"
                  height={200}
                  width={chartInnerWidth}
                  spacing={32}
                  initialSpacing={8}
                  endSpacing={8}
                  adjustToWidth
                  dataPointsRadius={4}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  rulesColor="#E5E7EB"
                  isAnimated
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {[
                  { label: "Green", color: "#27AE60" },
                  { label: "Yellow", color: "#F2C94C" },
                  { label: "Red", color: "#EB5757" },
                ].map((item) => (
                  <View key={item.label} className="flex-row items-center">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: item.color,
                        marginRight: 6,
                      }}
                    />
                    <Text className="text-xs">{item.label}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>House Color Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <View onLayout={handleChartLayout} style={{ overflow: "hidden" }}>
                <LineChart
                  data={distGreen}
                  data2={distYellow}
                  data3={distRed}
                  color1="#27AE60"
                  color2="#F2C94C"
                  color3="#EB5757"
                  height={200}
                  width={chartInnerWidth}
                  spacing={34}
                  initialSpacing={8}
                  endSpacing={8}
                  adjustToWidth
                  dataPointsRadius={4}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  rulesColor="#E5E7EB"
                  isAnimated
                />
              </View>
              <View className="flex-row flex-wrap mt-4" style={{ gap: 12 }}>
                {[
                  { label: "Green", color: "#27AE60" },
                  { label: "Yellow", color: "#F2C94C" },
                  { label: "Red", color: "#EB5757" },
                ].map((item) => (
                  <View key={item.label} className="flex-row items-center">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: item.color,
                        marginRight: 6,
                      }}
                    />
                    <Text className="text-xs">{item.label}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
