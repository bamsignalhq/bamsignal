/**
 * Founder Launch Book™ — build verification helpers.
 */

export function founderLaunchBookCommandRegistered(source) {
  return source.includes("build:founder-launch-book") && source.includes("test:founder-launch-book");
}

export function founderLaunchBookModuleRegistered(source) {
  return source.includes("scripts/build-founder-launch-book.mjs");
}

export function founderLaunchBookChapterCount(manifest) {
  return manifest?.FOUNDER_LAUNCH_BOOK_CHAPTERS?.length ?? 0;
}
