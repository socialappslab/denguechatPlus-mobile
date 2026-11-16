import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { axios } from "@/config/axios";
import { RewardLevel } from "@/types";
import { useStore } from "./useStore";

type Inbox = {
  rewards: RewardLevel[];
  acknowledged: number[];
  pending: number[];
};
interface State {
  accounts: Record<string, Inbox>;
  receive: (account: string, rewards: RewardLevel[]) => void;
  open: (account: string) => void;
  flush: (account: string) => Promise<void>;
}
export const useRewardNotifications = create<State>()(
  persist(
    (set, get) => ({
      accounts: {},
      receive: (account, rewards) =>
        set((state) => {
          const inbox = state.accounts[account] ?? {
            rewards: [],
            acknowledged: [],
            pending: [],
          };
          const all = new Map(
            inbox.rewards.map((reward) => [reward.userRewardId, reward]),
          );
          for (const reward of rewards) {
            if (
              reward.new &&
              reward.userRewardId &&
              !inbox.acknowledged.includes(reward.userRewardId)
            )
              all.set(reward.userRewardId, reward);
          }
          return {
            accounts: {
              ...state.accounts,
              [account]: { ...inbox, rewards: [...all.values()] },
            },
          };
        }),
      open: (account) => {
        set((state) => {
          const inbox = state.accounts[account];
          if (!inbox) return state;
          const ids = inbox.rewards.flatMap((reward) =>
            reward.userRewardId ? [reward.userRewardId] : [],
          );
          return {
            accounts: {
              ...state.accounts,
              [account]: {
                rewards: [],
                acknowledged: [...new Set([...inbox.acknowledged, ...ids])],
                pending: [...new Set([...inbox.pending, ...ids])],
              },
            },
          };
        });
        void get().flush(account);
      },
      flush: async (account) => {
        const ids = get().accounts[account]?.pending ?? [];
        if (!ids.length || String(useStore.getState().user?.id) !== account)
          return;
        try {
          await axios.post("users/acknowledge_rewards", { ids });
          set((state) => {
            const inbox = state.accounts[account];
            return {
              accounts: {
                ...state.accounts,
                [account]: {
                  ...inbox,
                  pending: inbox.pending.filter((id) => !ids.includes(id)),
                },
              },
            };
          });
        } catch {
          /* Offline acknowledgements remain queued. */
        }
      },
    }),
    {
      name: "reward-notifications",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
