"use client";
import Timeline from "./timeline";
import useStore from "./store/use-store";
import useLayoutStore from "./store/use-layout-store";
import Navbar from "./navbar";
import useTimelineEvents from "./hooks/use-timeline-events";
import Scene from "./scene";
import StateManager from "@designcombo/state";
import { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { getCompactFontData, loadFonts } from "./utils/fonts";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import { ControlItem } from "./control-item";
import CropModal from "./crop-modal/crop-modal";
import useDataState from "./store/use-data-state";
import { FONTS } from "./data/fonts";
import FloatingControl from "./control-item/floating-controls/floating-control";
import { VoiceCloneProps } from "./interfaces/voice-clone";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO, ADD_AUDIO } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";

const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});


const Editor: React.FC<VoiceCloneProps> = ({ voiceCloneData }) => {
  const [projectName, setProjectName] = useState<string>("Untitled video");
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { playerRef } = useStore();
  const { isControlPanelCollapsed } = useLayoutStore();

  useTimelineEvents();

  const { setCompactFonts, setFonts } = useDataState();
  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
  }, []);

  useEffect(() => {
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, []);

  const loadInstrumentsAudio = () => {
    if (!voiceCloneData?.data?.details?.uploaded_files?.instruments_audio?.url) {
      return;
    }
    
    try {
      const instrumentsUrl = voiceCloneData.data.details.uploaded_files.instruments_audio.url;
      const totalDuration = voiceCloneData?.data?.details?.processing_details?.original_audio?.duration || 30;
      
      const payload = {
        id: "instruments-audio",
        details: { src: instrumentsUrl },
        name: "Instruments Audio",
        type: "audio" as const,
        duration: totalDuration * 1000,
        display: {
          from: 0,
          to: totalDuration * 1000,
        },
        metadata: {
          author: "Voice Clone",
          speaker: "Instruments",
          audioType: "instruments",
        },
      };
      
      setTimeout(() => {
        try {
          dispatch(ADD_AUDIO, { payload, options: {} });
        } catch (dispatchError) {
          console.error("Error dispatching instruments audio:", dispatchError);
        }
      }, 1500);
      
    } catch (error) {
      console.error("Error loading instruments audio:", error);
    }
  };

  const loadVideo = async () => {
    if (!voiceCloneData?.videoUrl) return;
    const videoDuration = voiceCloneData?.data?.details?.processing_details?.original_audio?.duration || 1000000;
      const payload = {
        id: voiceCloneData.videoUrl?.split('/').pop()?.split('.')[0] || "source-video",
        details: { src: voiceCloneData.videoUrl },
        name: "Source Video",
        type: "video" as const,
        duration: videoDuration * 1000,
        preview: voiceCloneData.videoUrl,
      };
    dispatch(ADD_VIDEO, { payload, options: {} });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Load audio segments first, then instruments
    const loadAudioSegments = async () => {
      if (!voiceCloneData?.reconstructionData?.segments) return;
      
      const segments = voiceCloneData.reconstructionData.segments.reverse();
      
        segments.forEach((segment, index) => {
         setTimeout(() => {
           try {
             const payload = {
               id: segment.segment_url?.split('/').pop()?.split('.')[0] || generateId(),
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
             };
             dispatch(ADD_AUDIO, { payload, options: {} });
           } catch (error) {
             console.error(`Error loading audio segment ${index}:`, error);
           }
         }, index * 1500);
        });
       await new Promise(resolve => setTimeout(resolve, segments.length * 1500));
       loadInstrumentsAudio();
    };
    await loadAudioSegments()
  };

  useEffect(() => {
    if (voiceCloneData) {
        loadVideo();
    }
  }, [voiceCloneData]);

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desiredHeight = 300;
    const percentage = (desiredHeight / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  }, []);

  const handleTimelineResize = (size: number) => {
    const screenHeight = window.innerHeight;
    const percentage = (size / screenHeight) * 100;
    timelinePanelRef.current?.resize(percentage);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar 
        projectName={projectName} 
        setProjectName={setProjectName}
        user={null}
        stateManager={stateManager}
        voiceCloneData={voiceCloneData}
      />
      <div className="flex flex-1 h-full relative overflow-hidden">
        <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
          <ResizablePanel className="relative" defaultSize={70}>
            <FloatingControl />
            <div className="flex h-full flex-1">
              <div className="bg-sidebar flex flex-none border-r border-border/80">
                <MenuList />
                <MenuItem voiceCloneData={voiceCloneData} />
              </div>
              <div
                style={{
                  width: `calc(100% - ${isControlPanelCollapsed ? '48px' : '272px'})`,
                  height: "100%",
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                  transition: "width 300ms ease-in-out",
                }}
              >
                <CropModal />
                <Scene stateManager={stateManager} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="min-h-[320px]"
            ref={timelinePanelRef}
            defaultSize={30}
            onResize={handleTimelineResize}
          >
            {playerRef && <Timeline stateManager={stateManager} />}
          </ResizablePanel>
        </ResizablePanelGroup>
        <ControlItem />
      </div>
    </div>
  );
};

export default Editor;
