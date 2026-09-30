const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(hostname)) {
      const segments = url.pathname.split("/").filter(Boolean);
      if (url.pathname === "/watch") videoId = url.searchParams.get("v");
      else if (["embed", "shorts", "live", "v"].includes(segments[0] ?? "")) videoId = segments[1] ?? null;
    }

    return videoId && VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function parseStoredYouTubeLinks(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && getYouTubeVideoId(item) !== null) : [];
  } catch {
    const id = getYouTubeVideoId(value);
    return id ? [value] : [];
  }
}
