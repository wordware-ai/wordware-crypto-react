"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressItem } from "./ProgressItem";
import { ProgressProps, SummarizedGeneration } from "../types/progress";

const Progress: React.FC<ProgressProps> = ({
  generations = [],
  hoveredGenerationId,
  setHoveredGenerationId,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summarizedGenerations, setSummarizedGenerations] = useState<
    SummarizedGeneration[]
  >([]);

  const visibleItems = 3;

  // Move items and totalItems declarations up here
  const items =
    generations.length > 0
      ? generations.map((gen, index) => ({
          label: gen.label,
          description: gen.thought,
          isHighlighted: index === generations.length - 1 && !gen.isCompleted,
          isLast: index === generations.length - 1,
          type: gen.label.toUpperCase() as "NEXT" | "ANSWER" | "HTML" | "OTHER",
          action: gen.action,
        }))
      : [
          {
            label: "START",
            description: "Enter a question to get started!",
            isHighlighted: true,
            isLast: true,
            type: "OTHER",
            action: undefined,
          },
        ];

  const totalItems = items.length;

  // Move summarizeDescription outside useEffect
  const summarizeDescription = useCallback(async (description: string) => {
    if (!description) {
      console.error("Empty description provided for summarization");
      return "No description available";
    }

    try {
      console.log("Sending description to summarize:", description);
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received summary:", data.summary);
      return data.summary || description;
    } catch (error) {
      console.error("Error summarizing description:", error);
      return description;
    }
  }, []); // Empty dependency array

  // Handle index updates
  useEffect(() => {
    if (generations.length > 3) {
      setCurrentIndex(generations.length - 3);
    }
  }, [generations.length]);

  // Handle summarization
  useEffect(() => {
    const latestGeneration = generations[generations.length - 1];
    if (!latestGeneration?.thought) return;

    const isAlreadySummarized = summarizedGenerations.some(
      (g) => g.label === latestGeneration.label
    );

    if (!isAlreadySummarized) {
      summarizeDescription(latestGeneration.thought).then((summary) => {
        setSummarizedGenerations((prev) => [
          ...prev,
          {
            ...latestGeneration,
            summarizedDescription: summary,
            isSummarized: true,
          },
        ]);
      });
    }
  }, [generations, summarizeDescription, summarizedGenerations]);

  useEffect(() => {
    if (hoveredGenerationId >= 0) {
      if (hoveredGenerationId < currentIndex) {
        setCurrentIndex(hoveredGenerationId);
      } else if (hoveredGenerationId >= currentIndex + visibleItems) {
        setCurrentIndex(
          Math.min(
            hoveredGenerationId - visibleItems + 1,
            totalItems - visibleItems
          )
        );
      }
    }
  }, [hoveredGenerationId, currentIndex, totalItems, visibleItems]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleHover = (index: number) => {
    setHoveredGenerationId(currentIndex + index);
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    const scrollUp = e.deltaY < 0;
    const newIndex = scrollUp
      ? Math.max(0, currentIndex - 1)
      : Math.min(totalItems - visibleItems, currentIndex + 1);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Add ref for node positions
  const nodeRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const getNodePosition = (index: number) => {
    // Convert the absolute hoveredGenerationId to a relative position
    const relativeIndex = index - currentIndex;
    // Only show position if the hovered item is currently visible
    if (relativeIndex >= 0 && relativeIndex < visibleItems) {
      return ((relativeIndex + 1) / visibleItems) * 100;
    }
    return 0;
  };

  if (!isMounted) {
    return null;
  }

  const displayedItems = items.slice(currentIndex, currentIndex + visibleItems);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-[#FDFAF5] relative overflow-hidden dotted-background">
      <div
        className="absolute left-1/2 top-0 bottom-0 w-[2px] transform -translate-x-1/2"
        style={{
          background: "linear-gradient(to bottom, #1a5d1a, #8fce00)",
        }}
      ></div>
      <motion.div
        className="space-y-32 flex flex-col items-center"
        onWheel={handleScroll}
        animate={{ y: -currentIndex * 128 }} // 128 = space-y-32 (32 * 4)
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 20,
          mass: 0.5,
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayedItems.map((item, index) => (
            <motion.div
              key={currentIndex + index}
              ref={(el) => (nodeRefs.current[index] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: index * 0.1,
              }}
            >
              <ProgressItem
                label={item.label}
                description={item.description}
                isHighlighted={item.isHighlighted}
                isLast={item.isLast}
                isHovered={hoveredGenerationId === currentIndex + index}
                onHover={handleHover}
                index={index}
                type={item.type}
                action={item.action}
                summarizedDescription={
                  summarizedGenerations.find((g) => g.label === item.label)
                    ?.summarizedDescription
                }
                isSummarized={
                  summarizedGenerations.find((g) => g.label === item.label)
                    ?.isSummarized || false
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
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
