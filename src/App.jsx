import { useEffect, useRef } from "react";
import "./App.css";
import CoconutScene from "./components/coconut-scene";
import gsap from "gsap";
import { ReactLenis } from "lenis/react";
import { Canvas } from "@react-three/fiber";

function App() {
  const lenisRef = useRef();

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <main className=" w-full border-2 ">
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
      {/* <h1 className='text-red-400'>Coconut Scene</h1> */}

      <div className=" fixed w-full h-screen  model-section">
        <Canvas>
          <CoconutScene />
        </Canvas>
      </div>
      <section>
        <h1>Section 1</h1>
      </section>
      <section>
        <h1>Section 2</h1>
      </section>
      <section>
        <h1>Section 3</h1>
      </section>
      <section>
        <h1>Section 4</h1>
      </section>
      <section>
        <h1>Section 5</h1>
      </section>
    </main>
  );
}

export default App;
