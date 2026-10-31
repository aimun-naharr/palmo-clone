import React from "react";
import HeroCoconutTree from "../HeroCoconutTree";
import HeroArrow from "../HeroArrow";

const HeroSection = () => {
  return (
    <section className="w-full mt-[4vw] h-[80vh]  relative">
      <h1 className="font-5  flex flex-col leading-[0.8] uppercase text-[9vw]   tracking-tighter text-foreground ">
        <div className="hero-title   h-max overflow-hidden">Paradise in</div>{" "}
        <br />
        <div className="hero-title    h-auto  -mt-[6.5vw] overflow-hidden">
          Every sip
        </div>
      </h1>
      <div className="absolute top-[50%] w-[100px] left-1/3">
        <HeroArrow />
      </div>
      <div className="absolute top-[65%]  left-1/3 font-7 text-foreground">
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
