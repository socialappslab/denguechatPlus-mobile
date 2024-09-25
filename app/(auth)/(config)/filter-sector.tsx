import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { FilterModal } from "@/components/screens/FilterModal";

export default function FilterSector() {
  const { t } = useTranslation();
  const { setFilter } = useBrigades();

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
