const categoryMap: Record<string,string> = {
  "animation":"انیمیشن",
  "architecture":"معماری",
  "camera moves":"حرکت دوربین",
  "character":"کاراکتر",
  "cinematic":"سینمایی",
  "food drink":"غذا و نوشیدنی",
  "illustration 3d":"ایلوستریشن سه‌بعدی",
  "nature":"طبیعت",
  "photography":"عکاسی",
  "poster design":"طراحی پوستر",
  "product ads":"تبلیغات محصول",
  "product brand":"برند محصول",
  "travel":"سفر",
  "ugc":"UGC",
  "ui graphic":"گرافیک و UI",
};

export function categoryLabel(value:string){
  return categoryMap[value.toLowerCase()] || value;
}

export function normalizeSearch(value:string){
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g,"")
    .replace(/ي/g,"ی")
    .replace(/ك/g,"ک")
    .replace(/\s+/g," ")
    .trim();
}
