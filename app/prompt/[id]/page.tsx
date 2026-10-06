import { notFound } from "next/navigation";
import { prompts } from "@/data/prompts";
import PromptDetailClient from "./PromptDetailClient";

export function generateStaticParams() {
  return prompts.map((item) => ({ id: item.id }));
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = prompts.find((prompt) => prompt.id === id);

  if (!item) notFound();

  return <PromptDetailClient item={item} />;
}
