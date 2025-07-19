import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "./features/editor";
import useDataState from "./features/editor/store/use-data-state";
import { getCompactFontData } from "./features/editor/utils/fonts";
import { FONTS } from "./features/editor/data/fonts";
import { useVoiceClone } from "./features/editor/hooks/use-voice-clone";

export default function App() {
  const { id } = useParams<{ id?: string }>();
  const { setCompactFonts, setFonts } = useDataState();
  const { 
    data, 
    loading, 
    error, 
    videoUrl, 
    reconstructionData, 
    reconstructionLoading, 
    reconstructionError 
  } = useVoiceClone(id);

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  return <Editor voiceCloneData={{ 
    data, 
    loading, 
    error, 
    videoUrl, 
    reconstructionData, 
    reconstructionLoading, 
    reconstructionError 
  }} />;
}
