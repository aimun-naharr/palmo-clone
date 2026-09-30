import { cn } from "cn";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
// gsap.registerPlugin(MotionPathPlugin);

const nutrients = [
  {
    description: "of Potassium",
    quantity: "500",
    unit: "mg",
  },
  {
    description: "Natural Hydration",
    quantity: "100%",
    unit: null,
  },
  {
    description: "of sugar",
    quantity: "0",
    unit: "gm",
  },
  {
    description: "per 200Ml",
    quantity: "45",
    unit: "kcl",
  },
];

const Nutrients = () => {
  const boxesRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      boxesRef.current.forEach((box) => {
        if (!box) return;

        const side = box.dataset.side;

        const path = side === "left" ? "#leftPath" : "#rightPath";

        gsap.to(box, {
          motionPath: {
            path,
            align: path,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
          },

          ease: "none",

          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-4 relative border-2 border-red-500 h-[140vh] w-[80%] mx-auto">
      {/* Left arc */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 2416 4547"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          id="left-path"
          d="M2415.5 3.5
         C2415.5 3.5 3.4999 3.49989 3.4999 2273.5
         C3.4999 4543.5 2415.5 4543.5 2415.5 4543.5"
          stroke="black"
          strokeWidth="7"
        />
      </svg>

      {/* Right arc */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 2412 4547"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          id="right-path"
          d="M0 4543.5
         C0 4543.5 2412 4543.5 2412 2273.5
         C2412 3.5 0 3.5 0 3.5"
          stroke="black"
          strokeWidth="7"
        />
      </svg>

      {nutrients.map((itm, i) => {
        const dark = i == 1 || i == 2;
        const isLeft = i % 2 === 0 ? true : false;
        return (
          <div
            key={itm.description}
            ref={(el) => {
              boxesRef.current[i] = el;
            }}
            className={cn(
              "size-[250px] rounded-full border-[4px] flex flex-col items-center justify-center absolute",
              {
                "bg-coconut text-banana border-banana": dark,
                "bg-banana text-foreground border-foreground": !dark,
              },
            )}
            data-side={isLeft ? "left" : "right"}
          >
            <h4 className="font-4  font-bold ">
              <span className=" text-6xl">{itm.quantity}</span>
              {itm.unit ? (
                <span className="uppercase text-4xl">{itm.unit}</span>
              ) : null}
            </h4>
            <span className="text-xl font-medium tracking-tight">
              {itm.description}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Nutrients;
