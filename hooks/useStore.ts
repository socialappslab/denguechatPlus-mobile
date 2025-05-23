import { ISelectableItem } from "@/components/QuestionnaireRenderer";
import { House, Question, VisitId } from "@/types";
import { VISITS_LOG } from "@/util/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
export type VisitCase = "house" | "orchard";

interface State {
  answerId: AnswerId;
  selectedCase: VisitCase;
  storedHouseList: House[];
  storedVisits: QuestionnaireState[];
  visitId: VisitId;
  visitMap: VisitMap;
  visitMetadata: VisitMetaMap;
}

interface Actions {
  cleanUpStoredVisit: (visit: any) => void;
  finaliseCurrentVisit: (
    isConnected: boolean,
    data: QuestionnaireState,
  ) => void;
  increaseCurrentVisitInspection: () => void;
  initialiseCurrentVisit: (visitId: VisitId, questionId: QuestionId) => void;
  saveHouseList: (houses: House[]) => void;
  setCurrentVisitData: (questionId: Question, data: AnswerState) => void;
  setSelectedCase: (visitCase: VisitCase) => void;
}

type Store = State & Actions;

export const useStore = create<Store>()(
  immer(
    persist(
      (set) => ({
        // Always set in "Select House", dumb value
        visitId: "" as VisitId,
        answerId: "" as AnswerId,
        visitMap: {},
        visitMetadata: {},
        selectedCase: "house",
        storedHouseList: [],
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
        initialiseCurrentVisit: (visitId, questionId) =>
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
        finaliseCurrentVisit: (isConnected, data) =>
          set((state) => {
            setAutoFreeze(false);
            if (!isConnected) {
              state.storedVisits = [...state.storedVisits, data];
              VISITS_LOG.info("Visit stored locally successfully");
            }
            // Cleanup
            state.visitMap[state.visitId] = {};
          }),
        /**
         * To be called when a visit has more than one container
         */
        increaseCurrentVisitInspection: () =>
          set((state: Store) => {
            ++state.visitMetadata[state.visitId].inspectionIdx;
          }),
        saveHouseList: (houses) =>
          set((state) => {
            state.storedHouseList = houses;
          }),
        cleanUpStoredVisit: (visit) =>
          set((state) => {
            const index = state.storedVisits.findIndex(
              (stored) => visit.visitedAt === stored.visitedAt,
            );
            state.storedVisits.splice(index, 1);
          }),
        setSelectedCase: (selectedCase) => set(() => ({ selectedCase })),
        /**
         * To be called on each saved
         * @param question the current question being rendered
         * @param data the answers saved by the form
         */
        setCurrentVisitData: (question, data) => {
          VISITS_LOG.debug(
            `Setting data for question "${question.question}" (id: ${question.id})`,
            data,
          );
          return set((state: Store) => {
            state.answerId =
              `${question.id}-${state.visitMetadata[state.visitId].inspectionIdx}` as AnswerId;
            state.visitMap[state.visitId][state.answerId] = data;
          });
        },
      }),
      { name: "visit-store", storage: createJSONStorage(() => AsyncStorage) },
    ),
  ),
);
