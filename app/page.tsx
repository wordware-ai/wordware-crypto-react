"use client";

import React, { useState } from "react";
import Progress from "./components/Progress";
import Chat from "./components/Chat";

export default function Home() {
  const [generations, setGenerations] = useState<any[]>([]);

  return (
    <div className="w-full h-screen flex flex-row overflow-hidden ">
      <section className="w-1/3 h-full overflow-hidden">
        <Progress generations={generations} />
      </section>
      <section className="w-2/3 h-full overflow-y-auto ">
        <Chat setGenerations={setGenerations} />
      </section>
    </div>
  );
}
