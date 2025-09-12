import Button from "@/components/themed/Button";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import RNPickerSelect, { Item } from "react-native-picker-select";
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
import { axios } from "@/config/axios";
import Colors from "@/constants/Colors";
import { QuestionnaireState, useStore } from "@/hooks/useStore";
import { BaseObject, Team } from "@/schema";
import { TeamResponse, VisitData } from "@/types";
import { calculatePercentage, countSetFilters, formatDate } from "@/util";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, RefreshControl } from "react-native";
import Toast from "react-native-toast-message";
import { useFilters } from "@/hooks/useFilters";
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useVisit } from "@/hooks/useVisit";
import { useInspectionPhotos } from "@/hooks/useInspectionPhotos";
import * as Sentry from "@sentry/react-native";

interface HouseReport {
  greenQuantity: number;
  houseQuantity: number;
  orangeQuantity: number;
  redQuantity: number;
  siteVariationPercentage: number;
  visitQuantity: number;
  visitVariationPercentage: number;
}

function VisitsReport({
  loading,
  data,
}: {
  loading: boolean;
  data: HouseReport | undefined;
}) {
  const userProfile = useStore((state) => state.userProfile);
  const { t } = useTranslation();
  const router = useRouter();
  const { filters } = useFilters();

  const onPressFilter = () => {
    router.push("/filters-visit");
  };

  const filterString = [filters?.team?.name, filters?.wedge?.name]
    .filter((i) => i !== undefined)
    .join(" - ");

  // NOTE: maybe we can generalize this in the future, we have the same thing at `(tabs)/visits.tsx`
  const colorPercentages = useMemo(() => {
    if (!data) return [0, 0, 0];

    const { redQuantity, orangeQuantity, greenQuantity } = data;

    const total = redQuantity + orangeQuantity + greenQuantity;

    const red = Math.floor(calculatePercentage(redQuantity, total));
    const orange = Math.floor(calculatePercentage(orangeQuantity, total));
    const green = Math.floor(calculatePercentage(greenQuantity, total));

    return [green, orange, red];
  }, [data]);

  return (
    <View>
      <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
        {loading && !data && (
          <View className="flex flex-1 items-center justify-center my-48">
            <Loading />
          </View>
        )}
        {!loading && data && (
          <>
            <View className="flex flex-row justify-between">
              <View className="flex">
                <Text type="title" className="mb-2 w-52">
                  {filters.sector?.name ||
                    (userProfile?.userProfile?.team as Team)?.sector_name}
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
                {data.visitQuantity}
              </Text>
              <SimpleChip
                border="1"
                padding="small"
                textColor="neutral-500"
                borderColor="neutral-500"
                ionIcon={
                  data.visitVariationPercentage > 0 ? "arrow-up" : "arrow-down"
                }
                iconColor={Colors.light.neutral}
                label={`${data.visitVariationPercentage}% ${t("brigade.cards.numberThisWeek")}`}
              />
            </View>

            <View>
              <Text className="text-neutral-600 mb-2">
                {t("brigade.cards.numberSites")}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-semibold">
                  {data.houseQuantity}
                </Text>

                <SimpleChip
                  border="1"
                  padding="small"
                  textColor="neutral-500"
                  borderColor="neutral-500"
                  ionIcon={
                    data.siteVariationPercentage > 0 ? "arrow-up" : "arrow-down"
                  }
                  iconColor={Colors.light.neutral}
                  label={`${data.siteVariationPercentage}% ${t("brigade.cards.numberThisWeek")}`}
                />
              </View>
            </View>
            <View className="flex flex-col mt-6">
              <ProgressBar
                label={t("brigade.sites.green")}
                progress={colorPercentages[0]}
                colorClassName="bg-primary"
              />
              <ProgressBar
                label={t("brigade.sites.yellow")}
                progress={colorPercentages[1]}
                colorClassName="bg-yellow-300"
              />
              <ProgressBar
                label={t("brigade.sites.red")}
                progress={colorPercentages[2]}
                colorClassName="bg-red-500"
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function SuccessSummary() {
  const { t } = useTranslation();

  return (
    <View className="flex flex-col justify-center items-center flex-1">
      <Text type="title" className="text-center">
        {t("visit.synchronizedVisit")}
      </Text>
    </View>
  );
}

function useTeamQuery() {
  const userProfile = useStore((state) => state.userProfile);
  const teamId = (userProfile?.userProfile?.team as BaseObject)?.id;

  return useQuery({
    enabled: !!teamId,
    queryKey: ["visits", "team", teamId],
    queryFn: async () => {
      return (await axios.get(`/teams/${teamId}`)).data as TeamResponse;
    },
  });
}

function useReportsQuery(
  sectorId: number | null,
  wedgeId: number | null,
  teamId: number | null,
) {
  return useQuery({
    // NOTE: we can trigger this for all sectors, wedges, and teams but we're
    // setting the sectorId in the first render so we rather wait for the
    // sectorId to be set before enabling the query
    enabled: !!sectorId || !!wedgeId || !!teamId,
    queryKey: ["visits", "team", teamId, { sectorId, wedgeId, teamId }],
    queryFn: async () => {
      return (
        await axios.get("reports/house_status", {
          params: {
            sort: "name",
            order: "asc",
            "filter[sector_id]": sectorId,
            "filter[wedge_id]": wedgeId,
            "filter[team_id]": teamId,
          },
        })
      ).data as HouseReport;
    },
  });
}

function useCreateVisitMutation() {
  return useMutation({
    mutationFn: (data: FormData) => {
      return axios.post<VisitData>("/visits", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  });
}

export default function Visits() {
  const { t } = useTranslation();
  const { isInternetReachable } = useNetInfo();
  const { i18n } = useTranslation();
  const userProfile = useStore((state) => state.userProfile);
  const { filters, setFilter } = useFilters();
  const { setVisitData, visitData } = useVisit();
  const { deleteInspectionPhotosFromVisit } = useInspectionPhotos();

  const router = useRouter();

  const storedVisits = useStore((state) => state.storedVisits);
  const cleanUpStoredVisit = useStore((state) => state.cleanUpStoredVisit);
  const visitId = useStore((state) => state.visitId);
  const inspectionPhotos = useStore((state) => state.inspectionPhotos);

  const inspectionPhotosForCurrentVisit = useMemo(
    () => inspectionPhotos.filter((photo) => photo.visitId === visitId),
    [inspectionPhotos, visitId],
  );

  const [selectedVisit, setSelectedVisit] = useState<QuestionnaireState>();
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sectorId = filters.sector?.id ?? null;
  const wedgeId = filters.wedge?.id ?? null;
  const teamId = filters.team?.id ?? null;

  const team = useTeamQuery();
  useRefreshOnFocus(team.refetch);

  const reports = useReportsQuery(sectorId, wedgeId, teamId);
  useRefreshOnFocus(reports.refetch);

  const createVisit = useCreateVisitMutation();

  const teamMemberOptions: Item[] = useMemo(
    () =>
      team.data?.data.attributes.members
        .map((member) => ({
          label: member.fullName,
          value: member.id,
          // https://github.com/lawnstarter/react-native-picker-select/issues/169#issuecomment-484954440
          color: "black",
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [team],
  );

  const orderedVisits = storedVisits.sort(
    // @ts-expect-error
    (a, b) => new Date(b.visitedAt) - new Date(a.visitedAt),
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setFilter({
      sector: {
        // @ts-expect-error
        id: userProfile?.userProfile?.team?.sector_id as number,
        // @ts-expect-error
        name: userProfile?.userProfile?.team?.sector_name,
      },
    });
  }, [userProfile]);

  async function onRefresh() {
    try {
      setRefreshing(true);
      await Promise.all([team.refetch(), reports.refetch()]);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    } finally {
      setRefreshing(false);
    }
  }

  const synchronizeVisit = async (visit: any) => {
    // NOTE: copying the visit since we're going to mutate a reference
    const newVisit = { ...visit, house: { ...visit.house } };

    // NOTE: remove stuff that we don't need to send to the backend and
    // was added in the summary page to show the site and colors in the modal
    if (visit.houseId) delete newVisit.house;
    delete newVisit.statusColor;
    delete newVisit.colorsAndQuantities;

    try {
      const form = new FormData();
      form.append("json_params", JSON.stringify(newVisit));
      for (const photo of inspectionPhotosForCurrentVisit) {
        // @ts-expect-error doesn't expect the object part
        form.append("photos[]", {
          uri: photo.uri,
          name: photo.filename,
          type: "image/jpeg",
        });
      }
      await createVisit.mutateAsync(form);
      await deleteInspectionPhotosFromVisit(visitId);
      cleanUpStoredVisit(newVisit);
      setSuccess(true);
      bottomSheetModalRef.current?.close();
      Toast.show({
        type: "success",
        text1: t("success"),
      });
    } catch (error) {
      Sentry.captureException(error);
      Toast.show({
        type: "error",
        text1: t(["errorCodes.generic"]),
      });
      console.error(error);
    }
  };

  const handlePressVisit = (visit: QuestionnaireState) => {
    setSelectedVisit(visit);
    bottomSheetModalRef.current?.present();
  };

  const snapPoints = useMemo(() => ["90%"], []);

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

              <View className="mb-4">
                <Text className="font-medium text-sm mb-2">
                  {t("visit.assignVisitToUser")}
                </Text>

                <RNPickerSelect
                  items={teamMemberOptions}
                  onValueChange={(value: number | null) => {
                    if (!teamMemberOptions.length) return;
                    if (!value) {
                      setVisitData({ userAccountId: userProfile!.id });
                      return;
                    }
                    setVisitData({ userAccountId: value.toString() });
                  }}
                  value={visitData.userAccountId}
                  style={{
                    inputAndroid: {
                      borderWidth: 1,
                      // NOTE: same as `text-red-500` and `border-neutral-200` class
                      borderColor: "#e7e5e4",
                      padding: 8,
                      height: 44,
                      borderRadius: 8,
                    },
                    inputIOSContainer: {
                      justifyContent: "center",
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#e7e5e4",
                      height: 44,
                    },
                    iconContainer: {
                      top: "50%",
                      transform: [{ translateY: -12 }],
                      right: 6,
                    },
                  }}
                  useNativeAndroidPickerStyle={false}
                  // https://github.com/lawnstarter/react-native-picker-select/pull/377
                  fixAndroidTouchableBug={true}
                  Icon={() => (
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={24}
                      color="#e7e5e4"
                    />
                  )}
                  doneText={t("done")}
                />
              </View>

              <Button
                title={t("visit.registerVisit")}
                primary
                onPress={() => router.push("/select-house")}
              />
            </View>

            <VisitsReport loading={reports.isLoading} data={reports.data} />

            <View className="my-4 p-8 rounded-2xl border border-neutral-200">
              <Text className="text-xl font-bold text-center mb-2">
                {t("visit.list.visitList")}
              </Text>
              {!!storedVisits.length ? (
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
                        // @ts-expect-error
                        `${t("visit.houses.house")} ${visit?.house?.referenceCode}`
                      }
                      onPressElement={() => handlePressVisit(visit)}
                      // @ts-expect-error
                      filled={formatDate(visit.visitedAt, i18n.language)}
                    />
                  ))}
                </>
              ) : (
                <Text className="text-center">{t("visit.list.done")}</Text>
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
              <View className="w-full h-full">
                {!success && (
                  <>
                    {createVisit.isPending ? (
                      <View className="flex flex-1 items-center justify-center">
                        <Loading />
                      </View>
                    ) : (
                      <VisitSummary
                        // @ts-expect-error
                        date={`${formatDate(selectedVisit?.visitedAt || "", i18n.language)}`}
                        sector={team.data?.data.attributes.sector?.name}
                        // @ts-expect-error
                        house={`${selectedVisit?.house?.referenceCode}`}
                        // @ts-expect-error
                        color={selectedVisit?.statusColor}
                        // @ts-expect-error
                        greens={selectedVisit?.colorsAndQuantities?.GREEN}
                        // @ts-expect-error
                        yellows={selectedVisit?.colorsAndQuantities?.YELLOW}
                        // @ts-expect-error
                        reds={selectedVisit?.colorsAndQuantities?.RED}
                        // @ts-expect-error
                        permissionToVisitGranted={
                          selectedVisit?.visitPermission
                        }
                      />
                    )}
                  </>
                )}
                {success && <SuccessSummary />}
              </View>
            </View>
            {!success ? (
              <Button
                title="Sincronizar visita"
                onPress={() => synchronizeVisit(selectedVisit)}
                disabled={!isInternetReachable || createVisit.isPending}
                primary
              />
            ) : (
              <Button
                title="Cerrar"
                onPress={() => {
                  setSuccess(false);
                  bottomSheetModalRef.current?.close();
                }}
              />
            )}
          </View>
        </ClosableBottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}
