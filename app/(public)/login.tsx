import React, { useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { TextInput as RNTextInput, TouchableOpacity } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
  DEFAULT_THEME,
} from "react-native-country-picker-modal";
import PhoneInput from "react-native-phone-input";
import Toast from "react-native-toast-message";

import Logo from "@/assets/images/logo.svg";
import KeyboardAvoidingView from "@/components/control/KeyboardAvoidingView";
import { ExternalLink } from "@/components/ExternalLink";
import {
  Button,
  PasswordInput,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "@/components/themed";
import {
  LoginInputType,
  LoginRequestType,
  TYPE_LOGIN_REQUEST,
} from "@/schema/auth";

import * as Sentry from "@sentry/react-native";
import * as Application from "expo-application";
import * as ImagePicker from "expo-image-picker";
import useSignIn from "@/hooks/useSignIn";
import { extractAxiosErrorData } from "@/util";
import { useNetInfo } from "@react-native-community/netinfo";
import { Link } from "expo-router";
import { LOG } from "@/util/logger";

export default function Login() {
  const { t } = useTranslation();
  const { signInMutation, loading } = useSignIn();
  const { isConnected } = useNetInfo();

  const [, setPhoneNumber] = useState("");

  const [activeTab, setActiveTab] = useState<TYPE_LOGIN_REQUEST>("phone");

  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>("PE");
  const [showPhoneCountryPicker, setShowPhoneCountryPicker] = useState(false);

  const phoneInput = useRef<PhoneInput>(null);

  const methods = useForm<LoginInputType>({});

  const refPassword = useRef<RNTextInput>(null);

  const authErrorCount = useRef(0);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = methods;

  const handleCountrySelect = (country: Country) => {
    setPhoneCountryCode(country.cca2);
    const newPhoneNumber = `+${country.callingCode[0]}`;
    setPhoneNumber(newPhoneNumber);
    setValue("phone", newPhoneNumber);
    if (phoneInput.current) {
      phoneInput.current.selectCountry(country.cca2.toLowerCase());
      phoneInput.current.setValue(newPhoneNumber);
    }
    setShowPhoneCountryPicker(false);
  };

  const onSubmitHandler: SubmitHandler<LoginInputType> = async (values) => {
    try {
      if (!isConnected) {
        Toast.show({
          type: "error",
          text1: t("login.error.noInternet"),
        });
        return;
      }

      let payload: LoginRequestType;

      if (activeTab === "username") {
        payload = {
          username: values.username,
          password: values.password,
          type: activeTab,
        };
      } else {
        payload = {
          phone: values.phone,
          password: values.password,
          type: activeTab,
        };
      }

      await signInMutation(payload);
      authErrorCount.current = 0;
      LOG.info(`Logged in with user: ${payload.username}`);
    } catch (error) {
      setError("username", { type: "manual" });
      setError("phone", { type: "manual" });
      setError("password", { type: "manual" });

      const errorData = extractAxiosErrorData(error);

      if (!errorData) {
        Toast.show({
          type: "error",
          text1: t("errorCodes.generic"),
        });
        return;
      }

      if (!errorData.errors.length) {
        Toast.show({
          type: "error",
          text1: t("login.error.invalidCredentials"),
        });
      }

      for (let error of errorData.errors) {
        if (
          activeTab === "username" &&
          error.error_code === 46 &&
          authErrorCount.current <= 3
        ) {
          authErrorCount.current += 1;

          if (authErrorCount.current === 1) {
            Toast.show({
              type: "error",
              props: {
                textNode: (
                  <Trans
                    i18nKey="login.error.suggestFirstLastName"
                    parent={Text}
                    components={{ strong: <Text className="font-bold" /> }}
                  />
                ),
              },
            });
            return;
          }

          if (authErrorCount.current === 2) {
            Toast.show({
              type: "error",
              props: {
                textNode: (
                  <Trans
                    i18nKey="login.error.suggestFirstLastNameYear"
                    parent={Text}
                    components={{ strong: <Text className="font-bold" /> }}
                  />
                ),
              },
            });
            return;
          }

          if (authErrorCount.current === 3) {
            Toast.show({
              type: "error",
              props: {
                textNode: (
                  <Trans
                    i18nKey="login.error.suggestFirstLastNameYearMonth"
                    parent={Text}
                    components={{ strong: <Text className="font-bold" /> }}
                  />
                ),
              },
            });
            return;
          }
        }

        Toast.show({
          type: "error",
          text1: t(`errorCodes.${error.error_code ?? "generic"}`),
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView className="flex-1 flex flex-col">
        <View className="flex flex-1 flex-col justify-center px-6">
          <View className="flex flex-col items-center mb-2">
            <Logo className="mb-4"></Logo>
            <Text className="text-3xl font-semibold mb-2">DengueChatPlus</Text>
          </View>
          <FormProvider {...methods}>
            <View className="flex-row border-b border-neutral-300 mb-4">
              <TouchableOpacity
                onPress={() => setActiveTab("phone")}
                className={`flex-1 items-center py-2 ${activeTab === "phone" ? "border-b-4 border-primary" : ""}`}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "phone" ? "text-primary" : "text-neutral-500"}`}
                >
                  {t("login.phone-tab")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("username")}
                className={`flex-1 items-center py-2 ${activeTab === "username" ? "border-b-4 border-primary" : ""}`}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "username" ? "text-primary" : "text-neutral-500"}`}
                >
                  {t("login.username-tab")}
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "username" && (
              <View>
                <Text className="font-medium text-sm mb-2">
                  {t("login.username")}
                </Text>

                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      hasError={!!errors.username}
                      placeholder={t("login.username_placeholder")}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      autoCapitalize="none"
                      textContentType="username"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => refPassword.current?.focus()}
                      blurOnSubmit={false}
                    />
                  )}
                  name="username"
                />
                {errors?.username?.message && (
                  <Text className="font-normal text-red-500 text-xs mb-2 mt-1">
                    {errors.username.message}
                  </Text>
                )}
              </View>
            )}

            {activeTab === "phone" && (
              <View>
                <Text className="font-medium text-sm mb-2">
                  {t("login.phone")}
                </Text>

                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onBlur, value } }) => (
                    <>
                      <View
                        className={`${!!errors.phone ? "border-red-500" : "border-neutral-200"} border p-2 rounded-md`}
                      >
                        <PhoneInput
                          ref={phoneInput}
                          textStyle={{
                            height: 26,
                            color: "black",
                          }}
                          initialValue={value}
                          onChangePhoneNumber={(phoneNumber) => {
                            setPhoneNumber(phoneNumber);
                            setValue("phone", phoneNumber);
                          }}
                          initialCountry={phoneCountryCode.toLowerCase()}
                          onPressFlag={() => setShowPhoneCountryPicker(true)}
                          textProps={{
                            onBlur,
                            placeholder: t("login.phone_placeholder"),
                          }}
                        />
                      </View>

                      <CountryPicker
                        preferredCountries={["PE", "PY", "BR"]}
                        withAlphaFilter
                        theme={DEFAULT_THEME}
                        countryCode={phoneCountryCode}
                        visible={showPhoneCountryPicker}
                        onSelect={handleCountrySelect}
                        filterProps={{
                          placeholder: t("login.searchCountry_placeholder"),
                          autoFocus: true,
                        }}
                        onClose={() => setShowPhoneCountryPicker(false)}
                        withFlagButton={false}
                        withFilter
                        withEmoji={false}
                      />
                    </>
                  )}
                />
                {errors?.phone?.message && (
                  <Text className="font-normal text-red-500 text-xs mb-2 mt-1">
                    {errors.phone.message}
                  </Text>
                )}
              </View>
            )}

            <View className="mb-4 mt-2">
              <Text className="font-medium text-sm mb-2">
                {t("login.password")}
              </Text>

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput
                    inputRef={refPassword}
                    hasError={!!errors.password}
                    placeholder={t("login.password_placeholder")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmitHandler)}
                  />
                )}
                name="password"
              />

              {errors?.password?.message && (
                <Text className="font-normal text-red-500 text-xs mb-2 mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <View className="mt-4 mb-6">
              <Text className="font-bold text-md color-primary">
                <ExternalLink
                  href={process.env.EXPO_PUBLIC_FORGOT_PASSWORD_URL!}
                >
                  {t("login.forgotPassword")}
                </ExternalLink>
              </Text>
            </View>

            <Button
              primary
              disabled={loading}
              className="mb-4"
              title={t("login.action")}
              onPress={handleSubmit(onSubmitHandler)}
            />

            <View className="flex flex-row items-center justify-center mt-4 mb-2">
              <Text className="mr-1">{t("login.registerMessage")}</Text>
              <Link href="/register">
                <Text className="font-bold text-md color-primary">
                  {t("login.register")}
                </Text>
              </Link>
            </View>
          </FormProvider>
        </View>
        <View className="p-4">
          <Button
            title="Throw JS error"
            onPress={() => {
              Sentry.captureException(new Error("Test error"));
            }}
          />
        </View>
        <View className="flex items-center py-2">
          <Text className="">{`v${Application.nativeApplicationVersion}`}</Text>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
