import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CaseType, deserialize } from "jsonapi-fractal";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import { axios } from "@/config/axios";
import { useStore } from "@/hooks/useStore";
import { AvatarOption } from "@/types";

export function useAvatarsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["avatars"],
    queryFn: async () => {
      const response = await axios.get("/avatars");
      return deserialize<AvatarOption[]>(response.data, {
        changeCase: CaseType.camelCase,
      }) as AvatarOption[];
    },
  });
}

interface ChangeAvatarPayload {
  avatarId: number;
  equippedRewardLevelId?: number | null;
}

export function useChangeAvatar() {
  const { t } = useTranslation();
  const fetchUserProfile = useStore((state) => state.fetchUserProfile);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeAvatarPayload) =>
      axios.put("/users/change_avatar", payload),
    onSuccess: async () => {
      await fetchUserProfile();
      // My Brigade lists members with their avatars.
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () =>
      Toast.show({ type: "error", text1: t("brigadistProfile.avatar.error") }),
  });
}
