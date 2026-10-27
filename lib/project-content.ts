import sourceContent from "./project-content.json";

export type ProjectSourceSection = {
  category: "overview" | "location" | "layout" | "amenities" | "eligibility" | "package";
  title: string;
  items: string[];
  images: string[];
};

export type ProjectSourceContent = {
  sourceTitle: string;
  facts: { label: string; value: string }[];
  sections: ProjectSourceSection[];
  gallery: string[];
  form: {
    id: string;
    fields: {
      name: string;
      label: string;
      type: "text" | "tel" | "number" | "radio" | "checkbox";
      required: boolean;
      options: string[];
    }[];
  } | null;
};

export function getProjectSourceContent(slug: string): ProjectSourceContent | undefined {
  return (sourceContent as Record<string, ProjectSourceContent>)[slug];
}
