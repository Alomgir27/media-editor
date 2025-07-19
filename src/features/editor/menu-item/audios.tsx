"use client";
import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { ADD_AUDIO } from "@designcombo/state";
import { IAudio } from "@designcombo/types";
import { Music } from "lucide-react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import React, { useMemo } from "react";
import { generateId } from "@designcombo/timeline";
import { VoiceCloneProps } from "../interfaces/voice-clone";

export const Audios: React.FC<VoiceCloneProps> = ({ voiceCloneData }) => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();

  const handleAddAudio = (payload: Partial<IAudio>) => {
    payload.id = generateId();
    dispatch(ADD_AUDIO, { payload, options: {} });
  };

 

  // Transform reconstructionData segments into audio segments
  const audioSegments = useMemo(() => {
    if (!voiceCloneData?.reconstructionData?.segments) return [];
    
    return voiceCloneData.reconstructionData.segments.map((segment) => ({
      id: generateId(),
      details: { src: segment.segment_url },
      name: segment.cloned_filename.replace('.wav', '').replace('cloned_', ''),
      type: "audio" as const,
      duration: segment.duration * 1000,
      display: {
        from: segment.start_time * 1000,
        to: segment.end_time * 1000,
      },
      metadata: {
        author: "Voice Clone",
        speaker: `Speaker ${segment.speaker}`,
        originalText: segment.original_text,
        englishText: segment.english_text,
        confidence: segment.confidence,
        segmentIndex: segment.segment_index,
      },
    }));
  }, [voiceCloneData?.reconstructionData?.segments]);



  const groupedSegments = useMemo(() => {
    return audioSegments.reduce((acc, audio) => {
      const speaker = audio.metadata?.speaker || 'Unknown';
      if (!acc[speaker]) acc[speaker] = [];
      acc[speaker].push(audio);
      return acc;
    }, {} as Record<string, typeof audioSegments>);
  }, [audioSegments]);

  // Sort segments by time
  Object.keys(groupedSegments).forEach(speaker => {
    groupedSegments[speaker].sort((a, b) => {
      const aTime = a.display?.from || 0;
      const bTime = b.display?.from || 0;
      return aTime - bTime;
    });
  });

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Audios
        {(voiceCloneData?.loading || voiceCloneData?.reconstructionLoading) && (
          <span className="ml-2 text-xs text-blue-400">Loading...</span>
        )}
        {(voiceCloneData?.error || voiceCloneData?.reconstructionError) && (
          <span className="ml-2 text-xs text-red-400">Error</span>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col px-2 pb-4">
          {audioSegments && audioSegments.length > 0 ? (
            <>
              <div className="px-2 py-2 text-xs font-medium text-cyan-400">
                Voice Clone Segments
                {voiceCloneData.reconstructionData && (
                  <span className="ml-2 text-muted-foreground">
                    ({voiceCloneData.reconstructionData.total_segments_used} segments)
                  </span>
                )}
              </div>
              
              {Object.entries(groupedSegments).map(([speaker, segments]) => (
                <div key={speaker} className="mb-4">
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                    {speaker} ({segments.length} segments)
                  </div>
                  <div className="space-y-1">
                    {segments.map((audio, index) => (
                      <AudioItem
                        shouldDisplayPreview={!isDraggingOverTimeline}
                        handleAddAudio={handleAddAudio}
                        audio={audio}
                        key={`${speaker}-${index}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              {voiceCloneData?.loading ? "Loading..." : "No segments available"}
            </div>
          )}

          {/* Instruments Audio Section */}
          {voiceCloneData?.data?.details?.uploaded_files?.instruments_audio && (
            <>
              <div className="px-2 py-2 text-xs font-medium text-orange-400 mt-4">
                Instruments Audio of the original video
              </div>
              <AudioItem
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddAudio={handleAddAudio}
                audio={{
                  id: "instruments-audio",
                  details: { src: voiceCloneData.data.details.uploaded_files.instruments_audio.url },
                  name: "Instruments Audio",
                  type: "audio" as const,
                  duration: (voiceCloneData?.data?.details?.processing_details?.original_audio?.duration || 30) * 1000,
                  metadata: {
                    author: "Voice Clone",
                    speaker: "Instruments",
                    audioType: "instruments",
                  },
                }}
              />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const AudioItem = ({
  handleAddAudio,
  audio,
  shouldDisplayPreview,
}: {
  handleAddAudio: (payload: Partial<IAudio>) => void;
  audio: Partial<IAudio>;
  shouldDisplayPreview: boolean;
}) => {
  const style = React.useMemo(
    () => ({
      backgroundImage: `url(https://cdn.designcombo.dev/thumbnails/music-preview.png)`,
      backgroundSize: "cover",
      width: "70px",
      height: "70px",
    }),
    [],
  );

  return (
    <Draggable data={audio} renderCustomPreview={<div style={style} />} shouldDisplayPreview={shouldDisplayPreview}>
      <div
        draggable={false}
        onClick={() => handleAddAudio(audio)}
        style={{ display: "grid", gridTemplateColumns: "48px 1fr" }}
        className="flex cursor-pointer gap-4 px-2 py-2 text-sm hover:bg-zinc-800/70 rounded-md"
      >
        <div className="flex h-12 items-center justify-center bg-zinc-800 rounded">
          <Music width={16} />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-sm font-medium">{audio.name}</div>
          <div className="text-xs text-zinc-400">
            {audio.metadata?.speaker || 'Audio Segment'}
            {audio.display && (
              <span className="ml-2">
                ({(audio.display.from / 1000).toFixed(1)}s - {(audio.display.to / 1000).toFixed(1)}s)
              </span>
            )}
          </div>
          {audio.metadata?.originalText && (
            <div className="text-xs text-zinc-500 mt-1 line-clamp-2">
              {audio.metadata.originalText}
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
};

