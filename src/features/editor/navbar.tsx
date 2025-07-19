"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dispatch } from "@designcombo/events";
import { HISTORY_UNDO, HISTORY_REDO, DESIGN_RESIZE } from "@designcombo/state";
import { Icons } from "@/components/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Download, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import type StateManager from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IDesign } from "@designcombo/types";
import { useDownloadState } from "./store/use-download-state";
import DownloadProgressModal from "./download-progress-modal";
import AutosizeInput from "@/components/ui/autosize-input";
import { VoiceCloneExportData } from "./interfaces/export";
import { VoiceCloneProps } from "./interfaces/voice-clone";
import useLayoutStore from "./store/use-layout-store";
import useStore from "./store/use-store";

export default function Navbar({
  stateManager,
  projectName,
  voiceCloneData,
}: {
  user: null;
  stateManager: StateManager;
  setProjectName: (name: string) => void;
  projectName: string;
  voiceCloneData?: VoiceCloneProps['voiceCloneData'];
}) {
  const [title, setTitle] = useState(projectName);

  const handleBack = () => {
    // Add your back navigation logic here
  };

  const handleUndo = () => {
    dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatch(HISTORY_REDO);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 320px",
      }}
      className="bg-sidebar pointer-events-none flex h-[58px] items-center border-b border-border/80 px-2"
    >
      <DownloadProgressModal />

      <div className="flex items-center gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center px-1.5">
          <Button
            onClick={handleBack}
            className="flex h-8 gap-1 border border-border"
            variant="outline"
          >
            <ArrowLeft width={18} /> Back
          </Button>
          <Button
            onClick={handleUndo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={20} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={20} />
          </Button>
        </div>
      </div>

      <div className="flex h-14 items-center justify-center gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5 text-muted-foreground">
          <AutosizeInput
            name="title"
            value={title}
            onChange={handleTitleChange}
            width={200}
            inputClassName="border-none outline-none px-1 bg-background text-sm font-medium text-zinc-200"
          />
        </div>
      </div>

      <div className="flex h-14 items-center justify-end gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5">
          <ResizeVideo />
          <DownloadPopover stateManager={stateManager} voiceCloneData={voiceCloneData} />
        </div>
      </div>
    </div>
  );
}

const DownloadPopover = ({ 
  stateManager, 
  voiceCloneData 
}: { 
  stateManager: StateManager; 
  voiceCloneData?: VoiceCloneProps['voiceCloneData'];
}) => {
  const { actions, exportType } = useDownloadState();
  const [isExportTypeOpen, setIsExportTypeOpen] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { activeAudioMode, instrumentsEnabled } = useLayoutStore();
  const { trackItemsMap, trackItemDetailsMap, playerRef, duration, scale, scroll } = useStore();

  const createEnhancedExportData = (): VoiceCloneExportData => {
    const baseData: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };

    // Get current player time
    const currentTime = playerRef?.current?.getCurrentFrame() 
      ? (playerRef.current.getCurrentFrame() / 30) * 1000 
      : 0;

    // Process track items with voice clone metadata
    const enhancedTrackItems: VoiceCloneExportData['enhancedTrackItems'] = {};
    
    Object.keys(trackItemsMap).forEach(id => {
      const trackItem = trackItemsMap[id];
      const details = trackItemDetailsMap[id]?.details || {};
      
      // Extract voice clone metadata if available
      const voiceCloneMetadata = trackItem.metadata ? {
        segmentIndex: trackItem.metadata.segmentIndex,
        speaker: trackItem.metadata.speaker,
        originalText: trackItem.metadata.originalText,
        englishText: trackItem.metadata.englishText,
        confidence: trackItem.metadata.confidence,
        segmentUrl: trackItem.metadata.segmentUrl,
        audioType: trackItem.metadata.audioType,
        isVoiceCloneGenerated: true,
      } : undefined;

      enhancedTrackItems[id] = {
        voiceCloneMetadata,
        positioning: {
          originalFrom: trackItem.display?.from || 0,
          originalTo: trackItem.display?.to || 0,
          currentFrom: trackItem.display?.from || 0,
          currentTo: trackItem.display?.to || 0,
          duration: trackItem.duration || 0,
          positionChanged: false, // TODO: Track if position was changed from original
          durationChanged: false, // TODO: Track if duration was changed from original
        },
        playbackSettings: {
          volume: details.volume || 100,
          playbackRate: trackItem.playbackRate || 1,
          trim: trackItem.trim,
        },
      };
    });

    const enhancedData: VoiceCloneExportData = {
      ...baseData,
      voiceClone: voiceCloneData ? {
        audioId: voiceCloneData.data?.audio_id,
        originalData: voiceCloneData.data,
        reconstructionData: voiceCloneData.reconstructionData,
        videoUrl: voiceCloneData.videoUrl,
      } : undefined,
      audioPreferences: {
        activeAudioMode,
        instrumentsEnabled,
      },
      enhancedTrackItems,
      timelineState: {
        totalDuration: duration,
        currentTime,
        zoomLevel: scale.zoom,
        viewportSettings: {
          scrollLeft: scroll.left,
          scrollTop: scroll.top,
        },
      },
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        projectName: "Voice Clone Project", // TODO: Get actual project name
        version: "1.0.0",
      },
    };

    return enhancedData;
  };

  const handleExport = () => {
    if (exportType === "json") {
      // For JSON export, create enhanced data and download directly
      const enhancedData = createEnhancedExportData();
      
      const jsonString = JSON.stringify(enhancedData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `voice-clone-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("Enhanced Export Data:", enhancedData);
    } else {
      // For MP4 export, use original flow but with enhanced data
      const enhancedData = createEnhancedExportData();
      actions.setState({ payload: enhancedData });
      actions.startExport();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex h-8 gap-1 border border-border"
          variant="outline"
        >
          <Download width={18} /> Export
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="bg-sidebar z-[250] flex w-60 flex-col gap-4"
      >
        <Label>Export settings</Label>

        <Popover open={isExportTypeOpen} onOpenChange={setIsExportTypeOpen}>
          <PopoverTrigger asChild>
            <Button className="w-full justify-between" variant="outline">
              <div>{exportType.toUpperCase()}</div>
              <ChevronDown width={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-background-subtle z-[251] w-[--radix-popover-trigger-width] px-2 py-2">
            <div
              className="flex h-8 items-center rounded-sm px-3 text-sm hover:cursor-pointer hover:bg-zinc-800"
              onClick={() => {
                actions.setExportType("mp4");
                setIsExportTypeOpen(false);
              }}
            >
              MP4
            </div>
            <div
              className="flex h-8 items-center rounded-sm px-3 text-sm hover:cursor-pointer hover:bg-zinc-800"
              onClick={() => {
                actions.setExportType("json");
                setIsExportTypeOpen(false);
              }}
            >
              JSON
            </div>
          </PopoverContent>
        </Popover>

        <div>
          <Button onClick={handleExport} className="w-full">
            Export
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ResizeOptionProps {
  label: string;
  icon: string;
  value: ResizeValue;
  description: string;
}

interface ResizeValue {
  width: number;
  height: number;
  name: string;
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: "16:9",
    icon: "landscape",
    description: "YouTube ads",
    value: {
      width: 1920,
      height: 1080,
      name: "16:9",
    },
  },
  {
    label: "9:16",
    icon: "portrait",
    description: "TikTok, YouTube Shorts",
    value: {
      width: 1080,
      height: 1920,
      name: "9:16",
    },
  },
  {
    label: "1:1",
    icon: "square",
    description: "Instagram, Facebook posts",
    value: {
      width: 1080,
      height: 1080,
      name: "1:1",
    },
  },
];

const ResizeVideo = () => {
  const handleResize = (options: ResizeValue) => {
    dispatch(DESIGN_RESIZE, {
      payload: {
        ...options,
      },
    });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="border border-border" variant="secondary">
          Resize
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[250] w-60 px-2.5 py-3">
        <div className="text-sm">
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={index}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
              description={option.description}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizeOption = ({
  label,
  icon,
  value,
  description,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon as "text"];
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex cursor-pointer items-center rounded-md p-2 hover:bg-zinc-50/10"
    >
      <div className="w-8 text-muted-foreground">
        <Icon size={20} />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
};
