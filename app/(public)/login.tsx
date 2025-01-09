import React, { useRef, useState } from "react";
import { TouchableOpacity, TextInput as RNTextInput } from "react-native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import CountryPicker, {
  CountryCode,
  DARK_THEME,
  DEFAULT_THEME,
} from "react-native-country-picker-modal";
import PhoneInput from "react-native-phone-input";
import {
  useForm,
  Controller,
  SubmitHandler,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Text, View, TextInput } from "@/components/themed";
import Logo from "@/assets/images/logo.svg";
import { PasswordInput, SafeAreaView, Button } from "@/components/themed";
import KeyboardAvoidingView from "@/components/control/KeyboardAvoidingView";
import { ExternalLink } from "@/components/ExternalLink";
import { useColorScheme } from "@/components/themed/useColorScheme";
import {
  createLoginSchema,
  LoginInputType,
  LoginRequestType,
  TYPE_LOGIN_REQUEST,
} from "@/schema/auth";

import useSignIn from "@/hooks/useSignIn";
import { extractAxiosErrorData } from "@/util";

export default function Login() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { signInMutation, loading } = useSignIn();

  const [, setPhoneNumber] = useState("");

  const [activeTab, setActiveTab] = useState<TYPE_LOGIN_REQUEST>("username");

  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>("PE");
  const [showPhoneCountryPicker, setShowPhoneCountryPicker] = useState(false);

  const phoneInput = useRef<PhoneInput>(null);

  const methods = useForm<LoginInputType>({});

  const refPassword = useRef<RNTextInput>(null);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isValid },
  } = methods;

  const handleCountrySelect = (country: any) => {
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
    } catch (error) {
      const errorData = extractAxiosErrorData(error);
      // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
      errorData?.errors?.forEach((error: any) => {
        Toast.show({
          type: "error",
          text1: t(`errorCodes.${error.error_code || "generic"}`),
        });
      });

      if (!errorData?.errors || errorData?.errors.length === 0) {
        Toast.show({
          type: "error",
          text1: t("login.error.invalidCredentials"),
        });
      }

      setError("username", {
        type: "manual",
        message: "",
      });
      setError("phone", {
        type: "manual",
        message: "",
      });
      setError("password", {
        type: "manual",
        message: "",
      });
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
                onPress={() => setActiveTab("username")}
                className={`flex-1 items-center py-2 ${activeTab === "username" ? "border-b-4 border-primary" : ""}`}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "username" ? "text-primary" : "text-neutral-500"}`}
                >
                  {t("login.username-tab")}
                </Text>
              </TouchableOpacity>
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
            </View>

            <View
              style={{ display: activeTab === "username" ? "flex" : "none" }}
            >
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

            <View style={{ display: activeTab === "phone" ? "flex" : "none" }}>
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
                          color: colorScheme === "dark" ? "white" : "black",
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
                      theme={
                        colorScheme === "dark" ? DARK_THEME : DEFAULT_THEME
                      }
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
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={() => refPassword.current?.blur()}
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
                <ExternalLink href="https://denguechatplus.org/reset-password">
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
              <ExternalLink
                className="items-center justify-center"
                href={`${process.env.EXPO_PUBLIC_REGISTER_URL}`}
              >
                <Text className="font-bold text-md color-primary">
                  {t("login.register")}
                </Text>
              </ExternalLink>
            </View>
          </FormProvider>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
