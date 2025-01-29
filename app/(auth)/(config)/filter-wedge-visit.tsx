// this view is a duplicate of filter-brigade
// but it uses "useFilters" so we have different context in "Visits" and "Assign Brigades" views
// this can be done in one context with a map, but for now we do it like this
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { FilterModal } from "@/components/screens/FilterModal";
import { useFilters } from "@/hooks/useFilters";
import { BaseObject } from "@/schema";

export default function FilterWedge() {
  const { t } = useTranslation();
  const { filters, setFilter } = useFilters();

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
