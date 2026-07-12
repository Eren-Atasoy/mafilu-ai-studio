export type ProjectStatus = "draft" | "editing" | "published";
export type GenerationType = "video" | "image";
export type GenerationStatus = "pending" | "processing" | "succeeded" | "failed";
export type PublishPlatform = "instagram" | "tiktok";
export type PublishStatus = "pending" | "published" | "failed";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  project_id: string;
  user_id: string;
  prompt: string;
  type: GenerationType;
  model: string;
  replicate_prediction_id: string | null;
  status: GenerationStatus;
  output_url: string | null;
  error_message: string | null;
  created_at: string;
}

export interface TimelineItem {
  id: string;
  project_id: string;
  generation_id: string | null;
  order_index: number;
  start_sec: number;
  duration_sec: number;
  caption_text: string | null;
  caption_style: Record<string, unknown>;
  created_at: string;
}

export interface Publication {
  id: string;
  project_id: string;
  user_id: string;
  platform: PublishPlatform;
  status: PublishStatus;
  external_post_id: string | null;
  published_at: string | null;
  created_at: string;
}
