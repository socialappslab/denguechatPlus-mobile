import { HouseBlockType } from "@/types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useHouseBlockLabel(type?: HouseBlockType) {
  const { t } = useTranslation();

  const houseBlockTypeToLabel: Record<HouseBlockType, string> = useMemo(
    () => ({
      [HouseBlockType.FrenteAFrente]: "Frente a Frente",
      [HouseBlockType.Block]: t("config.block"),
    }),
    [t],
  );

  if (!type) return t("houseGroup");

  return houseBlockTypeToLabel[type] ?? t("houseGroup");
}
