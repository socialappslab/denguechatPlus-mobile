import { ISelectableItem } from "@/components/QuestionnaireRenderer";
import { VisitId } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NetworkState } from "expo-network";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type QuestionId = string;
type InspectionIdx = number;
type AnswerId = `${QuestionId}-${InspectionIdx}`;

interface VisitMetadata {
  inspectionIdx: number;
}

export type AnswerState = ISelectableItem | ISelectableItem[];
export type QuestionnaireState = Record<QuestionId, AnswerState>;
export type VisitMap = Record<VisitId, QuestionnaireState>;
export type VisitMetaMap = Record<VisitId, VisitMetadata>;

interface VisitStore {
  // Set only once in select-house
  visitId: VisitId;
  answerId: AnswerId;
  visitMap: VisitMap;
  visitMetadata: VisitMetaMap;
  storedVisits: QuestionnaireState[];
  setCurrentVisitData: (
    questionId: QuestionId,
    data: ISelectableItem | ISelectableItem[],
  ) => void;
  increaseCurrentVisitInspection: () => void;
  initialiseCurrentVisit: (visitId: VisitId, questionId: QuestionId) => void;
  finaliseCurrentVisit: (isOffline: boolean, data: any) => void;
  networkState?: NetworkState;
  setNetworkState: (state: NetworkState) => void;
}

export const useVisitStore = create<VisitStore>()(
  immer(
    persist(
      devtools((set) => ({
        // Always set in "Select House", dumb value
        visitId: "" as VisitId,
        answerId: "" as AnswerId,
        visitMap: {},
        visitMetadata: {},
        /**
         * All visits that were not published to the backed
         * will be save in this array as QuestionnaireState
         * to be then formmated, via prepareFormData
         */
        storedVisits: [],
        /**
         * To be called when a house is selected, this method
         * initialises the visit
         * @param visitId generates visitId based on houseId and userId
         * @param questionId init questionId
         */
        initialiseCurrentVisit: (visitId: VisitId, questionId: QuestionId) =>
          set(() => {
            const inspectionIdx = 0;
            return {
              visitId,
              answerId: `${questionId}-${inspectionIdx}`,
              visitMetadata: {
                [visitId]: { inspectionIdx },
              },
              visitMap: {
                [visitId]: {},
              },
            };
          }),
        /**
         * To be called when a visit is finalised
         * this will save offline visits and clean the current store
         */
        finaliseCurrentVisit: (isOffline, data: any) =>
          set((state) => {
            // Store QuestionnaireState
            if (isOffline) state.storedVisits = [...state.storedVisits, data];
            // Cleanup
            state.visitMap[state.visitId] = {};
          }),
        /**
         * To be called when a visit has more than one container
         */
        increaseCurrentVisitInspection: () =>
          set((state: VisitStore) => {
            ++state.visitMetadata[state.visitId].inspectionIdx;
          }),
        setNetworkState: (networkState) => set((state) => ({ networkState })),
        /**
         * To be called on each saved
         * @param questionId the current question being rendered
         * @param data the answers saved by the form
         */
        setCurrentVisitData: (questionId: QuestionId, data: AnswerState) =>
          set((state: VisitStore) => {
            state.answerId =
              `${questionId}-${state.visitMetadata[state.visitId].inspectionIdx}` as AnswerId;
            state.visitMap[state.visitId][state.answerId] = data;
          }),
      })),
      { name: "visit-store", storage: createJSONStorage(() => AsyncStorage) },
    ),
  ),
);
