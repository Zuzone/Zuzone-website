/** Name as shown beside the Zu symbol in the header lockup.
 * "Edge Esmeralda 2026 (May 30 - June 27)" → "Edge Esmeralda"; "ZuAfrique 2026" → "Afrique" */
export function lockupName(name: string): string {
  let s = name
    .replace(/\([^)]*\)/g, " ") // parentheticals
    .replace(/[:,].*$/, " ") // subtitles after a colon or comma
    .replace(/\b20\d\d\b/g, " ") // years
    .replace(/\s+/g, " ")
    .trim();
  // The symbol already says "Zu", so "ZuAfrique" reads as Zu + Afrique (not Zu + ZuAfrique).
  // Only when Zu is a prefix on a capitalised word; "Zuitzerland" and "Zanzalu" stay whole.
  s = s.replace(/^Zu-?(?=[A-ZÀ-Ž])/, "");
  return s || name;
}
