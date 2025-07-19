import useStore from "../store/use-store";
import { useEffect, useRef, useState } from "react";

const SceneEmpty = () => {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [desiredSize, setDesiredSize] = useState({ width: 0, height: 0 });
  const { size } = useStore();

  useEffect(() => {
    const container = containerRef.current!;
    const PADDING = 96;
    const containerHeight = container.clientHeight - PADDING;
    const containerWidth = container.clientWidth - PADDING;
    const { width, height } = size;

    const desiredZoom = Math.min(
      containerWidth / width,
      containerHeight / height,
    );
    setDesiredSize({
      width: width * desiredZoom,
      height: height * desiredZoom,
    });
    setIsLoading(false);
  }, [size]);

  return (
    <div ref={containerRef} className="absolute z-50 flex h-full w-full flex-1">
      {!isLoading ? (
        <div className="h-full w-full flex-1 bg-background flex items-center justify-center">
          <div
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center border border-dashed border-white/15 text-center"
            style={{
              width: desiredSize.width,
              height: desiredSize.height,
            }}
          >
            <div className="flex flex-col items-center justify-center gap-4 pb-12">
              <div className="text-lg text-muted-foreground">
                Empty Canvas
              </div>
              <div className="text-sm text-muted-foreground/70">
                Add elements from the sidebar to get started
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-background-subtle text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
};

export default SceneEmpty;
