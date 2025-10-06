import { useStore } from "./useStore";

export function useUserHasBrigade() {
  const userProfile = useStore((state) => state.userProfile);
  return Boolean(
    userProfile?.userProfile?.team && userProfile?.userProfile?.houseBlock,
  );
}
