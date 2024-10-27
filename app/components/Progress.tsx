"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Generation {
  label: string;
  thought: string;
  isCompleted?: boolean;
  action?: string; // Add this line
}

interface ProgressProps {
  generations: Generation[];
  hoveredGenerationId: number; // Add this
  setHoveredGenerationId: (id: number) => void; // Add this
}

interface ProgressItemProps {
  label: string;
  description: string;
  isHighlighted: boolean;
  isLast: boolean;
  isHovered: boolean;
  onHover: (index: number) => void;
  index: number;
  type: "START" | "NEXT" | "ANSWER" | "HTML" | "OTHER";
  action?: string; // Add this line
}

interface SummarizedGeneration extends Generation {
  summarizedDescription?: string;
  isSummarized: boolean;
}

const ProgressItem: React.FC<
  ProgressItemProps & { summarizedDescription?: string; isSummarized: boolean }
> = ({
  label,
  description,
  summarizedDescription,
  isSummarized,
  isHighlighted,
  isLast,
  isHovered,
  onHover,
  index,
  type,
  action,
}) => {
  const getIcon = () => {
    const iconClass = "fill-white w-7 h-7 p-1"; // Square SVG with white fill
    switch (type) {
      case "NEXT":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"></path>
          </svg>
        );
      case "ANSWER":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
          </svg>
        );
      case "HTML":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z"></path>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={iconClass}
          >
            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H16L12 16L8 12H11V8H13V12Z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}
    >
      <motion.div
        className="px-3 py-3 text-md flex flex-col bg-white text-black  rounded-lg w-[300px] border border-gray-200"
        whileHover={{
          boxShadow: "0 0 6px 2px rgba(84, 142, 40, 0.25)",
        }}
        animate={{
          boxShadow: isHovered ? "0 0 6px 2px rgba(84, 142, 40, 0.5)" : "none",
          height: "auto",
          maxHeight: isHovered ? "200px" : "auto",
          transition: {
            height: {
              type: "spring",
              stiffness: 150,
              damping: 20,
              mass: 0.5,
            },
          },
        }}
        style={{
          overflow: "auto", // Changed from conditional to always auto
          height: "fit-content",
        }}
      >
        <div className="flex items-start w-full">
          <div className="flex items-start w-full">
            <span className="mr-3 flex-shrink-0 bg-gradient-to-tl from-black/80 to-[#65ab30] p-1 mt-1 rounded-md">
              {getIcon()}
            </span>
            <div className="flex flex-col flex-grow min-w-0 w-full">
              <div className="uppercase font-medium break-words">{label}</div>
              <AnimatePresence mode="wait">
                {isHovered ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="text-sm text-wrap text-[#828282] mt-2 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar max-h-[120px]" // Added max-h-[120px]
                  >
                    {(() => {
                      try {
                        const thoughtObj = JSON.parse(description);
                        return thoughtObj.thought || description;
                      } catch (e) {
                        return description;
                      }
                    })()}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 1, height: "auto" }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-wrap text-[#828282]"
                  >
                    {isSummarized && summarizedDescription
                      ? summarizedDescription
                      : description}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {action && (
          <div className="text-xs mt-1 text-center w-full break-words">
            Action: {action}
          </div>
        )}
      </motion.div>
    </div>
  );
};

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
            description: "Initial state",
            isHighlighted: true,
            isLast: true,
            type: "OTHER",
            action: undefined,
          },
        ];

  const totalItems = items.length;

  // Now we can use totalItems in the useEffect
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
  }, []);

  useEffect(() => {
    if (generations.length > 3) {
      setCurrentIndex(generations.length - 3);
    }

    // Only summarize the latest generation if it's new
    const latestGeneration = generations[generations.length - 1];
    if (
      latestGeneration &&
      latestGeneration.thought &&
      !summarizedGenerations.some((g) => g.label === latestGeneration.label)
    ) {
      summarizeDescription(latestGeneration.thought).then((summary) => {
        console.log("Summarized thought:", summary); // Add this line for debugging
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
  }, [generations, summarizeDescription]);

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

  const getNodePosition = (index: number) => {
    // Convert the absolute hoveredGenerationId to a relative position
    const relativeIndex = index - currentIndex;
    // Only show position if the hovered item is currently visible
    if (relativeIndex >= 0 && relativeIndex < visibleItems) {
      return (relativeIndex / (visibleItems - 1)) * 100;
    }
    return 0;
  };

  if (!isMounted) {
    return null;
  }

  const displayedItems = items.slice(currentIndex, currentIndex + visibleItems);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-[#FDFAF5] relative overflow-hidden dotted-background">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#969696] transform -translate-x-1/2">
        <div
          className="absolute top-0 left-0 w-0.5 transition-all duration-300 ease-in-out"
          style={{
            height:
              hoveredGenerationId >= currentIndex &&
              hoveredGenerationId < currentIndex + visibleItems
                ? `${getNodePosition(hoveredGenerationId)}%`
                : "0%",
            background: "linear-gradient(to bottom, #1a5d1a, #8fce00)",
          }}
        ></div>
      </div>
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
