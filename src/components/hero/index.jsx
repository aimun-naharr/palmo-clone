import React from "react";
import HeroCoconutTree from "../HeroCoconutTree";
import HeroArrow from "../HeroArrow";

const HeroSection = () => {
  return (
    <section className="w-full mt-[4vw]  relative">
      <h1 className="font-5 flex flex-col gap-[2.5vw] uppercase text-[9vw]  tracking-tighter text-foreground">
        <span>Paradise in</span> <br />
        <span>Every sip</span>
      </h1>
      <div className="absolute top-[40%] w-[100px] left-1/3">
        <HeroArrow />
      </div>
      <div className="absolute top-[50%]  left-1/3 font-6 text-foreground">
        <ul className="list-disc">
          <li>Rich in electrolytes</li>
          <li>No Added Sugar</li>
        </ul>
      </div>

      <p className="text-xl font-3 tracking-tighter w-md text-foreground absolute right-0 leading-relaxed top-[60%] font-semibold">
        Quench Your Thirst With Pure Coconut Bliss, Packed With Natural
        Electrolytes And Zero Added Sugar, For A Cool Sip Every Time.
      </p>
    </section>
  );
};

export default HeroSection;
