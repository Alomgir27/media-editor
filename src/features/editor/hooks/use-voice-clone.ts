import { useState, useEffect } from "react";
import { UseVoiceCloneReturn, ReconstructionSummary } from "../interfaces/voice-clone";

export const useVoiceClone = (audioId: string | undefined): UseVoiceCloneReturn => {
  const [data, setData] = useState<UseVoiceCloneReturn['data']>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconstructionData, setReconstructionData] = useState<ReconstructionSummary | null>(null);
  const [reconstructionLoading, setReconstructionLoading] = useState(false);
  const [reconstructionError, setReconstructionError] = useState<string | null>(null);

  const fetchVoiceCloneData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/voice-clone/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      
      const result = await response.json();
      setData(result);
      
      if (result.status === 'completed' && result.details?.segment_details?.has_reconstruction_summary) {
        const reconstructionUrl = result.details?.r2_storage?.segment_urls?.metadata?.['reconstruction_summary.json'];
        if (reconstructionUrl) {
          await fetchReconstructionSummary(reconstructionUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReconstructionSummary = async (url: string) => {
    try {
      setReconstructionLoading(true);
      setReconstructionError(null);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      
      const result = await response.json();
      setReconstructionData(result);
    } catch (err) {
      setReconstructionError(err instanceof Error ? err.message : 'Failed to fetch reconstruction');
    } finally {
      setReconstructionLoading(false);
    }
  };

  useEffect(() => {
    if (audioId) fetchVoiceCloneData(audioId);
  }, [audioId]);

  const videoUrl = data?.details.processing_details.original_audio.source_url || null;

  return {
    data,
    loading,
    error,
    videoUrl,
    reconstructionData,
    reconstructionLoading,
    reconstructionError,
  };
}; 