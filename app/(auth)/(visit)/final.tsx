import { Button, Text, View } from "@/components/themed";
import { useRouter } from "expo-router";

export default function Summary() {
  const router = useRouter();

  return (
    <View className="h-full p-6 pt-20 pb-10 flex flex-col justify-between">
      <View className="flex flex-col justify-center items-center">
        <View className="bg-green-300 h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
          <Text className="text-center text">Ilustración o ícono</Text>
        </View>
        <View>
          <Text type="title" className="text-center mb-4">
            ¡Muchas gracias!
          </Text>
          <Text type="text" className="text-center px-10">
            Agradecemos a los residentes de casa, e indicamos que haremos otra
            visita próximamente.
          </Text>
        </View>
      </View>
      <View className="flex flex-row gap-2 self-end justify-self-end">
        <View className="flex-1">
          <Button
            primary
            title="Ir al inicio"
            onPress={() => router.push("(visit)")}
          />
        </View>
      </View>
    </View>
  );
}
