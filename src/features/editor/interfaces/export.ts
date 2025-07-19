import { IDesign } from "@designcombo/types";
import { ReconstructionSummary, VoiceCloneData } from "./voice-clone";
import { AudioMode } from "./layout";

export interface VoiceCloneExportData extends IDesign {
  // Voice clone specific data
  voiceClone?: {
    audioId?: string;
    originalData?: VoiceCloneData['data'];
    reconstructionData?: ReconstructionSummary;
    videoUrl?: string;
  };
  
  // Audio preferences at export time
  audioPreferences: {
    activeAudioMode: AudioMode;
    instrumentsEnabled: boolean;
  };
  
  // Enhanced track items with voice clone metadata
  enhancedTrackItems: {
    [id: string]: {
      voiceCloneMetadata?: {
        segmentIndex?: number;
        speaker?: string;
        originalText?: string;
        englishText?: string;
        confidence?: number;
        segmentUrl?: string;
        audioType?: "instruments" | "vocal" | "cloned";
        isVoiceCloneGenerated?: boolean;
      };
      positioning: {
        originalFrom: number;
        originalTo: number;
        currentFrom: number;
        currentTo: number;
        duration: number;
        positionChanged: boolean;
        durationChanged: boolean;
      };
      playbackSettings: {
        volume: number;
        playbackRate: number;
        trim?: {
          from: number;
          to: number;
        };
      };
    };
  };
  
  // Timeline state
  timelineState: {
    totalDuration: number;
    currentTime: number;
    zoomLevel: number;
    viewportSettings: {
      scrollLeft: number;
      scrollTop: number;
    };
  };
  
  // Export metadata
  exportMetadata: {
    exportedAt: string;
    projectName: string;
    version: string;
  };
} 