import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { FilterModal } from "@/components/screens/FilterModal";
import { useFilters } from "@/hooks/useFilters";
import { BaseObject } from "@/schema";

export default function FilterSector() {
  const { t } = useTranslation();
  const { setFilter } = useFilters();

  const router = useRouter();

  const onFilter = (itemSeleted?: BaseObject) => {
    setFilter({ sector: itemSeleted, wedge: undefined });
    router.back();
  };

  return (
    <FilterModal
      onFilter={onFilter}
      endpoint="neighborhoods"
      messageNoResults={t("config.noResults")}
    ></FilterModal>
  );
}
