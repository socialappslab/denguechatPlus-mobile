import { TextInput as RNTextInput } from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import CountryPicker, {
  CountryCode,
  DEFAULT_THEME,
} from "react-native-country-picker-modal";
import PhoneInput from "react-native-phone-input";

import LogoImage from "@/assets/images/logo.svg";
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "@/components/themed";
import {
  PasswordInput,
  PickerInput,
  TextInput,
} from "@/components/react-hook-form";
import { publicApi } from "@/config/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiResponseCollection, Wedge } from "@/schema";
import { useRouter } from "expo-router";
import { extractAxiosErrorData } from "@/util";
import Toast from "react-native-toast-message";

interface City {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

interface Neighborhood {
  id: string;
  type: string;
  attributes: {
    name: string;
    wedges: Wedge[] | null;
  };
}

interface Organization {
  id: string;
  type: string;
  attributes: {
    name: string;
    createdAt: string;
    status: boolean;
  };
}

function useValidationSchema() {
  const { t } = useTranslation();

  const excludeNull = useCallback(
    <T,>(value: T, ctx: z.RefinementCtx) => {
      if (value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.required"),
        });
        return z.NEVER;
      }
      return value;
    },
    [t],
  );

  return useMemo(
    () =>
      z
        .object({
          firstName: z.string().trim().min(1, t("validation.required")),
          lastName: z.string().trim().min(1, t("validation.required")),
          username: z
            .string()
            .trim()
            .min(4, t("validation.usernameLength", { length: 4 })),
          phone: z.string().min(1, t("validation.required")),
          country: z.string().min(1, t("validation.required")),
          email: z.string().trim().email().optional().or(z.literal("")),
          password: z
            .string()
            .min(1, t("validation.required"))
            .min(6, t("validation.passwordLength", { length: 6 })),
          passwordConfirm: z.string().min(1, t("validation.required")),
          city: z
            .string()
            .min(1, t("validation.required"))
            .nullable()
            .transform(excludeNull),
          neighborhood: z
            .string()
            .min(1, t("validation.required"))
            .nullable()
            .transform(excludeNull),
          organization: z
            .string()
            .min(1, t("validation.required"))
            .nullable()
            .transform(excludeNull),
        })
        .refine((data) => data.password === data.passwordConfirm, {
          path: ["passwordConfirm"],
          message: t("validation.notMatch"),
        }),
    [t, excludeNull],
  );
}

type SchemaInput = z.input<ReturnType<typeof useValidationSchema>>;
type SchemaOutput = z.output<ReturnType<typeof useValidationSchema>>;

function useCitiesQuery() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const params = new URLSearchParams({
        "page[number]": "1",
        "page[size]": "1000",
      }).toString();

      return (await publicApi.get(`/public/cities?${params}`))
        .data as ApiResponseCollection<City>;
    },
  });
}

function useNeighborhoodsQuery(cityId: string | null) {
  return useQuery({
    enabled: !!cityId,
    queryKey: ["neighborhoods", cityId!],
    queryFn: async () => {
      const params = new URLSearchParams({
        "filter[city_id]": cityId!,
        "page[number]": "1",
        "page[size]": "1000",
      }).toString();

      return (await publicApi.get(`/public/neighborhoods?${params}`))
        .data as ApiResponseCollection<Neighborhood>;
    },
  });
}

function useOrganizationsQuery() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const params = new URLSearchParams({
        "page[number]": "1",
        "page[size]": "1000",
        sort: "name",
      }).toString();

      return (await publicApi.get(`/public/organizations?${params}`))
        .data as ApiResponseCollection<Organization>;
    },
  });
}

interface CreateAccountPayload {
  phone: string;
  password: string;
  username: string;
  userProfile: {
    firstName: string;
    lastName: string;
    email?: string;
    country: string;
    organizationId: number;
    cityId: number;
    neighborhoodId: number;
    timezone: string;
    language: string;
  };
}

function useCreateAccountMutation() {
  return useMutation({
    mutationFn: (data: CreateAccountPayload) => {
      return publicApi.post("users/accounts", data);
    },
  });
}

const DEFAULT_COUNTRY_CODE: CountryCode = "PE";

export default function Register() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const schema = useValidationSchema();
  const {
    control,
    formState: { errors, isValid },
    getValues,
    handleSubmit,
    setError,
    setValue,
    watch,
  } = useForm<SchemaInput, unknown, SchemaOutput>({
    mode: "onBlur",
    resolver: zodResolver<SchemaInput>(schema),
    defaultValues: {
      city: null,
      neighborhood: null,
      organization: null,
    },
  });

  const city = watch("city");

  const cities = useCitiesQuery();
  const neighborhoods = useNeighborhoodsQuery(city);
  const organizations = useOrganizationsQuery();
  const createAccount = useCreateAccountMutation();

  const [showPhoneCountryPicker, setShowPhoneCountryPicker] = useState(false);

  const cityOptions = useMemo(() => {
    return (
      cities.data?.data?.map((item) => ({
        value: item.id,
        label: item.attributes.name,
      })) ?? []
    );
  }, [cities.data]);

  const neighborhoodOptions = useMemo(
    () =>
      neighborhoods.data?.data?.map((item) => ({
        value: item.id,
        label: item.attributes.name,
      })) ?? [],
    [neighborhoods.data],
  );

  const organizationOptions = useMemo(
    () =>
      organizations.data?.data?.map((item) => ({
        value: item.id,
        label: item.attributes.name,
      })) ?? [],
    [organizations.data],
  );

  const firstNameRef = useRef<RNTextInput>(null);
  const lastNameRef = useRef<RNTextInput>(null);
  const usernameRef = useRef<RNTextInput>(null);
  const phoneRef = useRef<PhoneInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const passwordConfirmRef = useRef<RNTextInput>(null);

  const usernameErrorCounter = useRef(0);

  const onSubmitHandler = handleSubmit(async (data) => {
    try {
      const payload = {
        phone: data.phone,
        password: data.password,
        username: data.username,
        userProfile: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          country: data.country.toUpperCase(),
          organizationId: Number(data.organization),
          cityId: Number(data.city),
          neighborhoodId: Number(data.neighborhood),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: i18n.language,
        },
      };

      await createAccount.mutateAsync(payload);
      router.replace("/register-success");
    } catch (error) {
      const errorData = extractAxiosErrorData(error);

      if (!errorData || !errorData.errors || errorData.errors.length === 0) {
        Toast.show({
          type: "error",
          text1: t("errorCodes.generic"),
        });
        return;
      }

      errorData.errors.forEach((error) => {
        // @ts-expect-error `error.field` is string but it expects an union
        const fieldValue = getValues(error.field);

        if (error.field && fieldValue) {
          if (error.error_code === 48 && usernameErrorCounter.current <= 3) {
            usernameErrorCounter.current += 1;

            if (usernameErrorCounter.current === 1) {
              // @ts-expect-error `error.field` is string but it expects an union
              setError(error.field, {
                type: "manual",
                message: t("register.error.suggestFirstLastName", {
                  field: fieldValue,
                }),
              });
              return;
            }

            if (usernameErrorCounter.current === 2) {
              // @ts-expect-error `error.field` is string but it expects an union
              setError(error.field, {
                type: "manual",
                message: t("register.error.suggestFirstLastNameYear", {
                  field: fieldValue,
                }),
              });
              return;
            }

            if (usernameErrorCounter.current === 3) {
              // @ts-expect-error `error.field` is string but it expects an union
              setError(error.field, {
                type: "manual",
                message: t("register.error.suggestFirstLastNameYearMonth", {
                  field: fieldValue,
                }),
              });
              return;
            }
          }

          // @ts-expect-error `error.field` is string but it expects an union
          setError(error.field, {
            type: "manual",
            message: t(`errorCodes.${error.error_code ?? "genericField"}`, {
              field: fieldValue,
            }),
          });
        } else {
          Toast.show({
            type: "error",
            text1: t(`errorCodes.${error.error_code ?? "generic"}`),
          });
        }
      });
    }
  });

  return (
    <SafeAreaView>
      <ScrollView
        className="px-6"
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
      >
        <View className="items-center">
          <LogoImage className="mb-4" />
          <Text className="text-3xl font-semibold">{t("register.title")}</Text>
        </View>

        <View className="space-y-4 mt-6">
          <Text className="font-normal text-xs">
            {t("visit.newHouse.requiredFields")}
          </Text>
          {/* TODO: Cannot use `space-y-4` directly and must wrap in a View
            first. Fix that in the component itself. */}
          <View>
            <TextInput
              inputRef={firstNameRef}
              control={control}
              name="firstName"
              label={t("register.firstName")}
              returnKeyType="next"
              onSubmitEditing={() => {
                lastNameRef.current?.focus();
              }}
              blurOnSubmit={false}
              required
            />
          </View>

          <View>
            <TextInput
              inputRef={lastNameRef}
              control={control}
              name="lastName"
              label={t("register.lastName")}
              returnKeyType="next"
              onSubmitEditing={() => {
                usernameRef.current?.focus();
              }}
              blurOnSubmit={false}
              required
            />
          </View>

          <View>
            <TextInput
              inputRef={usernameRef}
              control={control}
              name="username"
              label={t("login.username")}
              returnKeyType="next"
              onSubmitEditing={() => {
                phoneRef.current?.focus();
              }}
              blurOnSubmit={false}
              required
              autoCapitalize="none"
            />
          </View>

          <View>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <View>
                  <Text className="font-medium text-sm mb-2">
                    {t("login.phone")} *
                  </Text>

                  <View
                    className={`${!!errors.phone ? "border-red-500" : "border-neutral-200"} border p-2 rounded-md`}
                  >
                    <PhoneInput
                      ref={phoneRef}
                      textStyle={{
                        height: 26,
                        color: "black",
                      }}
                      onChangePhoneNumber={(number, country) => {
                        field.onChange(number);
                        setValue("country", country);
                      }}
                      initialCountry={DEFAULT_COUNTRY_CODE.toLowerCase()}
                      onPressFlag={() => setShowPhoneCountryPicker(true)}
                      textProps={{
                        onBlur: field.onBlur,
                        placeholder: t("login.phone_placeholder"),
                        returnKeyType: "next",
                        onSubmitEditing: () => {
                          emailRef.current?.focus();
                        },
                        blurOnSubmit: false,
                      }}
                    />
                  </View>

                  {errors.phone?.message && (
                    <Text className="text-red-500 text-xs mt-1">
                      {t(errors.phone.message)}
                    </Text>
                  )}

                  <CountryPicker
                    preferredCountries={["PE", "PY", "BR"]}
                    withAlphaFilter
                    theme={DEFAULT_THEME}
                    countryCode={DEFAULT_COUNTRY_CODE}
                    visible={showPhoneCountryPicker}
                    onSelect={(country) => {
                      phoneRef.current!.selectCountry(
                        country.cca2.toLowerCase(),
                      );
                    }}
                    filterProps={{
                      placeholder: t("login.searchCountry_placeholder"),
                      autoFocus: true,
                    }}
                    onClose={() => setShowPhoneCountryPicker(false)}
                    withFlagButton={false}
                    withFilter
                    withEmoji={false}
                  />
                </View>
              )}
            />
          </View>

          <View>
            <TextInput
              inputRef={emailRef}
              control={control}
              name="email"
              label={t("register.email")}
              inputMode="email"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordRef.current?.focus();
              }}
              blurOnSubmit={false}
              autoCapitalize="none"
            />
          </View>

          <View>
            <PasswordInput
              inputRef={passwordRef}
              control={control}
              name="password"
              label={t("login.password")}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordConfirmRef.current?.focus();
              }}
              blurOnSubmit={false}
              required
              helperText={t("register.passwordHelperText")}
            />
          </View>

          <View>
            <PasswordInput
              inputRef={passwordConfirmRef}
              control={control}
              name="passwordConfirm"
              label={t("register.confirmPassword")}
              required
            />
          </View>

          <View>
            <PickerInput
              control={control}
              name="city"
              options={cityOptions}
              label={t("register.city")}
              required
            />
          </View>

          <View>
            <PickerInput
              control={control}
              name="neighborhood"
              options={neighborhoodOptions}
              label={t("register.sector")}
              required
              disabled={!city}
            />
          </View>

          <View>
            <PickerInput
              control={control}
              name="organization"
              options={organizationOptions}
              label={t("register.organization")}
              required
            />
          </View>

          <Button
            primary
            title={t("register.signUp")}
            onPress={() => {
              onSubmitHandler();
            }}
            disabled={!isValid || createAccount.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
