import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";

interface AudioRegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (audioUrl: string) => void;
  defaultText?: string;
  referenceAudioUrl?: string;
  defaultDuration?: number;
}

interface RegenerateRequest {
  text: string;
  reference_audio_url: string;
  duration: number;
  seed: number | null;
  temperature: number;
  cfg_scale: number;
  top_p: number;
}

interface RegenerateResponse {
  success: boolean;
  message: string;
  audio_url: string;
  audio_data: string;
  duration: number;
  generation_time: number;
  parameters_used: Record<string, unknown>;
}

export const AudioRegenerationModal = ({
  isOpen,
  onClose,
  onApply,
  defaultText = "",
  referenceAudioUrl = "",
  defaultDuration = 0,
}: AudioRegenerationModalProps) => {
  const [text, setText] = useState(defaultText);
  const [duration, setDuration] = useState(defaultDuration);
  const [seed, setSeed] = useState<number | null>(null);
  const [temperature, setTemperature] = useState([1.3]);
  const [cfgScale, setCfgScale] = useState([3]);
  const [topP, setTopP] = useState([0.95]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim() || !referenceAudioUrl) return;

    setIsGenerating(true);
    setGeneratedAudioUrl(null);

    try {
      const requestData: RegenerateRequest = {
        text: text.trim(),
        reference_audio_url: referenceAudioUrl,
        duration,
        seed,
        temperature: temperature[0],
        cfg_scale: cfgScale[0],
        top_p: topP[0],
      };

      const response = await fetch('https://bsfaq0q62wz2dh-8000.proxy.runpod.net/regenerate-segment', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result: RegenerateResponse = await response.json();
      
      if (result.success && result.audio_url) {
        setGeneratedAudioUrl(result.audio_url);
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!generatedAudioUrl) return;

    if (!audioElement) {
      const audio = new Audio(generatedAudioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleApply = () => {
    if (generatedAudioUrl) {
      onApply(generatedAudioUrl);
      onClose();
    }
  };

  const handleClose = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      setAudioElement(null);
    }
    setGeneratedAudioUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Regenerate Audio Segment</DialogTitle>
        <DialogDescription>
          Customize parameters to regenerate this audio segment
        </DialogDescription>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text to generate audio for..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              max={60}
            />
          </div>

          <div>
            <Label htmlFor="seed">Seed (optional)</Label>
            <Input
              id="seed"
              type="number"
              value={seed || ""}
              onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : null)}
              placeholder="Leave empty for random"
            />
          </div>

          <div>
            <Label>Temperature: {temperature[0]}</Label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={2}
              min={0.1}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>CFG Scale: {cfgScale[0]}</Label>
            <Slider
              value={cfgScale}
              onValueChange={setCfgScale}
              max={10}
              min={1}
              step={0.5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Top P: {topP[0]}</Label>
            <Slider
              value={topP}
              onValueChange={setTopP}
              max={1}
              min={0.1}
              step={0.05}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            onClick={handleGenerate}
            disabled={!text.trim() || !referenceAudioUrl || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Generate
          </Button>

          {generatedAudioUrl && (
            <>
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button onClick={handleApply} variant="default">
                Apply
              </Button>
            </>
          )}

          <Button onClick={handleClose} variant="outline" className="ml-auto">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 