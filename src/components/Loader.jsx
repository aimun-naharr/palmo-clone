import { useRef } from "react";
import { DefaultLoadingManager } from "three";
import { useProgress } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const FONTS = [
  "font-1",
  "font-2",
  "font-3",
  "font-4",
  "font-5",
  "font-6",
  "font-7",
];
const IMAGES = ["/source.svg"];

// The last value the counter can show while assets are still loading.
// It only reaches 10 once everything is in, so 1 -> 10 covers all the loading.
const MAX_WHILE_LOADING = 15;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });

// Fonts and images go through the same manager as the 3D assets, so useProgress
// sees one list. A failed one still counts as finished, so it can't hang the loader.
const track = (name, load) => {
  DefaultLoadingManager.itemStart(name);
  load()
    .catch(() => {})
    .finally(() => DefaultLoadingManager.itemEnd(name));
};

FONTS.forEach((font) =>
  track(font, () => document.fonts.load(`1em "${font}"`)),
);
IMAGES.forEach((src) => track(src, () => loadImage(src)));

const Loader = ({ sceneReady = true, onComplete }) => {
  const { loaded, total } = useProgress();
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const counter = useRef({ value: 1 });

  const ready = sceneReady && loaded === total;
  const target = total ? 1 + (loaded / total) * (MAX_WHILE_LOADING - 1) : 1;

  useGSAP(() => {
    const render = () => {
      const { value } = counter.current;
      countRef.current.textContent = Math.round(value);
      barRef.current.style.transform = `scaleX(${value / 100})`;
    };

    const exit = () => {
      gsap.to(rootRef.current, {
        yPercent: -100,
        duration: 1.5,
        ease: "power4.inOut",
        onComplete,
      });
    };

    gsap.to(counter.current, {
      value: ready ? 100 : target,
      duration: ready ? 2.5 : 1.5,
      // ease: ready ? "power1.inOut" : "power1.out",
      overwrite: true,
      onUpdate: render,
      onComplete: ready ? exit : undefined,
    });
  }, [ready, target]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-end justify-end bg-background p-[5vw]"
    >
      <span
        ref={countRef}
        className="font-5 text-[14vw] leading-none tracking-tighter tabular-nums text-foreground"
      >
        1
      </span>
      <div
        ref={barRef}
        className="absolute bottom-0 left-0 h-1 w-full origin-left bg-foreground"
        style={{ transform: "scaleX(0.01)" }}
      />
    </div>
  );
};

export default Loader;
