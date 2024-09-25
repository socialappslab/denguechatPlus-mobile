import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { FilterModal } from "@/components/screens/FilterModal";

export default function FilterWedge() {
  const { t } = useTranslation();
  const { filters, setFilter } = useBrigades();

  const router = useRouter();

  const onFilter = (itemSeleted?: BaseObject) => {
    setFilter({ wedge: itemSeleted });
    router.back();
  };

  return (
    <FilterModal
      onFilter={onFilter}
      endpoint="wedges"
      extraSearchParams={{ "filter[sector_id]": filters.sector?.id }}
      messageNoResults={t("config.noResults")}
      messageNoResultsOnSelection={t("config.noResultsWedges")}
    ></FilterModal>
  );
}
