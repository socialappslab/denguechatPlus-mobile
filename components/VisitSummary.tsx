import HouseWarning from "@/assets/images/icons/house-warning.svg";
import { StyleSheet } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { Text, View } from "@/components/themed";

const styles = StyleSheet.create({ circle: { backgroundColor: "#FC0606" } });

export interface VisitSummaryProps {
  date: string;
  sector?: string;
  house?: string;
}

const VisitSummary = ({ date, sector, house }: VisitSummaryProps) => {
  return (
    <View className="flex px-2">
      <View className="border-b border-neutral-200 flex flex-row justify-center justify-around py-6 flex flex-col mb-8">
        <Text className="font-semibold text-xl mb-8">Estado del sitio</Text>
        <View className="flex flex-row gap-4 mb-4">
          <View
            className="rounded-full w-20 h-20 flex items-center justify-center"
            style={[styles.circle]}
          >
            <HouseWarning />
          </View>
          <View className="justify-center">
            <Text className="font-semibold text-xl">Sitio rojo</Text>
            <Text className="font-normal text-base opacity-80 text">
              Estado del sitio al día de hoy
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="font-semibold text-xl">
          Estado de los contenedores
        </Text>
        <View className="flex align-center flex-row py-6 justify-between border-b border-neutral-200 mb-6">
          <View className="flex flex-1 items-center justify-center ">
            <CircularProgress
              value={4}
              maxValue={4}
              radius={35}
              duration={0}
              activeStrokeColor="#00A300"
              activeStrokeWidth={8}
              inActiveStrokeWidth={8}
            />
            <Text className="mt-2 text-center" type="small">
              Verdes
            </Text>
          </View>
          <View className="flex flex-1 items-center justify-center">
            <CircularProgress
              value={4}
              maxValue={4}
              radius={35}
              duration={0}
              activeStrokeColor="#FCC914"
              activeStrokeWidth={8}
              inActiveStrokeWidth={8}
            />
            <Text className="mt-2 text-center" type="small">
              Amarillos
            </Text>
          </View>
          <View className="flex flex-1 items-center justify-center">
            <CircularProgress
              duration={0}
              value={1}
              maxValue={5}
              radius={35}
              activeStrokeWidth={8}
              inActiveStrokeWidth={8}
              activeStrokeColor="#FC0606"
            />
            <Text className="mt-2 text-center" type="small">
              Rojos
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
