import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SelectableItem } from "@/components/themed";
import { House, VisitId } from "@/types";

import {
  Button,
  Loading,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/components/themed";
import { useStore } from "@/hooks/useStore";
import moment from "moment";
import invariant from "tiny-invariant";
import { VISITS_LOG } from "@/util/logger";
import { useHouseBlockLabel } from "@/hooks/useHouseBlockLabel";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useQuery } from "@tanstack/react-query";

export default function SelectHouseScreen() {
  const { t } = useTranslation();

  const [houseSelected, setHouseSelected] = useState<House>();
  const [searchText, setSearchText] = useState<string>("");
  const router = useRouter();

  const maybeUser = useStore((state) => state.user);
  const userProfile = useStore((state) => state.userProfile);
  const fetchHouses = useStore((state) => state.fetchHouses);
  const storedHouseList = useStore((state) => state.storedHouseList);

  const houseBlockLabel = useHouseBlockLabel(
    // @ts-expect-error type of userProfile is wrong
    userProfile?.userProfile?.houseBlock?.type,
  );

  const setVisitData = useStore((state) => state.setVisitData);

  const initialiseCurrentVisit = useStore(
    (state) => state.initialiseCurrentVisit,
  );
  const questionnaire = useStore((state) => {
    invariant(state.questionnaire, "Expected questionnaire to be defined");
    return state.questionnaire;
  });

  const houses = useQuery({
    queryKey: ["housesToVisit"],
    initialData: storedHouseList,
    queryFn: fetchHouses,
  });
  useRefreshOnFocus(houses.refetch);

  const renderHouseLabel = (house: House) => {
    return (
      house.specialPlace?.name ??
      `${t("visit.houses.house")} ${house.referenceCode}`
    );
  };

  const filteredHouses = useMemo(() => {
    if (!searchText.length) {
      return houses.data;
    }

    const filtered = houses.data.filter((house) =>
      house.referenceCode.toUpperCase().includes(searchText.toUpperCase()),
    );

    return filtered;
  }, [houses.data, searchText]);

  if (!maybeUser) return null;
  const user = maybeUser;

  async function startVisit() {
    invariant(houseSelected, "Expected a house to be selected");

    const visitId = `${user.id}-${houseSelected.id}` as VisitId;

    // Set the VisitId
    initialiseCurrentVisit(visitId);

    // We set the relevant meta
    setVisitData({
      houseId: houseSelected.id,
      house: houseSelected,
      questionnaireId: questionnaire.id,
      teamId: user.teamId,
      notes: "", // https://denguechat.atlassian.net/browse/DNG-523
    });
    router.push({
      pathname: "/visit/[questionId]",
      params: {
        questionId: questionnaire.initialQuestion,
      },
    });
    VISITS_LOG.info(
      `Starting visit for house ${houseSelected.referenceCode} (id: ${houseSelected.id})`,
    );
  }

  const renderHouseDescription = (house: House) => {
    const date = moment(house.lastVisit).fromNow();
    return house.lastVisit
      ? `${t("visit.houses.lastVisit")}: ${date}`
      : undefined;
  };

  const renderTitle = (houses: House[]) => {
    if (houses.length === 0) return "";
    const house = houses[0];
    // TODO: check the neighborhood type, I think we will always have a neighborhood.
    return `${house.neighborhood?.name}`;
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        <Text className="text-xl font-bold mb-4">
          {t("visit.houses.search")}
        </Text>
        <View className="mb-6">
          <TextInput
            search
            placeholder={t("visit.houses.searchPlaceholder")}
            className="flex-1 ml-2"
            value={searchText}
            onChangeText={(value) => setSearchText(value)}
            onClear={() => setSearchText("")}
            style={{ borderWidth: 0 }}
          />
        </View>

        {houses.isLoading && (
          <View className="my-4">
            <Loading />
          </View>
        )}

        {!houses.isLoading && houses.data.length > 0 && (
          <View className="mb-2">
            <Text className="text-xl font-bold mb-2">
              {t("visit.houses.optionsTitle")}
            </Text>

            <Text className="text-md font-normal mb-2">
              {renderTitle(houses.data)}
            </Text>

            {/* @ts-expect-error */}
            {userProfile?.userProfile?.houseBlock?.name && (
              <Text className="text-md font-normal mb-4">
                {/* @ts-expect-error */}
                {houseBlockLabel}: {userProfile.userProfile.houseBlock.name}
              </Text>
            )}
          </View>
        )}

        <ScrollView className="pb-4" showsVerticalScrollIndicator={false}>
          {!houses.isLoading && filteredHouses.length > 0 && (
            <View className="my-1">
              {filteredHouses.map((house) => (
                <SelectableItem
                  testID="houseItem"
                  key={house.id}
                  checked={house.id === houseSelected?.id}
                  onValueChange={() => {
                    setHouseSelected(house);
                  }}
                  label={renderHouseLabel(house)}
                  description={renderHouseDescription(house)}
                  chip={house.specialPlace && t("visit.houses.specialPlace")}
                />
              ))}
            </View>
          )}

          <View className="my-6 p-8 rounded-2xl border border-neutral-200">
            <Text className="text-xl font-bold text-center mb-2">
              {t("visit.houses.noHouses")}
            </Text>
            <Text className="text-center mb-6">
              {t("visit.houses.noHousesMessage")}
            </Text>
            <Button
              onPress={() => {
                router.push("/new-house");
              }}
              title={t("visit.houses.registerNewHouse")}
              className="bg-green-400 border-green-400"
            />
          </View>
        </ScrollView>
        <View className="pt-5">
          <Button
            primary
            disabled={!houseSelected}
            onPress={startVisit}
            title={t("next")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
