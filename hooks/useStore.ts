import { ISelectableItem } from "@/components/QuestionnaireRenderer";
import { House, Question, Questionnaire, VisitId } from "@/types";
import { VISITS_LOG } from "@/util/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAutoFreeze } from "immer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface VisitMetadata {
  inspectionIdx: number;
}

export interface InspectionPhoto {
  filename: string;
  uri: string;
  visitId: VisitId;
  inspectionIdx: number;
  referenceCode: string;
}

type QuestionId = string;
type InspectionIdx = VisitMetadata["inspectionIdx"];

export type AnswerId = `${QuestionId}-${InspectionIdx}`;
export type AnswerState = ISelectableItem | ISelectableItem[];
export type QuestionnaireState = Record<QuestionId, AnswerState>;
export type VisitMap = Record<VisitId, QuestionnaireState>;
export type VisitMetaMap = Record<VisitId, VisitMetadata>;
export type VisitCase = "house" | "orchard";

interface State {
  selectedCase: VisitCase;
  storedHouseList: House[];
  storedVisits: QuestionnaireState[];
  visitId: VisitId;
  visitMap: VisitMap;
  visitMetadata: VisitMetaMap;
  inspectionPhotos: InspectionPhoto[];
  questionnaire: Questionnaire | null;
}

interface Actions {
  cleanUpStoredVisit: (visit: any) => void;
  finaliseCurrentVisit: (
    isConnected: boolean,
    data: QuestionnaireState,
  ) => void;
  increaseCurrentVisitInspection: () => void;
  initialiseCurrentVisit: (visitId: VisitId) => void;
  saveHouseList: (houses: House[]) => void;
  setCurrentVisitData: (
    answerId: AnswerId,
    question: Question,
    data: AnswerState,
  ) => void;
  setSelectedCase: (visitCase: VisitCase) => void;
}

type Store = State & Actions;

export const useStore = create<Store>()(
  immer(
    persist(
      (set) => ({
        // Always set in "Select House", dumb value
        visitId: "" as VisitId,
        visitMap: {},
        visitMetadata: {},
        inspectionPhotos: [],
        selectedCase: "house",
        storedHouseList: [],
        /**
         * All visits that were not published to the backed
         * will be saved in this array as QuestionnaireState
         * to be then formated, via prepareFormData
         */
        storedVisits: [],

        /**
         * The definition of the questionnaire. For now we only have the concept
         * of a single questionnaire for all visits.
         */
        questionnaire: null,

        /**
         * To be called when a house is selected, this method
         * initialises the visit
         * @param visitId generates visitId based on houseId and userId
         */
        initialiseCurrentVisit: (visitId) =>
          set(() => ({
            visitId,
            visitMetadata: {
              [visitId]: { inspectionIdx: 0 },
            },
            visitMap: {
              [visitId]: {},
            },
          })),
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
        setCurrentVisitData: (answerId, question, data) => {
          VISITS_LOG.debug(
            `Setting data for question "${question.question}" (id: ${question.id})`,
            data,
          );
          return set((state: Store) => {
            state.visitMap[state.visitId][answerId] = data;
          });
        },
      }),
      { name: "visit-store", storage: createJSONStorage(() => AsyncStorage) },
    ),
  ),
);

export const setQuestionnaire = (questionnaire: Questionnaire | null) =>
  useStore.setState(() => ({ questionnaire }));

export const setInspectionPhotos = (inspectionPhotos: InspectionPhoto[]) =>
  useStore.setState(() => ({ inspectionPhotos }));

export const setInspectionPhoto = (inspectionPhoto: InspectionPhoto) =>
  useStore.setState((state) => {
    state.inspectionPhotos.push(inspectionPhoto);
  });
