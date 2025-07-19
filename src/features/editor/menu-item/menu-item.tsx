"use client";

import useLayoutStore from "../store/use-layout-store";
import { Texts } from "./texts";
import { Audios } from "./audios";
import { Elements } from "./elements";
import { Images } from "./images";
import { Videos } from "./videos";
import { VoiceCloneProps } from "../interfaces/voice-clone";

const ActiveMenuItem = ({ voiceCloneData }: VoiceCloneProps) => {
  const { activeMenuItem } = useLayoutStore();

  if (activeMenuItem === "texts") {
    return <Texts />;
  }
  if (activeMenuItem === "shapes") {
    return <Elements />;
  }
  if (activeMenuItem === "videos") {
    return <Videos voiceCloneData={voiceCloneData} />;
  }

  if (activeMenuItem === "audios") {
    return <Audios voiceCloneData={voiceCloneData} />;
  }

  if (activeMenuItem === "images") {
    return <Images />;
  }

  return null;
};

export const MenuItem: React.FC<VoiceCloneProps> = ({ voiceCloneData }) => {
  return (
    <div className="w-[300px] flex-1">
      <ActiveMenuItem voiceCloneData={voiceCloneData} />
    </div>
  );
};
