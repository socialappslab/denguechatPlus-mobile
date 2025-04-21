import { ISelectableItem } from "@/components/QuestionnaireRenderer";
import { VisitCase } from "@/hooks/useVisitStore";
import { PostVisibility } from "@/schema";
export * from "./prepareFormData";

// <Questionnaire types>
export type TypeField = "text" | "multiple" | "list" | "splash";

export interface Questionnaire {
  id: string;
  name: number;
  createdAt: Date;
  initialQuestion: number;
  finalQuestion: number;
  questions: Question[];
}

export interface Question {
  id: number;
  question: string;
  typeField: TypeField;
  options?: Option[];
  description?: string;
  notes?: string;
  next?: number;
  image?: Image;
  required?: boolean;
}

export type ResourceType = "attribute" | "relation";
export interface InspectionQuestion extends Question {
  resourceName?: string;
  resourceType?: ResourceType;
}

export type OptionType = "inputNumber" | "textArea" | "boolean";

export interface Option {
  id: number;
  name: string;
  required?: boolean;
  textArea?: boolean;
  next?: number;
  image?: { url: string };
  value?: string;
  resourceId: string;
  optionType: OptionType;
  group: string;
  statusColor?: string;
  disableOtherOptions?: boolean;
  selectedCase?: VisitCase;
  showInCase?: VisitCase;
  weightedPoints: number | null;
}

export interface Image {
  id: number;
  url: string;
}

export interface Inspection {
  breeding_site_type_id: number;
  elimination_method_type_id: number;
  other_elimination_method: string;
  water_source_type_id?: number;
  code_reference?: string;
  has_water: boolean;
  water_source_other?: string;
  was_chemically_treated: string;
  container_test_result?: string;
  container_protection_ids: number[];
  other_protection?: string;
  type_content_id?: number[];
  quantity_founded: number;
  // tracking_type_required?: string;
  visited_at?: string;
  photo_id?: string;
  site_type?: string;
  status_color?: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface State {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Neighborhood {
  id: number;
  name: string;
}

export interface Wedge {
  id: number;
  name: string;
}

export interface HouseBlock {
  id: number;
  name: string;
}

export interface CreatedBy {
  id: number;
  name: string;
  last_name: string;
}
export interface SpecialPlace {
  id: number;
  name: string;
}

export interface House {
  id: number;
  discardedAt?: string | null;
  referenceCode: string;
  houseType: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  consecutiveGreenStatus: number;
  notes?: string | null;
  status?: string | null;
  containerCount?: number | null;
  createdAt: string;
  lastVisit?: string | null;
  updatedAt: string;
  country?: Country;
  state?: State;
  city?: City;
  neighborhood?: Neighborhood;
  wedge?: Wedge;
  houseBlock?: HouseBlock;
  specialPlace?: SpecialPlace | null;
  createdBy?: CreatedBy;
  houseBlockId?: number;
  specialPlaceId?: number;
}

type QuestionId = string;
export type FormState = Record<QuestionId, ISelectableItem | ISelectableItem[]>;

interface VisitAttributes {
  host: string[];
  visitPermission: boolean;
  houseId: number;
  questionnaireId: string;
  teamId: number;
  userAccountId: string;
  notes?: string;
  visitedAt: string;
  house?: Partial<House>;
  photoUri?: string;
  inspections: Inspection[];
}

export interface VisitData extends VisitAttributes {
  answers: FormState;
}

/*
  A HashMap to access a given house's Visit Data
*/
type UserId = number;
type HouseId = number;

export type VisitId = `${UserId}-${HouseId}`;

interface ResourceDataCommon {
  id: number;
  updated_at: string;
}

interface ResourceDataBreedingSiteType extends ResourceDataCommon {
  container_type: "permanent" | "non-permanent";
  name: string;
}

interface ResourceDataEliminationMethodType extends ResourceDataCommon {
  name_en: string;
  name_es: string;
  name_pt: string;
}

interface ResourceDataWaterSourceType extends ResourceDataCommon {
  name: string;
}

interface ResourceDataSpecialPlace extends ResourceDataCommon {
  name_en: string;
  name_es: string;
  name_pt: string;
}

interface ResourceCommon {
  id: number;
  version: number;
}

export enum ResourceName {
  BreedingSiteTypes = "breeding_site_types",
  EliminationMethodTypes = "elimination_method_types",
  WaterSourceTypes = "water_source_types",
  SpecialPlaces = "special_places",
  AppConfigParam = "AppConfigParam",
}

interface ResourceBreedingSiteTypes extends ResourceCommon {
  resourceName: ResourceName.BreedingSiteTypes;
  resourceData: ResourceDataBreedingSiteType[];
}

interface ResourceEliminationMethodTypes extends ResourceCommon {
  resourceName: ResourceName.EliminationMethodTypes;
  resourceData: ResourceDataEliminationMethodType[];
}

interface ResourceWaterSourceTypes extends ResourceCommon {
  resourceName: ResourceName.WaterSourceTypes;
  resourceData: ResourceDataWaterSourceType[];
}

interface ResourceSpecialPlaces extends ResourceCommon {
  resourceName: ResourceName.SpecialPlaces;
  resourceData: ResourceDataSpecialPlace[];
}

interface ResourceAppConfigParam extends ResourceCommon {
  resourceName: ResourceName.AppConfigParam;
  resourceData: [
    {
      name: "green_house_points_user_account";
      description: string;
      param_source: "TarikiPoint";
      param_type: "integer";
      value: string;
    },
    {
      name: "green_house_points_team";
      description: string;
      param_source: "TarikiPoint";
      param_type: "integer";
      value: string;
    },
    {
      name: "consecutive_green_statuses_for_tariki_house";
      description: string;
      param_source: "TarikiPoint";
      param_type: "integer";
      value: string;
    },
  ];
}

export type Resources = [
  ResourceBreedingSiteTypes,
  ResourceEliminationMethodTypes,
  ResourceWaterSourceTypes,
  ResourceSpecialPlaces,
  ResourceAppConfigParam,
];

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe: boolean;
  canDeleteByUser: boolean;
  canEditByUser: boolean;
  createdBy: {
    accountId: number;
    userName: string;
    lastName: string;
  };
  photos?: {
    photo_url: string;
  };
}
export interface Post {
  id: number;
  createdAt: number;
  userAccountId: number;
  canDeleteByUser: boolean;
  canEditByUser: boolean;
  createdBy: string;
  createByUser: {
    accountId: number;
    userName: string;
    lastName: string;
  };
  location: string;
  postText: string;
  content: string;
  photoUrl?: {
    photo_url: string;
  };
  commentsCount: number | null;
  likesCount: number;
  likedByUser: boolean;
  comments?: Comment[];
  visibility: PostVisibility;
}

export type ReportData = {
  houseQuantity: number;
  visitQuantity: number;
  greenQuantity: number;
  orangeQuantity: number;
  redQuantity: number;
  visitPercent: number;
  siteVariationPercentage: number;
  visitVariationPercentage: number;
};
