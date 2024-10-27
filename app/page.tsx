"use client";

import Progress from "./components/Progress";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-row">
      <section className="w-1/3 h-full bg-white">
        <Progress />
      </section>
      <section className="w-2/3 h-full bg-black"></section>
    </div>
  );
}
