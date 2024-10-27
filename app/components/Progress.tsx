"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type ProgressItemProps = {
  label: string;
  description: string;
  isHighlighted?: boolean;
  isLast?: boolean;
  isHovered: boolean;
  onHover: (index: number) => void;
  index: number;
};

const ProgressItem = ({
  label,
  description,
  isHighlighted = false,
  isLast = false,
  isHovered,
  onHover,
  index,
}: ProgressItemProps) => {
  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}
    >
      <div
        className={`px-2 py-1 text-xs font-medium rounded-sm mb-2 ${
          isHighlighted || isHovered
            ? "bg-orange-500 text-white"
            : "bg-white text-gray-700 border border-gray-300"
        }`}
      >
        {label}
      </div>
      <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 z-10"></div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full mt-2 p-2 bg-white border border-gray-300 rounded shadow-lg z-20 w-48 overflow-hidden"
          >
            <p className="text-sm text-gray-700 text-center">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Progress() {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleHover = (index: number) => {
    setHoveredIndex(index);
  };

  const totalItems = 3;

  const getNodePosition = (index: number) => {
    return index === 0 ? 0 : index === totalItems - 1 ? 100 : 50;
  };

  if (!isMounted) {
    return null; // or a loading placeholder
  }

  return (
    <div className="w-full p-4 min-h-screen flex flex-col justify-center items-center relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2">
        <div
          className="absolute top-0 left-0 w-full bg-black transition-all duration-300 ease-in-out"
          style={{
            height:
              hoveredIndex >= 0 ? `${getNodePosition(hoveredIndex)}%` : "0%",
          }}
        ></div>
      </div>
      <div className="space-y-48 flex flex-col items-center">
        <ProgressItem
          label="GEN 1"
          description="First generation Progress item. Represents the initial phase of the project."
          isHovered={hoveredIndex === 0}
          onHover={handleHover}
          index={0}
        />
        <ProgressItem
          label="GEN 2"
          description="Second generation Progress item. Shows the intermediate phase of development."
          isHovered={hoveredIndex === 1}
          onHover={handleHover}
          index={1}
        />
        <ProgressItem
          label="GEN 3"
          description="Third generation Progress item. Indicates the most recent or current phase."
          isHighlighted
          isLast
          isHovered={hoveredIndex === 2}
          onHover={handleHover}
          index={2}
        />
      </div>
    </div>
  );
}
