"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

async function fetchEmojis(): Promise<Emoji[]> {
  const response = await fetch("/api/emojis");
  if (!response.ok) throw new Error(await responseError(response));
  return response.json();
}

export function TagEmojiPicker({ value, onChange }: TagEmojiPickerProps) {
  const queryClient = useQueryClient();
  const [localError, setLocalError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const { data: emojis = [], isLoading, error: queryError } = useQuery({
    queryKey: ["custom-emojis"],
    queryFn: fetchEmojis,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/emojis", { method: "POST", body: formData });
      if (!response.ok) throw new Error(await responseError(response));
      return response.json() as Promise<Emoji>;
    },
    onSuccess: async (emoji) => {
      onChange(emoji.fileName);
      await queryClient.invalidateQueries({ queryKey: ["custom-emojis"] });
    },
    onSettled: () => {
      if (fileInput.current) fileInput.current.value = "";
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const response = await fetch(`/api/emojis/${encodeURIComponent(fileName)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      return fileName;
    },
    onSuccess: async (fileName) => {
      if (value === fileName) onChange(null);
      await queryClient.invalidateQueries({ queryKey: ["custom-emojis"] });
    },
  });

  function uploadEmoji(file?: File) {
    if (!file) return;
    setLocalError("");
    if (file.size > 1024 * 1024) {
      setLocalError("Emoji images must be 1 MB or smaller.");
      return;
    }
    if (!["image/png", "image/gif", "image/webp", "image/jpeg"].includes(file.type)) {
      setLocalError("Choose a PNG, GIF, WebP, or JPEG image.");
      return;
    }
    uploadMutation.mutate(file);
  }

  const error = localError || uploadMutation.error?.message || deleteMutation.error?.message;

  return (
    <section aria-label="Custom tag emoji" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-white">TAG EMOJI</p>
          <p className="text-sm text-[#b5bdcc]">Optional image, stored in your local app data.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="deltarune-button inline-flex cursor-pointer items-center px-3 py-2">
            {uploadMutation.isPending ? "UPLOADING..." : "UPLOAD IMAGE"}
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept="image/png,image/gif,image/webp,image/jpeg"
              aria-label="Upload a custom emoji image"
              disabled={uploadMutation.isPending}
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

      {queryError && (
        <div className="emoji-picker-error" role="alert">
          <p>{queryError.message}</p>
          <button type="button" onClick={() => void queryClient.invalidateQueries({ queryKey: ["custom-emojis"] })}>
            TRY AGAIN
          </button>
        </div>
      )}
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
                <Image
                  src={`/api/emojis/${encodeURIComponent(emoji.fileName)}`}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                />
                <span>{emoji.fileName.slice(0, 8)}</span>
              </button>
              <button
                className="emoji-picker-delete absolute right-1 top-1 rounded border border-[#63728a] bg-[#0b1220] px-1 text-xs text-white hover:border-[#ff8792] hover:text-[#ff9aa4]"
                type="button"
                aria-label={`Delete emoji ${emoji.fileName}`}
                title="Delete from library"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(emoji.fileName)}
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
