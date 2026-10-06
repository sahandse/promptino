const URL = "https://raw.githubusercontent.com/Hanyuyu/visual-prompt-feed/main/data/prompts.json";
const MIN_VALID_RATIO = 0.98;
const MIN_VALID_COUNT = 100;

const response = await fetch(URL);
if (!response.ok) {
  throw new Error(`Source fetch failed: ${response.status}`);
}

const payload = await response.json();
if (!Array.isArray(payload.items) || payload.items.length === 0) {
  throw new Error("Source has no items");
}

const invalidIds = [];
let valid = 0;

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

  if (ok) {
    valid += 1;
  } else {
    invalidIds.push(item.id ?? "(missing-id)");
  }
}

const ratio = valid / payload.items.length;

console.log(`Source records: ${payload.items.length}`);
console.log(`Verified records: ${valid}`);
console.log(`Quarantined records: ${invalidIds.length}`);

if (invalidIds.length) {
  console.log("Quarantined IDs:", invalidIds.slice(0, 50).join(", "));
}

if (valid < MIN_VALID_COUNT || ratio < MIN_VALID_RATIO) {
  throw new Error(
    `Source quality below threshold: ${(ratio * 100).toFixed(2)}% valid; minimum is ${MIN_VALID_RATIO * 100}%`
  );
}

console.log(`Validation passed: ${(ratio * 100).toFixed(2)}% of records are safe to ingest.`);
