import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { FilterModal } from "@/components/screens/FilterModal";

export default function SelectHouseBlock() {
  const { t } = useTranslation();
  const { selection, setSelection } = useBrigades();

  const router = useRouter();

  const onFilter = (itemSeleted?: BaseObject) => {
    setSelection({ newHouseBlock: itemSeleted });
    router.back();
  };

  return (
    <FilterModal
      onFilter={onFilter}
      endpoint="house_blocks"
      extraSearchParams={{ "filter[team_id]": selection?.newBrigade?.id }}
      messageNoResults={t("config.noResults")}
      messageNoResultsOnSelection={t("config.noResultsHouseBlock")}
    ></FilterModal>
  );
}
