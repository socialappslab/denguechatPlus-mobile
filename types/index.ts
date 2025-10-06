import { ISelectableItem } from "@/components/QuestionnaireRenderer";
import { VisitCase } from "@/hooks/useStore";
import { PostVisibility } from "@/schema";
import { StatusColor } from "./prepareFormData";
export * from "./prepareFormData";

type TypeField = "text" | "multiple" | "list" | "splash" | "splash+list";

export interface Questionnaire {
  id: string;
  initialQuestion: number;
  finalQuestion: number;
  questions: Question[];
}

export type OptionType = "inputNumber" | "textArea" | "boolean";
export type ResourceType = "attribute" | "relation";
export interface Question {
  id: number;
  question: string;
  typeField: TypeField;
  description: string | null;
  notes: string | null;
  next: number | null;
  resourceName: string | null;
  resourceType: ResourceType | null;
  image: Image | null;
  required: boolean;
  // TODO: Improve the type correctness of this, `options` should be an union of
  // multiple types of Option objects
  options: Option[];
  additionalData: Record<string, string> | null;
}

interface Image {
  id: number;
  url: string;
}

export interface Option {
  id: number;

  /**
   * The user-facing label or text to show for the option.
   */
  name: string;

  /**
   * Don't know the purpose of this since it's always `false`.
   */
  required: false;

  /**
   * A pointer to the next question. -1 means early exit.
   */
  next: number | null;

  /**
   * Questions have options with images for demonstration purposes.
   */
  image: Image | null;

  /**
   * The value key for the options of questions that have a `resourceName`.
   */
  resourceId: string | null;

  /**
   * The type of option.
   */
  optionType: OptionType | null;

  /**
   * Questions can have grouped options.
   */
  group: string | null;

  /**
   * Used in conjunction with `weightedPoints` to calculate the color status of
   * the containers and the house.
   */
  statusColor: StatusColor | null;

  /**
   * Options are sorted by custom order in the database.
   */
  position: number;

  /**
   * Used in conjunction with `statusColor` to calculate the color status of the
   * containers and the house.
   */
  weightedPoints: number | null;

  /**
   * The value key of some options.
   */
  value?: string;

  /**
   * A selected option with this flag should disable all the other available
   * options.
   */
  disableOtherOptions?: boolean;

  /**
   * The value key of some options that later are discriminated by the
   * `showInCase` key.
   */
  selectedCase?: VisitCase;

  /**
   * A discriminator to show options based on the `selectedCase`.
   */
  showInCase?: VisitCase;

  /**
   * Don't know the purpose of this. Is not implemented by any of the clients at
   * the moment.
   */
  additionalInformation?: any[];
}

export interface Inspection {
  breeding_site_type_id: number;
  elimination_method_type_ids: number[];
  other_elimination_method: string;
  water_source_type_ids?: number[];
  code_reference?: string;
  has_water: boolean;
  water_source_other?: string;
  was_chemically_treated: string;
  container_test_result?: string;
  container_protection_ids: number[];
  other_protection?: string;
  type_content_id?: number[];
  quantity_founded: number;
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
  userAccountId: number;
  notes?: string;
  visitedAt: string;
  house?: Partial<House>;
  photoUri?: string;
  inspections: Inspection[];
  familyEducationTopics: string[];
  otherFamilyEducationTopic?: string;
  /**
   * Can be `null`, because when we added this feature, we didn't knew the
   * correct value for existing records and defaulting to `false` was going to
   * mess up the data.
   */
  wasOffline: boolean | null;
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

export enum HouseBlockType {
  FrenteAFrente = "frente_a_frente",
  Block = "block",
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

export interface ReportData {
  houseQuantity: number;
  visitQuantity: number;
  greenQuantity: number;
  orangeQuantity: number;
  redQuantity: number;
  visitPercent: number;
  siteVariationPercentage: number;
  visitVariationPercentage: number;
}

export interface AccumulatedPoints {
  data: {
    id: number;
    type: "accumulatedPoints";
    attributes: {
      totalPoints: number;
      name: string;
    };
    // TODO: remove the `null` when the backend fixes data being T | null, it
    // just needs to be T
  } | null;
}

export interface TeamResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      members: {
        id: number;
        fullName: string;
        rol: "admin" | "brigadista" | "facilitador";
      }[];
      organizations: {
        id: number;
        name: string;
      };
      sector: {
        id: number;
        name: string;
      };
      wedge: {
        id: number;
        name: string;
      };
      visits: number;
      sitesStatuses: object;
    };
  };
}
