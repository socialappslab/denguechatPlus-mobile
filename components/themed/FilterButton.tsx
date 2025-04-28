import Filter from "@/assets/images/icons/filter.svg";
import { ThemeProps } from "@/components/themed/useThemeColor";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface FilterButtonProps extends ThemeProps, TouchableOpacityProps {
  filters: number;
}

export function FilterButton(props: FilterButtonProps) {
  const { style, filters, disabled, lightColor, darkColor, ...otherProps } =
    props;
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={style}
      {...otherProps}
      disabled={disabled}
      className={`flex flex-row items-center ${disabled ? "opacity-50" : ""} border-solid border bg-white border-gray-500 p-2 h-11 rounded-lg`}
    >
      <Filter className="mr-2" />
      {filters === 0 && (
        <Text className={`text-center font-semibold text-sky-400`}>
          {t("config.filter")}
        </Text>
      )}
      {filters >= 1 && (
        <Text className={`text-center font-bold text-sky-400`}>
          {`${filters} `}
          {filters > 1 ? t("config.filterPlural") : t("config.filterSingular")}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default FilterButton;
