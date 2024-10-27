"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Generation {
  label: string;
  thought: string;
  isCompleted?: boolean;
}

interface ProgressProps {
  generations: Generation[];
}

const ProgressItem: React.FC<{
  label: string;
  description: string;
  isHighlighted: boolean;
  isLast: boolean;
  isHovered: boolean;
  onHover: (index: number) => void;
  index: number;
}> = ({
  label,
  description,
  isHighlighted,
  isLast,
  isHovered,
  onHover,
  index,
}) => {
  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}
    >
      <div
        className={`px-2 py-1 text-xs font-medium rounded-sm mb-2 ${
          isHighlighted || isHovered
            ? "bg-green-500 text-white"
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
            className="absolute top-full mt-2 p-2 bg-white border border-gray-300 rounded shadow-lg z-20 w-[300px] overflow-hidden"
          >
            <p className="text-sm text-gray-700 text-center">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Progress: React.FC<ProgressProps> = ({ generations = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (generations.length > 3) {
      setCurrentIndex(generations.length - 3);
    }
  }, [generations.length]);

  const handleHover = (index: number) => {
    setHoveredIndex(index);
  };

  const items =
    generations.length > 0
      ? generations.map((gen, index) => ({
          label: gen.label,
          description: gen.thought,
          isHighlighted: index === generations.length - 1 && !gen.isCompleted,
          isLast: index === generations.length - 1,
        }))
      : [
          {
            label: "Start",
            description: "Initial state",
            isHighlighted: true,
            isLast: true,
          },
        ];

  const totalItems = items.length;
  const visibleItems = 3;

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < totalItems - visibleItems) {
      setCurrentIndex((prev) => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getNodePosition = (index: number) => {
    return (index / (visibleItems - 1)) * 100;
  };

  if (!isMounted) {
    return null;
  }

  const displayedItems = items.slice(currentIndex, currentIndex + visibleItems);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2">
        <div
          className="absolute top-0 left-0 w-full bg-black transition-all duration-300 ease-in-out"
          style={{
            height:
              hoveredIndex >= 0 ? `${getNodePosition(hoveredIndex)}%` : "0%",
          }}
        ></div>
      </div>
      <div 
        className="space-y-48 flex flex-col items-center"
        onWheel={handleScroll}
      >
        {displayedItems.map((item, index) => (
          <ProgressItem
            key={currentIndex + index}
            label={item.label}
            description={item.description}
            isHighlighted={item.isHighlighted}
            isLast={item.isLast}
            isHovered={hoveredIndex === index}
            onHover={handleHover}
            index={index}
          />
        ))}
      </div>
      {/* Remove or comment out the following block to remove the indicator */}
      {/*
      {totalItems > visibleItems && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-1 h-1/2 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 w-full bg-gray-400 rounded-full transition-all duration-300 ease-in-out"
            style={{
              height: `${(visibleItems / totalItems) * 100}%`,
              top: `${(currentIndex / (totalItems - visibleItems)) * 100}%`,
            }}
          ></div>
        </div>
      )}
      */}
    </div>
  );
};

export default Progress;
