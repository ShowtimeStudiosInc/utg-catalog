"use client";

import { useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Emoji = { fileName: string; name: string };
type TextControl = HTMLInputElement | HTMLTextAreaElement;

async function fetchEmojis(): Promise<Emoji[]> {
  const response = await fetch("/api/emojis");
  if (!response.ok) throw new Error("Could not load the emoji library.");
  return response.json();
}

async function uploadEmoji({ file, name }: { file: File; name: string }): Promise<Emoji> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("name", name.trim().toLowerCase());
  const response = await fetch("/api/emojis", { method: "POST", body: formData });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Could not upload this emoji.");
  return body;
}

function insertText(control: TextControl | null, name: string) {
  if (!control) return;
  const token = `:${name}:`;
  const supportsSelection = control instanceof HTMLTextAreaElement || control.type !== "email";
  const start = supportsSelection ? control.selectionStart ?? control.value.length : control.value.length;
  const end = supportsSelection ? control.selectionEnd ?? start : start;
  const nextValue = `${control.value.slice(0, start)}${token}${control.value.slice(end)}`;
  const prototype = control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(control, nextValue);
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.focus();
  const cursor = start + token.length;
  if (supportsSelection) requestAnimationFrame(() => control.setSelectionRange(cursor, cursor));
}

export function EmojiTextInserter({ controlRef }: { controlRef: RefObject<TextControl | null> }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [emojiName, setEmojiName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const { data: emojis = [], error: loadError, isLoading } = useQuery({
    queryKey: ["custom-emojis"],
    queryFn: fetchEmojis,
    enabled: open,
  });
  const uploadMutation = useMutation({
    mutationFn: uploadEmoji,
    onSuccess: async (emoji) => {
      await queryClient.invalidateQueries({ queryKey: ["custom-emojis"] });
      insertText(controlRef.current, emoji.name);
      setEmojiName("");
      setUploadError("");
      setOpen(false);
    },
    onError: (error) => setUploadError(error.message),
  });

  function chooseFile(file?: File) {
    if (!file) return;
    setUploadError("");
    const name = emojiName.trim();
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(name)) {
      setUploadError("Use a name with letters, numbers, underscores, or hyphens (up to 32 characters).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setUploadError("Emoji images must be 1 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!["image/png", "image/gif", "image/webp", "image/jpeg"].includes(file.type)) {
      setUploadError("Choose a PNG, GIF, WebP, or JPEG image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    uploadMutation.mutate({ file, name });
  }

  return (
    <span className="emoji-inserter" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      <button
        type="button"
        className="emoji-insert-trigger"
        aria-label="Open custom emoji picker"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span aria-hidden="true">☺</span>
      </button>
      {open && (
        <span className="emoji-insert-popover" role="dialog" aria-label="Custom emoji picker">
          <span className="emoji-insert-heading">CUSTOM EMOJI</span>
          <span className="emoji-insert-help">Upload an image or choose one to insert its shortcode.</span>
          <span className="emoji-insert-upload">
            <input
              aria-label="New emoji name"
              value={emojiName}
              maxLength={32}
              onChange={(event) => setEmojiName(event.target.value)}
              placeholder="emoji_name"
              autoComplete="off"
            />
            <label className="deltarune-button emoji-insert-upload-button">
              {uploadMutation.isPending ? "UPLOADING…" : "UPLOAD"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/gif,image/webp,image/jpeg"
                aria-label="Choose a custom emoji image to upload"
                disabled={uploadMutation.isPending}
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
            </label>
          </span>
          {uploadError && <span className="emoji-insert-error" role="alert">{uploadError}</span>}
          {loadError && <span className="emoji-insert-error" role="alert">{loadError.message}</span>}
          {isLoading ? (
            <span className="emoji-insert-help" role="status">Loading emoji library…</span>
          ) : emojis.length ? (
            <span className="emoji-insert-grid" aria-label="Emoji library">
              {emojis.map((emoji) => (
                <button
                  key={emoji.fileName}
                  type="button"
                  className="emoji-insert-option"
                  aria-label={`Insert :${emoji.name}:`}
                  title={`:${emoji.name}:`}
                  onClick={() => { insertText(controlRef.current, emoji.name); setOpen(false); }}
                >
                  <Image src={`/api/emojis/${encodeURIComponent(emoji.fileName)}`} alt="" width={28} height={28} unoptimized />
                  <span>:{emoji.name}:</span>
                </button>
              ))}
            </span>
          ) : (
            <span className="emoji-insert-help">No custom emojis yet.</span>
          )}
          <span className="emoji-insert-help">Uploads accept PNG, GIF, WebP, or JPEG up to 1 MB and 256 × 256 pixels.</span>
        </span>
      )}
    </span>
  );
}
