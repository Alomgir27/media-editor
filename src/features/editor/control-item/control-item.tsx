import React from "react";
import {
  IAudio,
  ICaption,
  IImage,
  IText,
  ITrackItem,
  ITrackItemAndDetails,
  IVideo,
} from "@designcombo/types";
import { useEffect, useState } from "react";
import BasicText from "./basic-text";
import BasicImage from "./basic-image";
import BasicVideo from "./basic-video";
import BasicAudio from "./basic-audio";
import useStore from "../store/use-store";
import useLayoutStore from "../store/use-layout-store";
import BasicCaption from "./basic-caption";
import { LassoSelect, ChevronLeft, ChevronRight } from "lucide-react";

const Container = ({ children }: { children: React.ReactNode }) => {
  const { activeIds, trackItemsMap, trackItemDetailsMap } = useStore();
  const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
  const { 
    setTrackItem: setLayoutTrackItem, 
    isControlPanelCollapsed, 
    setIsControlPanelCollapsed 
  } = useLayoutStore();

  useEffect(() => {
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const trackItemDetails = trackItemDetailsMap[id];
      const trackItem = {
        ...trackItemsMap[id],
        details: trackItemDetails?.details || {},
      };
      if (trackItemDetails) {
        setTrackItem(trackItem);
        setLayoutTrackItem(trackItem);
      }
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [activeIds, trackItemsMap, trackItemDetailsMap]);

  const toggleCollapse = () => {
    setIsControlPanelCollapsed(!isControlPanelCollapsed);
  };
  useEffect(() => {
    if (activeIds.length === 0) {
      setTrackItem(null);
      setLayoutTrackItem(null);
    } else {
      setIsControlPanelCollapsed(false);
    }
  }, [activeIds]);

  return (
    <div className={`flex ${isControlPanelCollapsed ? 'w-[48px]' : 'w-[272px]'} flex-none border-l border-border/80 bg-sidebar transition-all duration-300 ease-in-out overflow-hidden`}>
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center p-3 border-b border-border/80 min-h-[58px]">
          {!isControlPanelCollapsed && (
            <span className="text-sm font-semibold text-primary">Properties</span>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md hover:bg-background/50 transition-colors flex items-center justify-center"
          >
            {isControlPanelCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        
        {isControlPanelCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <span 
              className="text-xs font-medium text-muted-foreground"
              style={{ 
                writingMode: 'vertical-rl', 
                textOrientation: 'mixed',
                letterSpacing: '0.1em'
              }}
            >
              Properties
            </span>
          </div>
        )}
        
        {!isControlPanelCollapsed && (
          <div className="flex-1 overflow-y-auto">
            {React.cloneElement(children as React.ReactElement<{trackItem?: ITrackItem | null}>, {
              trackItem,
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ActiveControlItem = ({
  trackItem,
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  if (!trackItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <LassoSelect />
        <span className="text-zinc-500 text-center text-sm">No item selected</span>
      </div>
    );
  }
  return (
    <>
      {
        {
          text: <BasicText trackItem={trackItem as ITrackItem & IText} />,
          caption: (
            <BasicCaption trackItem={trackItem as ITrackItem & ICaption} />
          ),
          image: <BasicImage trackItem={trackItem as ITrackItem & IImage} />,
          video: <BasicVideo trackItem={trackItem as ITrackItem & IVideo} />,
          audio: <BasicAudio trackItem={trackItem as ITrackItem & IAudio} />,
        }[trackItem.type as "text"]
      }
    </>
  );
};

export const ControlItem = () => {
  return (
    <Container>
      <ActiveControlItem />
    </Container>
  );
};
