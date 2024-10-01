import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  useForm,
  Controller,
  SubmitHandler,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BaseObject, createHouseSchema, HouseInputType, Team } from "@/schema";
import { useAuth } from "@/context/AuthProvider";
import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  SimpleSelectableItem,
  TextInput,
  LocationButton,
} from "@/components/themed";
import { getLanguageCode } from "@/util";
import { Button } from "@/components/themed";
import { useVisit } from "@/hooks/useVisit";
import { RESOURCE_SPECIAL_PLACE } from "@/constants/Keys";

const ID_CASA = -1;

export default function NewHouse() {
  const { t } = useTranslation();
  const { meData } = useAuth();

  const {
    setVisitData,
    getResourceByName,
    questionnaire,
    language,
    visitData,
  } = useVisit();
  const router = useRouter();

  const [siteOptions, setSiteOptions] = useState<BaseObject[]>([]);
  const [itemSelectedId, setItemSelectedId] = useState<number>(ID_CASA);

  const methods = useForm<HouseInputType>({
    resolver: zodResolver(createHouseSchema()),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = methods;

  const onSubmitHandler: SubmitHandler<HouseInputType> = async (values) => {
    setVisitData({
      houseId: undefined,
      house: {
        ...visitData?.house,
        houseBlockId: (meData?.userProfile?.houseBlock as BaseObject)?.id,
        referenceCode: String(values.number),
        specialPlaceId: itemSelectedId !== ID_CASA ? itemSelectedId : undefined,
      },
    });
    router.push(`visit/${questionnaire?.initialQuestion}`);
  };

  const resources = getResourceByName(RESOURCE_SPECIAL_PLACE);

  useEffect(() => {
    const lang = getLanguageCode(language);
    const sites: BaseObject[] = [
      {
        id: ID_CASA,
        name: t("visit.newHouse.siteType.house"),
      },
    ];

    try {
      resources?.forEach((resource) =>
        sites.push({
          id: resource.id,
          //@ts-ignore
          name: resource[`name_${lang}`],
        }),
      );
    } catch (error) {
      console.log("error sites params>>>", error);
    }

    setSiteOptions(sites);
  }, [resources, language, t]);

  const onBack = () => {
    router.back();
  };

  const handleLocation = () => {
    router.push(`add-location`);
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Text className="text-2xl font-bold mb-6">
            {t("visit.newHouse.title")}
          </Text>

          <Text className="text-xl font-semibold mb-4">
            {t("visit.newHouse.siteInformation")}
          </Text>

          <View className="mb-4">
            <Text className="font-medium text-sm mb-2">
              {t("visit.newHouse.sector")}
            </Text>

            <TextInput
              readOnly={true}
              value={(meData?.userProfile?.team as Team)?.sector_name}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium text-sm mb-2">
              {t("visit.newHouse.wedge")}
            </Text>

            <TextInput
              readOnly={true}
              value={(meData?.userProfile?.team as Team)?.wedge_name}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium text-sm mb-2">
              {t("visit.newHouse.houseBlock")}
            </Text>

            <TextInput
              readOnly={true}
              value={(meData?.userProfile?.houseBlock as BaseObject)?.name}
            />
          </View>

          <FormProvider {...methods}>
            <View className="mb-4">
              <Text className="font-medium text-sm mb-2">
                {t("visit.newHouse.houseNumber")}
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    hasError={!!errors.number}
                    placeholder={t("visit.newHouse.houseNumberPlaceholder")}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value !== undefined ? String(value) : ""}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numeric"
                    blurOnSubmit={false}
                  />
                )}
                name="number"
              />
              {errors?.number?.message && (
                <Text className="font-normal text-red-500 text-xs mb-2 mt-1">
                  {errors.number.message}
                </Text>
              )}
              <Text className="font-normal text-xs mb-2 mt-1">
                {t("visit.newHouse.requiredFields")}
              </Text>
            </View>
          </FormProvider>

          <View className="mb-8">
            <Text className="text-xl font-semibold mb-2">
              {t("visit.newHouse.location")}
            </Text>

            <LocationButton
              label={
                visitData?.house?.address ?? t("visit.newHouse.addLocation")
              }
              onPressElement={handleLocation}
            />
          </View>

          <Text className="text-xl font-semibold mb-2">
            {t("visit.newHouse.siteTypeQuestion")}
          </Text>

          <View className="mb-6">
            {siteOptions.map((type) => (
              <SimpleSelectableItem
                key={type.id}
                className="my-2"
                label={type.name}
                checked={itemSelectedId === type.id}
                onPressElement={() => setItemSelectedId(type.id)}
              />
            ))}
          </View>
        </ScrollView>
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <Button title={t("back")} onPress={onBack} />
          </View>
          <View className="flex-1">
            <Button
              primary
              disabled={!isValid || !visitData?.house?.address}
              title={t("next")}
              onPress={handleSubmit(onSubmitHandler)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
