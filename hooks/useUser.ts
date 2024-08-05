import { USER_LOCAL_STORAGE_KEY } from "../constants/Keys";
import { useStorageState } from "./useStorageState";

export default function useUser() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [[loading, user], setUser] = useStorageState(USER_LOCAL_STORAGE_KEY);
  if (!loading && user && user[0] && user[1]) {
    try {
      return JSON.parse(user[1]);
    } catch (e) {
      return null;
    }
  }
  return [user, setUser];
}
