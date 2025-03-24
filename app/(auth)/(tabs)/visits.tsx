import Button from "@/components/themed/Button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { CheckTeam } from "@/components/segments/CheckTeam";
import {
  FilterButton,
  ListItem,
  Loading,
  ProgressBar,
  SafeAreaView,
  ScrollView,
  SimpleChip,
  Text,
  View,
} from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import VisitSummary from "@/components/VisitSummary";
import { authApi } from "@/config/axios";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { QuestionnaireState, useVisitStore } from "@/hooks/useVisitStore";
import { BaseObject, ErrorResponse, Team } from "@/schema";
import { VisitData } from "@/types";
import { countSetFilters, extractAxiosErrorData, formatDate } from "@/util";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import useAxios from "axios-hooks";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, RefreshControl, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { Routes } from "../(visit)/_layout";
import { sanitizeInspections } from "../(visit)/sanitizeInspections";
import { useFilters } from "@/hooks/useFilters";

interface HouseReport {
  greenQuantity: number;
  houseQuantity: number;
  orangeQuantity: number;
  redQuantity: number;
  siteVariationPercentage: number;
  visitQuantity: number;
  visitVariationPercentage: number;
}

const VisitsReport = ({
  loading,
  data,
}: {
  loading: boolean;
  data: HouseReport | undefined;
}) => {
  const { meData } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { filters } = useFilters();

  const onPressFilter = () => {
    router.push("/filters-visit");
  };

  const filterString = [filters?.team?.name, filters?.wedge?.name]
    .filter((i) => i !== undefined)
    .join(" - ");

  return (
    <View>
      <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
        {loading && (
          <View className="flex flex-1 items-center justify-center my-48">
            <Loading />
          </View>
        )}
        {!loading && (
          <>
            <View className="flex flex-row justify-between">
              <View className="flex">
                <Text type="title" className="mb-2 w-52">
                  {filters.sector?.name ||
                    (meData?.userProfile?.team as Team)?.sector_name}
                </Text>
                {(filters.team?.name || filters.wedge?.name) && (
                  <Text type="small" className="mb-6 w-52">
                    {filterString}
                  </Text>
                )}
              </View>
              <FilterButton
                filters={countSetFilters(filters, ["wedge", "sector", "team"])}
                onPress={onPressFilter}
              />
            </View>
            <Text className="text-neutral-600 mb-2">
              {t("brigade.cards.numberVisits")}
            </Text>
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-3xl font-semibold">
                {data?.visitQuantity}
              </Text>
              <SimpleChip
                border="1"
                padding="small"
                textColor="neutral-500"
                borderColor="neutral-500"
                ionIcon="arrow-up"
                iconColor={Colors.light.neutral}
                label={`${data?.visitVariationPercentage} ${t("brigade.cards.numberThisWeek")}`}
              />
            </View>

            <View>
              <Text className="text-neutral-600 mb-2">
                {t("brigade.cards.numberSites")}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-semibold">
                  {data?.houseQuantity}
                </Text>

                <SimpleChip
                  border="1"
                  padding="small"
                  textColor="neutral-500"
                  borderColor="neutral-500"
                  ionIcon="arrow-up"
                  iconColor={Colors.light.neutral}
                  label={`${data?.siteVariationPercentage} ${t("brigade.cards.numberThisWeek")}`}
                />
              </View>
            </View>
            <View className="flex flex-col mt-6">
              <ProgressBar
                label={t("brigade.sites.green")}
                progress={data?.greenQuantity || 0}
                color="primary"
              />
              <ProgressBar
                label={t("brigade.sites.yellow")}
                progress={data?.orangeQuantity || 0}
                color="yellow-300"
              />
              <ProgressBar
                label={t("brigade.sites.red")}
                progress={data?.redQuantity || 0}
                color="red-500"
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default function Visits() {
  const { t } = useTranslation();
  const router = useRouter();
  const { storedVisits, cleanUpStoredVisit } = useVisitStore();
  const { language, isConnected } = useVisit();
  const [selectedVisit, setSelectedVisit] = useState<QuestionnaireState>();
  const { meData } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { filters, setFilter } = useFilters();
  const [data, setData] = useState<HouseReport>();
  const [loadingReports, setLoadingReports] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { reload } = useLocalSearchParams();

  useEffect(() => {
    if (reload) {
      (async () => {
        await fetchData(
          filters.sector?.id,
          filters.wedge?.id,
          filters.team?.id,
        );
      })();
    }
  }, [reload]);

  const orderedVisits = storedVisits.sort(
    (a, b) => new Date(b.visitedAt) - new Date(a.visitedAt),
  );

  const [{ data: teamData, loading: loadingTeam }, refetchTeam] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `teams/${(meData?.userProfile?.team as BaseObject)?.id}`,
  });

  useEffect(() => {
    if (meData) refetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  useEffect(() => {
    if (!teamData) return;
    const deserializedData = deserialize<Team>(teamData);
    // console.log("deserializedData TEAM>>>>>>>>>>", deserializedData);
    if (deserializedData && !Array.isArray(deserializedData)) {
      setTeam(deserializedData);
    }
  }, [teamData]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const hasVisits = storedVisits.length > 0;

  const { createMutation: createVisit } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  useEffect(() => {
    setFilter({
      sector: {
        id: meData?.userProfile?.team?.sector_id as number,
        name: meData?.userProfile?.team?.sector_name,
      },
    });
  }, []);

  useEffect(() => {
    fetchData(filters.sector?.id, filters?.wedge?.id, filters.team?.id);
  }, [filters]);

  const fetchData = async (
    sectorId?: number,
    wedgeId?: number,
    teamId?: number,
  ) => {
    setLoadingReports(true);
    try {
      const response = await authApi.get("reports/house_status", {
        params: {
          sort: "name",
          order: "asc",
          "filter[sector_id]": sectorId,
          "filter[wedge_id]": wedgeId,
          "filter[team_id]": teamId,
        },
      });
      setData(response.data);
    } catch (e) {
      console.log(e);
    }
    setLoadingReports(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(filters.sector?.id, filters.wedge?.id, filters.team?.id);
    setRefreshing(false);
  };

  const synchronizeVisit = async (visit: any) => {
    let newVisit = {
      ...visit,
      house: visit.houseId ? undefined : visit.house,
      visitPermission: true,
    };

    const visitToSubmit = {
      ...newVisit,
      inspections: sanitizeInspections(newVisit.inspections),
    };

    delete visitToSubmit.statusColor;
    delete visitToSubmit.colorsAndQuantities;

    try {
      setLoading(true);
      await createVisit({ json_params: JSON.stringify(visitToSubmit) });
      cleanUpStoredVisit(visitToSubmit);
      setSuccess(true);
      bottomSheetModalRef.current?.close();
      Toast.show({
        type: "success",
        text1: t("success"),
      });
      setLoading(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t(["errorCodes.generic"]),
      });
      setLoading(false);
      console.log(error);
    }
  };

  const handlePressVisit = (visit: any) => {
    setSelectedVisit(visit);
    bottomSheetModalRef.current?.present();
  };

  const snapPoints = useMemo(() => ["90%"], []);

  const SuccessSummary = () => {
    return (
      <View className="flex flex-col justify-center items-center flex-1">
        <Text type="title" className="text-center">
          {t("visit.synchronizedVisit")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CheckTeam view="visit">
          <View className="flex flex-1 py-5 px-5 w-full">
            <View className="my-6 mb-8 p-8 rounded-2xl border border-neutral-200">
              <Text className="text-xl font-bold text-center mb-2">
                {t("visit.newVisit")}
              </Text>
              <Text className="text-center mb-6">
                {t("visit.registerCopy")}
              </Text>
              <Button
                title={t("visit.registerVisit")}
                primary
                onPress={() => router.push(Routes.SelectHouse)}
              />
            </View>

            <VisitsReport loading={loadingReports} data={data} />

            <View className="my-4 p-8 rounded-2xl border border-neutral-200">
              <Text className="text-xl font-bold text-center mb-2">
                {t("visit.list.visitList")}
              </Text>
              {!!hasVisits && (
                <>
                  <Text className="text-center mb-6">
                    {t("visit.list.pending", {
                      storedVisits: storedVisits.length,
                    })}
                  </Text>
                  {orderedVisits.map((visit, idx) => (
                    <ListItem
                      key={idx}
                      testID="offlineVisit"
                      title={
                        visit.house &&
                        `${t("visit.houses.house")} ${visit?.house?.referenceCode}`
                      }
                      onPressElement={() => handlePressVisit(visit)}
                      filled={formatDate(visit.visitedAt, language)}
                    />
                  ))}
                </>
              )}
              {!hasVisits && (
                <>
                  <Text className="text-center">{t("visit.list.done")}</Text>
                </>
              )}
            </View>
          </View>
        </CheckTeam>

        <View className={Platform.OS === "ios" ? "h-6" : "h-14"}></View>
        <ClosableBottomSheet
          title={`Casa ${selectedVisit?.referenceCode || ""}`}
          snapPoints={snapPoints}
          bottomSheetModalRef={bottomSheetModalRef}
          onClose={() => setSuccess(false)}
        >
          <View className="h-full w-full flex px-4 py-4">
            <View className="flex-1 mb-4">
              <View className="border border-neutral-200 rounded-lg w-full h-full px-4">
                {!success && (
                  <>
                    {loading && (
                      <View className="flex flex-1 items-center justify-center">
                        <Loading />
                      </View>
                    )}
                    {!loading && (
                      <VisitSummary
                        date={`${formatDate(selectedVisit?.visitedAt || "", language)}`}
                        sector={team?.sector?.name}
                        house={`${selectedVisit?.house?.referenceCode}`}
                        color={selectedVisit?.statusColor}
                        greens={selectedVisit?.colorsAndQuantities?.GREEN}
                        yellows={selectedVisit?.colorsAndQuantities?.YELLOW}
                        reds={selectedVisit?.colorsAndQuantities?.RED}
                      />
                    )}
                  </>
                )}
                {success && <SuccessSummary />}
              </View>
            </View>
            {!success && (
              <Button
                title="Sincronizar visita"
                onPress={() => synchronizeVisit(selectedVisit)}
                disabled={!isConnected || loading}
                primary
              />
            )}
            {success && (
              <Button
                title="Cerrar"
                onPress={() => {
                  setSuccess(false);
                  bottomSheetModalRef.current?.close();
                  setLoading(false);
                }}
              />
            )}
          </View>
        </ClosableBottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ circle: { backgroundColor: "#FC0606" } });
