"use client";

import React, { useState } from "react";
import Progress from "./components/Progress";
import Chat from "./components/Chat";

interface Generation {
  id: number;
  content: string;
  label: string;
  thought: string;
}

export default function Home() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [hoveredGenerationId, setHoveredGenerationId] = useState(-1);

  return (
    <div className="w-full h-screen flex flex-row overflow-hidden ">
      <section className="w-1/2 h-full overflow-hidden">
        <Progress
          generations={generations}
          hoveredGenerationId={hoveredGenerationId}
          setHoveredGenerationId={setHoveredGenerationId}
        />
      </section>
      <section className="w-1/2 h-full overflow-y-auto border-l-[1px] border-[#969696]">
        <Chat
          generations={generations}
          setGenerations={setGenerations}
          hoveredGenerationId={hoveredGenerationId}
          setHoveredGenerationId={setHoveredGenerationId}
        />
      </section>
    </div>
  );
}
