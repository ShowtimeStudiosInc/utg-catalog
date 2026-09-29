"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Emoji = {
  fileName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
};

type TagEmojiPickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

async function responseError(response: Response) {
  const result = await response.json().catch(() => null);
  return result?.error || "The emoji library request failed.";
}

export function TagEmojiPicker({ value, onChange }: TagEmojiPickerProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const loadEmojis = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/emojis");
      if (!response.ok) throw new Error(await responseError(response));
      setEmojis(await response.json());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the emoji library.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmojis();
  }, [loadEmojis]);

  async function uploadEmoji(file?: File) {
    if (!file) return;
    setError("");
    if (file.size > 1024 * 1024) {
      setError("Emoji images must be 1 MB or smaller.");
      return;
    }
    if (!["image/png", "image/gif", "image/webp", "image/jpeg"].includes(file.type)) {
      setError("Choose a PNG, GIF, WebP, or JPEG image.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/emojis", { method: "POST", body: formData });
      if (!response.ok) throw new Error(await responseError(response));
      const emoji: Emoji = await response.json();
      await loadEmojis();
      onChange(emoji.fileName);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to upload this emoji.");
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function deleteEmoji(fileName: string) {
    setError("");
    try {
      const response = await fetch(`/api/emojis/${encodeURIComponent(fileName)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      if (value === fileName) onChange(null);
      await loadEmojis();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete this emoji.");
    }
  }

  return (
    <section aria-label="Custom tag emoji" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-white">TAG EMOJI</p>
          <p className="text-sm text-[#b5bdcc]">Optional image, stored in your local app data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="deltarune-button inline-flex cursor-pointer items-center px-3 py-2">
            {isUploading ? "UPLOADING..." : "UPLOAD IMAGE"}
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept="image/png,image/gif,image/webp,image/jpeg"
              aria-label="Upload a custom emoji image"
              disabled={isUploading}
              onChange={(event) => void uploadEmoji(event.target.files?.[0])}
            />
          </label>
          {value && (
            <button className="app-navigation__back" type="button" onClick={() => onChange(null)}>
              Remove assignment
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-[#ff9aa4]" role="alert">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-[#b5bdcc]" role="status">Loading emoji library…</p>
      ) : emojis.length === 0 ? (
        <p className="text-sm text-[#b5bdcc]">No custom emojis yet. Upload a small image to get started.</p>
      ) : (
        <div className="emoji-picker-grid" aria-label="Emoji library">
          {emojis.map((emoji) => (
            <div className="relative" key={emoji.fileName}>
              <button
                className="emoji-picker-option w-full"
                type="button"
                aria-pressed={value === emoji.fileName}
                aria-label={`Assign emoji ${emoji.fileName}`}
                onClick={() => onChange(value === emoji.fileName ? null : emoji.fileName)}
              >
                <img src={`/api/emojis/${encodeURIComponent(emoji.fileName)}`} alt="" />
                <span>{emoji.fileName.slice(0, 8)}</span>
              </button>
              <button
                className="absolute right-1 top-1 rounded border border-[#63728a] bg-[#0b1220] px-1 text-xs text-white hover:border-[#ff8792] hover:text-[#ff9aa4]"
                type="button"
                aria-label={`Delete emoji ${emoji.fileName}`}
                title="Delete from library"
                onClick={() => void deleteEmoji(emoji.fileName)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[#b5bdcc]">
        PNG, GIF, WebP, or JPEG · up to 1 MB · maximum 256 × 256 pixels
      </p>
    </section>
  );
}
