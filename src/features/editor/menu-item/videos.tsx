import Draggable from "@/components/shared/draggable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideo } from "@designcombo/types";
import React from "react";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";
import { VoiceCloneProps } from "../interfaces/voice-clone";

export const Videos: React.FC<VoiceCloneProps> = ({ voiceCloneData }) => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();

  const handleAddVideo = (payload: Partial<IVideo>) => {
    dispatch(ADD_VIDEO, {
      payload,
      options: {
        resourceId: "main",
        scaleMode: "fit",
      },
    });
  };

  const sourceUrl = voiceCloneData?.data?.details?.processing_details?.original_audio?.source_url;
  const filename = voiceCloneData?.data?.details?.processing_details?.original_audio?.filename || "Voice Clone Video";
  const duration = voiceCloneData?.data?.details?.processing_details?.original_audio?.duration;

  const voiceCloneVideo = sourceUrl ? {
    id: "voice-clone-source-video",
    details: { src: sourceUrl },
    type: "video" as const,
    preview: sourceUrl,
    duration: duration ? duration * 1000 : 30000,
    name: filename,
  } as unknown as Partial<IVideo> : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Videos
        {voiceCloneData?.loading && (
          <span className="ml-2 text-xs text-blue-400">(Loading voice clone...)</span>
        )}
        {voiceCloneData?.error && (
          <span className="ml-2 text-xs text-red-400">(Error loading)</span>
        )}
      </div>
      <ScrollArea>
        <div className="px-4">
          {voiceCloneVideo ? (
            <>
              <div className="py-2 text-xs font-medium text-cyan-400">
                Source Video
              </div>
              <VideoItem
                key="voice-clone-source"
                video={voiceCloneVideo}
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddVideo={handleAddVideo}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground">
              {voiceCloneData?.loading ? "Loading video..." : "No video available"}
              {voiceCloneData?.data && !sourceUrl && (
                <div className="text-xs text-red-400 mt-2">
                  Source video not found in data
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const VideoItem = ({
  handleAddVideo,
  video,
  shouldDisplayPreview,
}: {
  handleAddVideo: (payload: Partial<IVideo>) => void;
  video: Partial<IVideo>;
  shouldDisplayPreview: boolean;
}) => {
  const [videoError, setVideoError] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleVideoCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1;
    }
  };

  return (
    <Draggable
      data={{
        ...video,
        metadata: {
          previewUrl: video.details?.src,
          filename: video.name,
        },
      }}
      renderCustomPreview={
        <div className="draggable rounded bg-gray-600 w-30 h-30 flex items-center justify-center text-white text-2xl">
          📹
        </div>
      }
      shouldDisplayPreview={shouldDisplayPreview}
    >
      <div
        onClick={() =>
          handleAddVideo({
            id: generateId(),
            details: {
              src: video.details!.src,
            },
            name: video.name,
            type: "video",
            duration: video.duration,
            preview: video?.preview,
          } as unknown as Partial<IVideo>)
        }
        className="w-full cursor-pointer hover:scale-105 transition-transform rounded-md"
      >
        <div className="w-full aspect-video rounded-md bg-gray-600 overflow-hidden border-2 border-gray-500 relative">
          {video.details?.src && !videoError ? (
            <video
              ref={videoRef}
              src={video.details.src}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
              onError={() => setVideoError(true)}
              onCanPlay={handleVideoCanPlay}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-3xl">
              📹
            </div>
          )}
        </div>
        <div className="text-xs text-center mt-1 text-white truncate">
          {video.name}
        </div>
      </div>
    </Draggable>
  );
};
