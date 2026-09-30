"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getYouTubeVideoId, parseStoredYouTubeLinks } from "@/lib/youtube-video";

export function CharacterYoutubePlayer({ youtubeLinks, characterName }: {
  youtubeLinks: string | null | undefined;
  characterName: string;
}) {
  const tracks = useMemo(() => parseStoredYouTubeLinks(youtubeLinks), [youtubeLinks]);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoId = tracks[selectedTrack] ? getYouTubeVideoId(tracks[selectedTrack]) : null;

  if (tracks.length === 0) return null;

  return (
    <section className="space-y-3 border-2 border-white bg-black p-3 text-white" aria-label={`${characterName} character audio`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold tracking-widest">CHARACTER AUDIO</h3>
        {playing ? (
          <Button type="button" className="deltarune-button" onClick={() => setPlaying(false)}>STOP AUDIO</Button>
        ) : (
          <Button type="button" className="deltarune-button" onClick={() => setPlaying(true)}>PLAY AUDIO</Button>
        )}
      </div>
      {tracks.length > 1 && <div className="flex flex-wrap gap-2" aria-label="Choose audio track">
        {tracks.map((_, index) => <Button key={`${index}-${tracks[index]}`} type="button" className="deltarune-button" aria-pressed={selectedTrack === index} onClick={() => { setSelectedTrack(index); setPlaying(true); }}>TRACK {index + 1}</Button>)}
      </div>}
      {playing && videoId ? (
        <iframe
          key={`${selectedTrack}-${videoId}`}
          className="aspect-video min-h-[200px] w-full border-2 border-white bg-black"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&playsinline=1&rel=0`}
          title={`${characterName} character audio track ${selectedTrack + 1}`}
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : playing ? <p className="text-sm text-[#b7b7b7]">This video link could not be played.</p> : <p className="text-sm text-[#b7b7b7]">AUDIO STOPPED</p>}
      <p className="text-xs text-[#b7b7b7]">If playback does not start automatically, press Play in the video.</p>
    </section>
  );
}
