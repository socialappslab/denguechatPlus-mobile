import { useQuery } from "@tanstack/react-query";
import { CaseType, deserialize } from "jsonapi-fractal";
import { useTranslation } from "react-i18next";

import { axios } from "@/config/axios";
import { useStore } from "@/hooks/useStore";
import { MyVisit, Option, StatusColor } from "@/types";

const RECENT_LIMIT = 5;

interface MyVisitsMeta {
  lastMonthCount: number;
  previousMonthCount: number;
}

function useServerVisits() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ["profile", "myVisits", i18n.language],
    queryFn: async () => {
      const response = await axios.get("/visits/mine", {
        params: { limit: RECENT_LIMIT, language: i18n.language },
      });
      const visits = deserialize<MyVisit[]>(response.data, {
        changeCase: CaseType.camelCase,
      }) as MyVisit[];
      return { visits, meta: response.data.meta as MyVisitsMeta };
    },
  });
}

const STATUS_BY_COLOR: Record<StatusColor, MyVisit["status"]> = {
  [StatusColor.NotInfected]: "green",
  [StatusColor.PotentionallyInfected]: "yellow",
  [StatusColor.Infected]: "red",
};

// Visits saved on the device that still wait to be synced, in the same shape as the server ones.
function useOfflineVisits(): MyVisit[] {
  const storedVisits = useStore((state) => state.storedVisits);
  const questionnaire = useStore((state) => state.questionnaire);
  const options = (questionnaire?.questions ?? []).flatMap(
    (question) => (question.options ?? []) as (Option & { value?: string })[],
  );

  return storedVisits.map((stored, index) => {
    // Stored visits are the raw payload plus display fields added in the summary screen.
    const visit = stored as unknown as {
      visitedAt: string;
      house?: { referenceCode?: string };
      statusColor?: StatusColor;
      visitPermissionOptionId?: number;
      visitPermissionOther?: string;
    };
    const option = options.find(
      (item) => item.id === visit.visitPermissionOptionId,
    );
    return {
      id: `offline-${index}`,
      visitedAt: new Date(visit.visitedAt).toISOString(),
      status: visit.statusColor ? STATUS_BY_COLOR[visit.statusColor] : null,
      houseReferenceCode: visit.house?.referenceCode ?? "",
      permissionGranted: Number(option?.value) === 1,
      permissionLabel: option?.name ?? visit.visitPermissionOther ?? null,
      offline: true,
    };
  });
}

export function useMyVisitsQuery() {
  const server = useServerVisits();
  const offline = useOfflineVisits();

  const recent = [...offline, ...(server.data?.visits ?? [])]
    .sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt))
    .slice(0, RECENT_LIMIT);

  return {
    recent,
    meta: server.data?.meta,
    offlineCount: offline.length,
    isLoading: server.isLoading,
    isError: server.isError,
    refetch: server.refetch,
  };
}
