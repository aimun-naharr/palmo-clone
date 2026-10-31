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
// It only goes past this once everything is in.
const MAX_WHILE_LOADING = 15;

const START_VALUE = 1;
const ROLL_DURATION = 0.6;
const PLACES = [100, 10, 1];
// Reads bottom to top, so sliding the strip down brings the next digit in from
// above. The extra 0 lets 9 roll on to 0 instead of back through every digit.
const DIGIT_STRIP = [0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

const stripTransform = (roll) =>
  `translateY(${-(10 - (roll % 10)) * (100 / DIGIT_STRIP.length)}%)`;

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
  const stripRefs = useRef([]);
  const counter = useRef({ value: START_VALUE });
  const textcontainer = useRef(null);
  const darkLeft = useRef(null);
  const darkRight = useRef(null);
  const lightLeft = useRef(null);
  const lightRight = useRef(null);

  // How far each place has rolled: 37 is 0 hundreds, 3 tens, 37 units.
  const rolls = useRef(
    PLACES.map((place) => {
      const start = Math.floor(START_VALUE / place);
      return { value: start, target: start };
    }),
  );

  const ready = sceneReady && loaded === total;
  const target = total ? 1 + (loaded / total) * (MAX_WHILE_LOADING - 1) : 1;

  useGSAP(() => {
    if (!counter.current) return;
    const render = () => {
      const { value } = counter.current;
      const whole = Math.round(value);

      PLACES.forEach((place, i) => {
        const roll = rolls.current[i];
        const next = Math.floor(whole / place);
        if (next === roll.target) return;

        roll.target = next;
        // Retargets the running tween, so a digit changing faster than the
        // roll takes keeps chasing the count instead of queueing up.
        gsap.to(roll, {
          value: next,
          duration: ROLL_DURATION,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => {
            const strip = stripRefs.current[i];

            if (!strip) return;

            strip.style.transform = stripTransform(roll.value);
          },
        });
      });

      // barRef.current.style.transform = `scaleX(${value / 100})`;
    };

    const exit = () => {
      if (!textcontainer.current) return;
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete?.();
        },
      });
      tl.to(textcontainer.current, {
        y: "100%",
        delay: ROLL_DURATION, // lets the last digit land on 100 first
        duration: 1.5,
        ease: "power4.inOut",
      })
        .to(
          darkLeft.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
          },
          "a",
        )
        .to(
          darkRight.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
          },
          "a",
        )
        .to(
          lightLeft.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
          },
          "-=1.2",
        )
        .to(
          lightRight.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
          },
          "<",
        );
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
      className="fixed inset-0  flex items-end justify-start  p-[5vw] z-60"
    >
      <div
        ref={darkLeft}
        className="absolute w-1/2 bg-foreground z-50 left-0 top-0 h-full"
      />
      <div
        ref={darkRight}
        className="absolute w-1/2 bg-foreground z-50 right-0 top-0 h-full"
      />

      <div
        ref={lightLeft}
        className="absolute w-1/2 bg-banana z-40 left-0 top-0 h-full"
      />
      <div
        ref={lightRight}
        className="absolute w-1/2 bg-banana z-40 right-0 top-0 h-full"
      />

      <div className="overflow-hidden w-full flex">
        <div
          ref={textcontainer}
          className="font-5 flex text-[10vw] leading-none text-banana z-60 "
        >
          {PLACES.map((place, i) => (
            <div key={place} className="h-[1em] w-[0.4em] overflow-hidden">
              <div
                ref={(el) => {
                  stripRefs.current[i] = el;
                }}
                style={{
                  transform: stripTransform(Math.floor(START_VALUE / place)),
                }}
              >
                {DIGIT_STRIP.map((digit, j) => (
                  <div key={j} className="h-[1em] text-center">
                    {digit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div
        ref={barRef}
        className="absolute bottom-0 left-0 h-1 w-full origin-left bg-foreground"
        style={{ transform: "scaleX(0.01)" }}
      /> */}
    </div>
  );
};

export default Loader;
