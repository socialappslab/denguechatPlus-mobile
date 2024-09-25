import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { FilterModal } from "@/components/screens/FilterModal";

export default function FilterBrigade() {
  const { t } = useTranslation();
  const { setFilter } = useBrigades();

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
