import { ISelectableItem } from "@/components/QuestionnaireRenderer";
import { PostVisibility } from "@/schema";

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
  next?: number;
  image?: Image;
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
  image?: string;
  value?: string;
  resourceId: string;
  optionType: OptionType;
  group: string;
  statusColor?: string;
  disableOtherOptions?: boolean;
}

export interface Image {
  id: number;
  url: string;
}

// <Visit types>
export interface Answer {
  questionId: number;
  answer: {
    optionId: number;
    value: boolean | string;
    text?: string;
  }[];
}

export interface Inspection {
  breeding_site_type_id: number;
  elimination_method_type_id: number;
  water_source_type_id?: number;
  code_reference?: string;
  has_water: boolean;
  water_source_other?: string;
  was_chemically_treated: string;
  container_test_result?: string;
  container_protection_id: number;
  other_protection?: string;
  type_content_id?: number[];
  quantity_founded: number;
  // tracking_type_required?: string;
  visited_at?: string;
  photo_id?: string;
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
export type FormPayload = Answer[];

interface VisitAttributes {
  host: string;
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
export interface VisitPayload extends VisitAttributes {
  answers: FormPayload;
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
export type VisitMap = Record<VisitId, FormState>;

export interface ResourceData {
  id: number;
  name: string;
  updated_at: string;
  breeding_site_type_id?: number;
  photo_url?: string;
}

export interface ResourceDataWithTranslations {
  id: number;
  name_en: string;
  name_es: string;
  name_pt: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  version: number;
  resourceName: string;
  resourceData: ResourceData[];
}

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
