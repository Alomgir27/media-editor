export interface ReconstructionSegment {
  segment_url: string;
  start_time: number;
  duration: number;
  end_time: number;
  speaker: string;
  segment_index: number;
  original_text: string;
  english_text: string;
  confidence: number;
  word_count: number;
  cloned_filename: string;
  processing_status: string;
}

export interface ReconstructionSummary {
  audio_id: string;
  total_segments_used: number;
  final_duration: number;
  sample_rate: number;
  instruments_included: boolean;
  segments_by_speaker: Record<string, number>;
  segments: ReconstructionSegment[];
  reconstruction_timestamp: string;
}

export interface VoiceCloneData {
  data: {
    status: string;
    audio_id: string;
    details: {
      video_url: string;
      final_audio_url: string;
      uploaded_files?: {
        instruments_audio?: {
          url: string;
          size_mb: number;
          uploaded: boolean;
        };
        vocal_audio?: {
          url: string;
          size_mb: number;
          uploaded: boolean;
        };
        final_audio?: {
          url: string;
          size_mb: number;
          uploaded: boolean;
        };
        video?: {
          url: string;
          size_mb: number;
          uploaded: boolean;
        };
        subtitles?: {
          url: string;
          size_kb: number;
          uploaded: boolean;
        };
      };
      processing_details: {
        original_audio: {
          source_url: string;
          filename: string;
          duration: number;
        };
      };
      r2_storage: {
        segment_urls: {
          cloned: {
            speaker_A: Record<string, string>;
            speaker_B: Record<string, string>;
          };
        };
      };
    };
  } | null;
  loading: boolean;
  error: string | null;
  videoUrl: string | null;
  reconstructionData: ReconstructionSummary | null;
  reconstructionLoading: boolean;
  reconstructionError: string | null;
}

export interface UseVoiceCloneReturn {
  data: VoiceCloneData['data'];
  loading: boolean;
  error: string | null;
  videoUrl: string | null;
  reconstructionData: ReconstructionSummary | null;
  reconstructionLoading: boolean;
  reconstructionError: string | null;
}

export interface VoiceCloneProps {
  voiceCloneData: VoiceCloneData;
} 