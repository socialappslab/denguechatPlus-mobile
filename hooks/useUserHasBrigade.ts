import { useAuth } from "@/context/AuthProvider";

export function useUserHasBrigade() {
  const { meData } = useAuth();
  return Boolean(meData?.userProfile?.team && meData?.userProfile?.houseBlock);
}
