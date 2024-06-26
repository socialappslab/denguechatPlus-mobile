import React, { useState } from "react";
import { Text, View, TextInput } from "@/components/themed";
import { Alert, SafeAreaView } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthProvider";
import Logo from "@/assets/images/logo.svg";
import { PasswordInput } from "@/components/themed/PasswordInput";
import KeyboardAvoidingView from "@/components/control/KeyboardAvoidingView";
import { ExternalLink } from "@/components/ExternalLink";
import Button from "@/components/themed/Button";

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const _login = (username: string, password: string) => {
    if (username === "" || password === "")
      Alert.alert(t("error"), t("login.error.empty"));
    else login(username, password);
  };

  // TODO: Add loading state and formik
  return (
    <KeyboardAvoidingView>
      <SafeAreaView className="flex-1 flex flex-col">
        <View className="flex flex-1 flex-col justify-center px-6">
          <View className="flex flex-col items-center mb-2">
            <Logo className="mb-4"></Logo>
            <Text className="text-3xl font-semibold mb-2">DengueChat+</Text>
          </View>

          <View className="mb-4">
            <Text className="font-medium text-sm mb-2">{t("login.email")}</Text>
            <TextInput
              placeholder={t("login.email_placeholder")}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium text-sm mb-2">
              {t("login.password")}
            </Text>
            <PasswordInput
              placeholder={t("login.password_placeholder")}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <ExternalLink
            className="mt-4 mb-6"
            href="https://www.denguechat.org/"
          >
            <Text className="font-bold text-md color-primary">
              {t("login.forgotPassword")}
            </Text>
          </ExternalLink>

          <Button
            className="mb-4"
            title={t("login.action")}
            onPress={() => _login(username, password)}
          />

          <View className="flex flex-row items-center justify-center mt-4 mb-2">
            <Text className="mr-1">{t("login.registerMessage")}</Text>
            <ExternalLink
              className="items-center justify-center"
              href="https://www.denguechat.org/"
            >
              <Text className="font-bold text-md color-primary">
                {t("login.register")}
              </Text>
            </ExternalLink>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
