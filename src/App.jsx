import { useEffect, useRef, useState } from "react";
import "./App.css";
import CoconutScene from "./components/coconut-scene";
import gsap from "gsap";
import { ReactLenis } from "lenis/react";
import { Canvas } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "./components/hero";
import HeroCoconutTree from "./components/HeroCoconutTree";
import Source from "./components/Source";
gsap.registerPlugin(ScrollTrigger);

function App() {
  const lenisRef = useRef();
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(update);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".coconut-scene",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        // pin: true,

        onUpdate: (self) => {
          setAnimProgress(self.progress);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="relative border overflow-x-hidden">
      <div className=" fixed w-full h-screen  model-section">
        <Canvas>
          <CoconutScene progress={animProgress} />
        </Canvas>
      </div>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
      <div className="w-[550px] absolute -right-10 -rotate-40 top-24">
        <HeroCoconutTree />
      </div>
      <div className=" w-full  coconut-scene bg-background  center-layout">
        {/* <h1 className='text-red-400'>Coconut Scene</h1> */}
        <div className="h-20" />

        <HeroSection />
        <Source />
        <section className="h-screen">
          <h1>Section 2</h1>
        </section>
        <section className="h-screen">
          <h1>Section 3</h1>
        </section>
        {/* <section>
        <h1>Section 4</h1>
      </section>
      <section>
        <h1>Section 5</h1>
      </section> */}
      </div>
    </main>
  );
}

export default App;
