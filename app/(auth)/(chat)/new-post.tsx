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

import { createPostSchema, PostInputType, Team } from "@/schema";
import { useAuth } from "@/context/AuthProvider";
import {
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "@/components/themed";
import { getInitialsBase } from "@/util";
import { Button } from "@/components/themed";

export default function NewPost() {
  const { t } = useTranslation();
  const { meData } = useAuth();
  const router = useRouter();

  const methods = useForm<PostInputType>({
    resolver: zodResolver(createPostSchema()),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = methods;

  const onSubmitHandler: SubmitHandler<PostInputType> = async (values) => {
    //TODO sent to server
    console.log("values>>>>", values);
  };

  const onBack = () => {
    router.back();
  };

  const handleAddMedia = () => {
    console.log("add media>>>>");
  };

  console.log("meData>>>>", meData);

  const initials = getInitialsBase(
    String(meData?.userProfile?.firstName),
    String(meData?.userProfile?.lastName),
  );

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex flex-row items-center mb-4">
            <View
              className={`flex items-center justify-center w-10 h-10 rounded-full bg-green-400 mr-3`}
            >
              <Text className="font-bold text-sm text-green-700">
                {initials}
              </Text>
            </View>
            <View className="flex flex-1 flex-col">
              <Text className="font-semibold">{`${meData?.userProfile?.firstName} ${meData?.userProfile?.lastName}`}</Text>
              <Text className={`text-sm opacity-60`}>
                {(meData?.userProfile?.team as Team)?.sector_name}
              </Text>
            </View>
          </View>
          <FormProvider {...methods}>
            <View className="mb-4">
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border-0"
                    hasError={!!errors.content}
                    placeholder={t("chat.sharePlaceholder")}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    autoCapitalize="sentences"
                    autoCorrect={true}
                    blurOnSubmit={false}
                  />
                )}
                name="content"
              />
              {errors?.content?.message && (
                <Text className="font-normal text-red-500 text-xs mb-2 mt-1">
                  {errors.content.message}
                </Text>
              )}
            </View>
          </FormProvider>
        </ScrollView>
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <Button title={t("chat.actions.delete")} onPress={onBack} />
          </View>
          <View className="flex-1">
            <Button
              primary
              // disabled={!isValid}
              disabled={true}
              title={t("chat.actions.post")}
              onPress={handleSubmit(onSubmitHandler)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
