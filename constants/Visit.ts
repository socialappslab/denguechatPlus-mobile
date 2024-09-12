import { InspectionQuestion } from "@/types";

export const INITIAL_QUESTION = 9;
export const INSPECTION_QUESTION = 0;
export const INITIAL_DB_QUESTION = 8;

export const StaticQuestions: InspectionQuestion[] = [
  {
    id: INITIAL_QUESTION,
    question: "¿Me dieron permiso para visitar la casa?",
    typeField: "list",
    options: [
      {
        id: 1,
        name: "Sí, tengo permiso para esta visita",
        required: false,
        textArea: false,
        next: 10,
      },
      {
        id: 2,
        name: "No, no me dieron permiso para esta visita",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 3,
        name: "La casa está cerrada",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 4,
        name: "La casa está deshabitada",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 5,
        name: "Me pidieron regresar en otra ocasión",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 6,
        name: "Otra explicación",
        required: false,
        textArea: true,
        next: -1,
      },
    ],
  },
  {
    id: 10,
    question: "Visitemos la casa",
    typeField: "splash",
    description:
      "Lleguemos a la casa con mucho respeto.\n\nEs importante que las personas nos sientan como alguien que les llega a apoyar para prevenir el dengue.\n\nPidamos permiso para pasar.\n\nNo lleguemos como inspectores, o para juzgar al hogar.",
    next: 11,
    image: {
      id: 8,
      url: "http://localhost:3000/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6OCwicHVyIjoiYmxvYl9pZCJ9fQ==--425559d1a1b5904f74550649547eb1af0d76a44d/En%20la%20huerta",
    },
    options: [],
  },
  {
    id: 11,
    question: "¿Quíen te acompaña hoy en esta visita?",
    typeField: "multiple",
    next: INITIAL_DB_QUESTION, // venir del back
    options: [
      {
        id: 21,
        name: "Adulto mayor",
        required: false,
        textArea: false,
      },
      {
        id: 22,
        name: "Adulto hombre",
        required: false,
        textArea: false,
      },
      {
        id: 23,
        name: "Adulto mujer",
        required: false,
        textArea: false,
      },
      {
        id: 24,
        name: "Joven hombre",
        required: false,
        textArea: false,
      },
      {
        id: 25,
        name: "Joven mujer",
        required: false,
        textArea: false,
      },
      {
        id: 26,
        name: "Niños\\as",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: INSPECTION_QUESTION, // Init Inspection
    question: "¿Que tipo de contenedor encontraste?",
    typeField: "list",
    resourceName: "breeding_site_type_id",
    next: 21,
    options: [
      {
        id: 1,
        name: "Tanques (cemento, polietileno, metal, otro material) safas",
        required: false,
        textArea: false,
        image: true,
      },
      {
        id: 2,
        name: "Bidones o cilindros (metal, plástico)",
        required: false,
        textArea: false,
        image: true,
      },
      {
        id: 3,
        name: "Pozos",
        required: false,
        textArea: false,
        image: true,
      },
      {
        id: 4,
        name: "Estructura o partes de la casa",
        required: false,
        textArea: false,
        image: true,
      },
      {
        id: 5,
        name: "Llanta",
        required: false,
        textArea: false,
        image: true,
      },
      {
        id: 6,
        name: "Elementos naturales",
        required: false,
        textArea: false,
        image: true,
      },
      {
        id: 7,
        name: "Otros",
        required: false,
        textArea: false,
        image: true,
      },
    ],
  },
  {
    id: 21,
    question: "¿El contenedor contiene agua?",
    resourceName: "has_water",
    typeField: "list",
    next: 23,
    options: [
      {
        id: 41,
        name: "Sí, contiene agua",
        required: false,
        textArea: false,
        value: "true",
      },
      {
        id: 42,
        name: "No, no contiene agua",
        required: false,
        textArea: false,
        value: "false",
      },
    ],
  },
  {
    id: 23,
    question: "¿El contenedor tiene una tapa?",
    resourceName: "has_lid",
    typeField: "list",
    next: 24,
    options: [
      {
        id: 51,
        name: "No, no tiene una tapa",
        required: false,
        textArea: false,
        value: "false",
      },
      {
        id: 52,
        name: "Sí, tiene una tapa",
        required: false,
        textArea: false,
        value: "true",
      },
    ],
  },
  {
    id: 24,
    question: "¿De donde proviene el agua?",
    resourceName: "water_source_type_id",
    typeField: "list",
    next: 25,
    options: [
      {
        id: 1,
        name: "Agua del grifo o potable",
        required: false,
        textArea: false,
      },
      {
        id: 2,
        name: "Lluvia",
        required: false,
        textArea: false,
      },
      {
        id: 3,
        name: "Otro",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 25,
    question:
      "En los últimos 30 días: ¿fue el contenedor tratado por el Ministerio de Salud con piriproxifeno o abate?",
    typeField: "list",
    next: 26,
    resourceName: "was_chemically_treated",
    options: [
      {
        id: 61,
        name: "Sí, fue tratado",
        required: false,
        textArea: false,
        value: "true",
      },
      {
        id: 62,
        name: "No, no fue tratado",
        required: false,
        textArea: false,
        value: "false",
      },
    ],
  },
  {
    id: 26,
    question: "En este contenedor hay",
    typeField: "multiple",
    // resourceName: "content_type",
    next: 16,
    options: [
      {
        id: 1,
        name: "Larvas",
        required: false,
        textArea: false,
      },
      {
        id: 2,
        name: "Pupas",
        required: false,
        textArea: false,
      },
      {
        id: 3,
        name: "Huevos",
        required: false,
        textArea: false,
      },
      {
        id: 4,
        name: "Nada",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 27,
    question: "Registremos acciones tomadas sobre el contenedor",
    typeField: "splash",
    next: 28,
    options: [],
  },
  {
    id: 28,
    question: "¿Qué acción se realizó con el contenedor?",
    typeField: "list",
    resourceName: "treated_by_id",
    next: 29,
    options: [
      {
        id: 1,
        name: "Contenedor protegido",
        required: false,
        textArea: false,
      },
      {
        id: 2,
        name: "Contenedor descartado",
        required: false,
        textArea: false,
      },
      {
        id: 3,
        name: "Agua del contenedor tirada",
        required: false,
        textArea: false,
      },
      {
        id: 4,
        name: "Contenedor trasladado a un lugar seguro",
        required: false,
        textArea: false,
      },
      {
        id: 5,
        name: "Contenedor limpiado",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 29,
    question: "¿Puedes tomar una foto del contenedor?",
    typeField: "list",
    next: 30,
    options: [
      {
        id: 91,
        name: "Sí, puedo",
        required: false,
        textArea: false,
      },
      {
        id: 92,
        name: "No, no puedo",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 30,
    question: "¿Quieres hacer seguimiento de un contenedor?",
    typeField: "list",
    resourceName: "tracking_type_required",
    next: -1,
    options: [
      {
        id: 1,
        name: "Sí, hacer seguimiento",
        required: false,
        textArea: false,
      },
      {
        id: 2,
        name: "No, no es necesario",
        required: false,
        textArea: false,
      },
    ],
  },
];
