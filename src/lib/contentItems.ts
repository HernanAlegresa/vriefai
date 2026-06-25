import { supabase } from "@/lib/supabase";
import { parseGenerationOutput } from "@/lib/parseOutput";
import type { ContentItem } from "@/lib/types";

type DbContentItem = {
  id: string;
  generation_id: string;
  type: "reel" | "carousel" | "story";
  number: number;
  sort_order: number;
  title: string;
  suggested_date: string | null;
  body: string;
  edited: boolean;
  created_at: string;
};

export function fromDbContentItem(row: DbContentItem): ContentItem {
  return {
    id: row.id,
    generationId: row.generation_id,
    type: row.type,
    number: row.number,
    sortOrder: row.sort_order,
    title: row.title,
    suggestedDate: row.suggested_date,
    body: row.body,
    edited: row.edited,
    createdAt: row.created_at,
  };
}

const SECTION_TYPE_MAP = {
  reels: "reel",
  carousels: "carousel",
  stories: "story",
} as const;

export async function insertContentItems(generationId: string, output: string) {
  const sections = parseGenerationOutput(output);
  const rows: object[] = [];
  let sortOrder = 1;

  for (const section of sections) {
    const dbType = SECTION_TYPE_MAP[section.type as keyof typeof SECTION_TYPE_MAP];
    if (!dbType) continue;
    for (const item of section.items) {
      rows.push({
        generation_id: generationId,
        type: dbType,
        number: item.index + 1,
        sort_order: sortOrder++,
        title: item.title || item.rawTitle,
        suggested_date: item.suggestedDate ?? null,
        body: item.content,
      });
    }
  }

  if (rows.length === 0) return;
  const { error } = await supabase
    .from("content_items")
    .upsert(rows, { onConflict: "generation_id,type,number", ignoreDuplicates: true });
  if (error) console.error("[content_items] upsert failed:", error.message);
}

export async function ensureContentItems(generationId: string, output: string) {
  const { count, error } = await supabase
    .from("content_items")
    .select("id", { count: "exact", head: true })
    .eq("generation_id", generationId);

  if (error) {
    console.error("[content_items] count failed:", error.message);
    return;
  }
  if ((count ?? 0) === 0) {
    await insertContentItems(generationId, output);
  }
}
