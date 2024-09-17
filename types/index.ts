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

export interface InspectionQuestion extends Question {
  resourceName?: string;
}

export interface Option {
  id: number;
  name: string;
  required?: boolean;
  textArea?: boolean;
  next?: number;
  image?: boolean;
  value?: string;
  resourceId: string;
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
  code_reference?: string;
  container_test_result: string;
  has_lid: boolean;
  has_water: boolean;
  in_use: boolean;
  tracking_type_required: string;
  was_chemically_treated: boolean;
  treated_by_id: number;
  breeding_site_type_id: number;
  elimination_method_type_id: number;
  water_source_type_id: number;
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
  house_block_id?: number;
}

export type FormAnswer = Record<string, Record<string, boolean | string>>;
export type FormPayload = Answer[];

interface VisitAttributes {
  host: string;
  visitPermission: boolean;
  houseId: number;
  questionnaireId: string;
  teamId: number;
  userAccountId: string;
  notes?: string;
  house?: House;
  inspections: Inspection[];
}
export interface VisitPayload extends VisitAttributes {
  answers: FormPayload;
}

export interface VisitData extends VisitAttributes {
  answers: FormAnswer;
}

export interface ResourceData {
  id: number;
  name: string;
  updated_at: string;
  breeding_site_type_id?: number;
  photo_url?: string;
}

export interface Resource {
  id: number;
  version: number;
  resourceName: string;
  resourceData: ResourceData[];
}
