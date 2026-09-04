"use client";

import { useState } from "react";
import Preloader from "./Preloader";
import SmoothScroll from "./SmoothScroll";
import Navbar from "./Navbar";
import CustomCursor from "./CustomCursor";
import Footer from "./Footer";
import ScrollScrubVideo from "@/components/video/ScrollScrubVideo";
import Transition from "@/components/sections/Transition";
import Intro from "@/components/sections/Intro";
import ModelChapter from "@/components/sections/ModelChapter";
import Countdown from "@/components/sections/Countdown";
import World from "@/components/sections/World";
import Characters from "@/components/sections/Characters";
import TrailerCinema from "@/components/sections/TrailerCinema";
import Gallery from "@/components/sections/Gallery";
import Info from "@/components/sections/Info";
import Platforms from "@/components/sections/Platforms";
import Hardware from "@/components/sections/Hardware";
import Requirements from "@/components/sections/Requirements";
import Timeline from "@/components/sections/Timeline";
import News from "@/components/sections/News";
import FinalMoment from "@/components/sections/FinalMoment";

export default function HomeExperience() {
  const [loaded, setLoaded] = useState(false);

  return (
    <SmoothScroll>
      <Preloader onDone={() => setLoaded(true)} />
      <CustomCursor />
      <Navbar />
      <main
        className={`transition-opacity duration-1000 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <ScrollScrubVideo />
        <Transition />
        <Intro />
        <ModelChapter />
        <Countdown />
        <World />
        <Characters />
        <TrailerCinema />
        <Gallery />
        <Info />
        <Platforms />
        <Hardware />
        <Requirements />
        <Timeline />
        <News />
        <FinalMoment />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
