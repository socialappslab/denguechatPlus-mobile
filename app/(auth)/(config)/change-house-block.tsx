import {
  Button,
  Loading,
  ScrollView,
  SelectableItem,
  Text,
  View,
} from "@/components/themed";
import { authApi } from "@/config/axios";
import { useAuth } from "@/context/AuthProvider";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { Neighborhood, Wedge } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import invariant from "tiny-invariant";
import { useFocusEffect } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";

function useHouseBlocksQuery(wedgeId: number | null) {
  interface HouseBlock {
    id: string;
    type: "houseBlock";
    attributes: {
      name: string;
      brigadist: string;
      inUse: boolean;
      team: null;
      wedge: Wedge;
      neighborhood: Neighborhood;
      houses: {
        id: number;
        reference_code: string;
      }[];
    };
  }

  interface HouseBlockResponse {
    data: HouseBlock[];
    links: {
      self: number;
      last: number;
    };
    meta: {
      total: number;
    };
  }

  return useQuery({
    enabled: !!wedgeId,
    queryKey: ["houseBlocks", wedgeId!],
    queryFn: async () => {
      const params = new URLSearchParams({
        "filter[wedge_id]": wedgeId!.toString(),
      });
      return (await authApi.get(`/house_blocks?${params}`))
        .data as HouseBlockResponse;
    },
  });
}

function useChangeHouseBlockMutation() {
  return useMutation({
    mutationFn: async (houseBlockId: number) => {
      return await authApi.put(`/users/change_house_block`, {
        house_block_id: houseBlockId,
      });
    },
  });
}

export default function ChangeHouseBlock() {
  const { t } = useTranslation();
  const { meData } = useAuth();
  const router = useRouter();
  const { isInternetReachable } = useNetInfo();

  // @ts-expect-error fix types
  const wedgeId: number | null = meData?.userProfile?.team?.wedge_id ?? null;

  const houseBlocks = useHouseBlocksQuery(wedgeId);
  useRefreshOnFocus(houseBlocks.refetch);

  const changeHouseBlock = useChangeHouseBlockMutation();

  const houseBlockId: string | undefined =
    // @ts-expect-error fix types
    meData?.userProfile?.houseBlock?.id?.toString();

  const defaultOption = useMemo(
    () =>
      houseBlocks.data?.data.find(
        (houseBlock) => houseBlock.id === houseBlockId,
      ),
    [houseBlocks.data, houseBlockId],
  );

  const [selectedOption, setSelectedOption] = useState(defaultOption);

  useFocusEffect(
    useCallback(() => {
      if (defaultOption) {
        setSelectedOption(defaultOption);
      }
    }, [defaultOption]),
  );

  const selectedOptionIsSameAsDefault =
    selectedOption?.id === defaultOption?.id;

  async function handleSave() {
    invariant(selectedOption, "A selected option was expected");

    if (!isInternetReachable) {
      Toast.show({
        type: "error",
        text1: t("internetRequired"),
      });
      return;
    }

    try {
      await changeHouseBlock.mutateAsync(Number(selectedOption.id));
      Toast.show({
        type: "success",
        text1: t("drawer.changeHouseBlockUpdated", {
          name: selectedOption.attributes.name,
        }),
      });
      router.back();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: t("errorCodes.generic"),
      });
    }
  }

  if (houseBlocks.isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <Loading />
      </View>
    );

  invariant(houseBlocks.data, "House blocks data was expected");

  return (
    <ScrollView className="px-4 pt-6 space-y-4">
      <View className="space-y-2">
        <Text className="text-2xl font-bold">
          {t("drawer.changeHouseBlock")}
        </Text>
        <Text>
          <Text className="font-bold">{t("config.sector")}:</Text>{" "}
          {/* @ts-expect-error fix types */}
          {meData?.userProfile?.team?.sector_name}
        </Text>
        <Text>
          <Text className="font-bold">{t("config.wedge")}:</Text>{" "}
          {/* @ts-expect-error fix types */}
          {meData?.userProfile?.team?.wedge_name}
        </Text>
      </View>

      <View>
        {houseBlocks.data.data.map((houseBlock) => (
          <SelectableItem
            key={houseBlock.id}
            label={houseBlock.attributes.name}
            checked={selectedOption?.id === houseBlock.id}
            chip={
              houseBlock.id === defaultOption?.id
                ? t("config.currentHouseBlock")
                : undefined
            }
            onValueChange={() => {
              setSelectedOption(houseBlock);
            }}
          />
        ))}
      </View>

      <Button
        title={t("chat.actions.save")}
        primary
        disabled={selectedOptionIsSameAsDefault || changeHouseBlock.isPending}
        onPress={handleSave}
      />
    </ScrollView>
  );
}
