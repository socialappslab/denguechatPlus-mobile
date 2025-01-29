import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { FilterModal } from "@/components/screens/FilterModal";
import { useFilters } from "@/hooks/useFilters";
import { BaseObject } from "@/schema";

export default function FilterBrigade() {
  const { t } = useTranslation();
  const { setFilter } = useFilters();

  const router = useRouter();

  const onFilter = (itemSeleted?: BaseObject) => {
    setFilter({ team: itemSeleted });
    router.back();
  };

  return (
    <FilterModal
      onFilter={onFilter}
      endpoint="teams"
      messageNoResults={t("config.noResults")}
    ></FilterModal>
  );
}
