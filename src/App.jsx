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
import Nutrients from "./components/Nutrients";
import Loader from "./components/Loader";
import { SplitText } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);

function App() {
  const lenisRef = useRef();
  const [animProgress, setAnimProgress] = useState(0);

  const [screenReady, setScreenReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const heroAnimTl = useRef(null);

  useEffect(() => {
    heroAnimTl.current = gsap.timeline({ paused: true });

    const split = SplitText.create(".hero-title", {
      type: "words",
      // autoSplit: true,
      mask: "words",
      onSplit(self) {
        console.log("self", self);
        const animation = gsap.from(self.words, {
          yPercent: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.1,

          rotate: 10,
          ease: "power3.out",
          // paused: true,
        });

        heroAnimTl.current.clear();
        heroAnimTl.current.add(animation, 0);
        // heroAnimTl.current.play();

        return animation;
      },
    });

    return () => {
      split.revert();
      heroAnimTl.current?.kill();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreenReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleOnComplete = () => {
    setIsLoading(false);
    heroAnimTl.current.play();
    // setTime
  };

  return (
    <>
      {isLoading ? (
        <Loader sceneReady={screenReady} onComplete={handleOnComplete} />
      ) : null}
      <main className="relative  overflow-x-hidden">
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
          <div className="h-20" />

          <HeroSection />
          <Source />
          <Nutrients />
          <section className="h-screen">
            <h1>Section 2</h1>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
