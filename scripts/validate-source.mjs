const URL = "https://raw.githubusercontent.com/Hanyuyu/visual-prompt-feed/main/data/prompts.json";

const response = await fetch(URL);
if (!response.ok) {
  throw new Error(`Source fetch failed: ${response.status}`);
}

const payload = await response.json();
if (!Array.isArray(payload.items) || payload.items.length === 0) {
  throw new Error("Source has no items");
}

let invalid = 0;
for (const item of payload.items) {
  const media = Array.isArray(item.media)
    ? item.media.find((m) => m.type === item.mediaType && m.role === "result") ||
      item.media.find((m) => m.type === item.mediaType)
    : null;

  const ok =
    typeof item.id === "string" &&
    /^byradar:\d+:\d+$/.test(item.id) &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    typeof item.prompt === "string" &&
    item.prompt.trim().length > 0 &&
    (item.mediaType === "image" || item.mediaType === "video") &&
    typeof item.source?.url === "string" &&
    /^https:\/\/(www\.)?x\.com\//.test(item.source.url) &&
    typeof item.source?.author?.handle === "string" &&
    item.source.author.handle.trim().length > 0 &&
    typeof item.recommendedModel === "string" &&
    item.recommendedModel.trim().length > 0 &&
    Array.isArray(item.categories) &&
    item.categories.length > 0 &&
    media &&
    typeof media.previewUrl === "string" &&
    /^https?:\/\//.test(media.previewUrl);

  if (!ok) invalid += 1;
}

if (invalid > 0) {
  throw new Error(`Source validation failed: ${invalid} invalid records`);
}

console.log(`Validated ${payload.items.length} source records successfully.`);
