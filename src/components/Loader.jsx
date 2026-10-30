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
  const barRef = useRef(null);
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
            stripRefs.current[i].style.transform = stripTransform(roll.value);
          },
        });
      });

      barRef.current.style.transform = `scaleX(${value / 100})`;
    };

    const exit = () => {
      const tl = gsap.timeline();
      tl.to(textcontainer.current, {
        y: "100%",
        delay: ROLL_DURATION, // lets the last digit land on 100 first
        duration: 1.5,
        ease: "power4.inOut",
        onComplete,
      })
        .to(
          darkLeft.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
            onComplete,
          },
          "a",
        )
        .to(
          darkRight.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
            onComplete,
          },
          "a",
        )
        .to(
          lightLeft.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
            onComplete,
          },
          "-=1.2",
        )
        .to(
          lightRight.current,
          {
            width: 0,
            duration: 1.5,
            ease: "power4.inOut",
            onComplete,
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

      {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60">
        <svg
          viewBox="0 0 554 588"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="block h-full w-full overflow-visible"
        >
          <g
            data-lean="true"
            data-svg-origin="300 560"
            transform="matrix(0.99629,0.08608,-0.08608,0.99629,63.1453,-25.3295)"
            style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
          >
            <g
              data-crown="true"
              data-svg-origin="300 560"
              transform="matrix(0.99925,0.03878,-0.03878,0.99925,16.7782,-10.4064)"
              style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
            >
              <path
                data-leaf="true"
                d="M276.9 249.322L245.035 358.522L218.104 349.667L239.372 377.927L200.966 509.509C167.804 469.088 154.52 411.898 170.563 356.94C186.604 301.952 228.007 262.772 276.9 249.322Z"
                fill="#FFE386"
                data-svg-origin="277 233"
                transform="matrix(0.99999,0.0042,-0.0042,0.99999,0.98137,-1.16107)"
                style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
              ></path>
              <path
                data-leaf="true"
                d="M103.415 207.766C157.405 181.329 218.871 187.303 273.502 218.22L111.253 297.676L93.7865 257.119L90.1138 308.033L2.44079e-05 352.169C13.6111 287.814 49.4243 234.204 103.415 207.766Z"
                fill="#FFE386"
                data-svg-origin="277 233"
                transform="matrix(1,-0.00077,0.00077,1,-0.17941,0.21329)"
                style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
              ></path>
              <path
                data-leaf="true"
                d="M208.565 116.324L163.197 142.072L124.48 120.504L144.267 80.4888L98.9187 106.247L18.5067 61.4334C67.6015 24.6383 133.909 17.6759 190.768 49.3588C247.628 81.052 279.895 142.964 279.238 206.757L188.778 156.327L208.565 116.324Z"
                fill="#FFE386"
                data-svg-origin="277 233"
                transform="matrix(1,0,0,1,0,0)"
                style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
              ></path>
              <path
                data-leaf="true"
                d="M396.393 62.3739L422.723 91.8752L302.498 212.828C288.192 156.793 303.813 92.8834 347.994 48.4469C392.172 4.00119 453.144 -9.11952 505.07 9.05494L442.601 71.8976L396.393 62.3739Z"
                fill="#FFE386"
                data-svg-origin="277 233"
                transform="matrix(0.99947,-0.03242,0.03242,0.99947,-7.40705,9.10383)"
                style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
              ></path>
              <path
                data-leaf="true"
                d="M453.656 172.446C505.236 188.06 541.998 231.991 553.217 283.818L494.986 266.187L485.685 236.307L478.98 261.357L426.871 245.588L416.035 210.724L408.197 239.944L313.736 211.373C349.017 173.619 402.059 156.851 453.656 172.446Z"
                fill="#FFE386"
                data-svg-origin="277 233"
                transform="matrix(0.99941,0.03425,-0.03425,0.99941,8.14368,-9.34978)"
                style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px;"
              ></path>
              <path
                d="M291.272 233.752L312.996 223.029C391.719 410.788 337.783 853.463 337.783 853.463L267.028 820.022C325.93 605.308 299.765 276.926 291.272 233.752Z"
                fill="#FFE386"
              ></path>
            </g>
          </g>
        </svg>
      </div> */}

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
      <div
        ref={barRef}
        className="absolute bottom-0 left-0 h-1 w-full origin-left bg-foreground"
        style={{ transform: "scaleX(0.01)" }}
      />
    </div>
  );
};

export default Loader;
