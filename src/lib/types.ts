export type Profile = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  tech_stack: string[];
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  screenshot_url: string | null;
  project_url: string | null;
  tech_stack: string[];
  category: string;
  is_public: boolean;
  fake_data: boolean;
  created_at: string;
  updated_at: string;
};

export const PROJECT_CATEGORIES = [
  "Web App",
  "Mobile",
  "API/Backend",
  "Design System",
  "Tool/Script",
  "Other",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];