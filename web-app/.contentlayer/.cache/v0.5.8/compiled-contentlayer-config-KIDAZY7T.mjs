// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
var ConditionSection = defineDocumentType(() => ({
  name: "ConditionSection",
  filePathPattern: "medicalData/Conditions/**/*.md",
  contentType: "markdown",
  fields: {
    uid: { type: "string", required: false },
    parent_condition_uid: { type: "string", required: false },
    section_type: {
      type: "enum",
      options: ["OVERVIEW", "DEFINITION", "MECHANISM", "ASSESSMENT", "TREATMENT", "PROGNOSIS"],
      required: false
    },
    status: { type: "string", required: false }
  },
  computedFields: {
    conditionSlug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split("/")[2]
    },
    sectionKey: {
      type: "string",
      resolve: (doc) => (doc.section_type ?? "unknown").toLowerCase()
    }
  }
}));
var AssessmentDoc = defineDocumentType(() => ({
  name: "AssessmentDoc",
  filePathPattern: "medicalData/Assessments/**/*.md",
  contentType: "markdown",
  fields: {
    uid: { type: "string", required: false },
    name_en: { type: "string", required: false },
    name_ko: { type: "string", required: false },
    parent_condition_uid: { type: "string", required: false },
    category: { type: "string", required: false },
    academy: { type: "string", required: false },
    status: { type: "string", required: false }
  },
  computedFields: {
    conditionSlug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.split("/")[2] ?? "unknown"
    }
  }
}));
var AcademyDoc = defineDocumentType(() => ({
  name: "AcademyDoc",
  filePathPattern: "medicalData/Academies/**/*.md",
  contentType: "markdown",
  fields: {
    uid: { type: "string", required: false },
    name_en: { type: "string", required: false },
    name_ko: { type: "string", required: false },
    category: { type: "string", required: false },
    academy: { type: "string", required: false },
    status: { type: "string", required: false },
    target_region: { type: "string", required: false },
    innervation: { type: "string", required: false },
    related_conditions: { type: "list", of: { type: "string" }, required: false }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "..",
  contentDirExclude: [
    "web-app",
    "web",
    "automators",
    "medicalData/_schema",
    "medicalData/Concepts",
    "medicalData/Treatments",
    "__pycache__",
    ".git",
    "node_modules",
    ".claude"
  ],
  documentTypes: [ConditionSection, AssessmentDoc, AcademyDoc]
});
export {
  AcademyDoc,
  AssessmentDoc,
  ConditionSection,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-KIDAZY7T.mjs.map
