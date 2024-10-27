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
    switch (type) {
      case "START":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M8.01266 4.56502C8.75361 4.16876 9.5587 4 11.1411 4H12.8589C14.4413 4 15.2464 4.16876 15.9873 4.56502C16.6166 4.90155 17.0985 5.38342 17.435 6.01266C17.8312 6.75361 18 7.5587 18 9.14111V14.8589C18 16.4413 17.8312 17.2464 17.435 17.9873C17.0985 18.6166 16.6166 19.0985 15.9873 19.435C15.2464 19.8312 14.4413 20 12.8589 20H11.1411C9.5587 20 8.75361 19.8312 8.01266 19.435C7.38342 19.0985 6.90155 18.6166 6.56502 17.9873C6.16876 17.2464 6 16.4413 6 14.8589V9.14111C6 7.5587 6.16876 6.75361 6.56502 6.01266C6.90155 5.38342 7.38342 4.90155 8.01266 4.56502ZM12.8589 2H11.1411C9.12721 2 8.04724 2.27848 7.06946 2.8014C6.09168 3.32432 5.32432 4.09168 4.8014 5.06946C4.27848 6.04724 4 7.12721 4 9.14111V14.8589C4 16.8728 4.27848 17.9528 4.8014 18.9305C5.32432 19.9083 6.09168 20.6757 7.06946 21.1986C8.04724 21.7215 9.12721 22 11.1411 22H12.8589C14.8728 22 15.9528 21.7215 16.9305 21.1986C17.9083 20.6757 18.6757 19.9083 19.1986 18.9305C19.7215 17.9528 20 16.8728 20 14.8589V9.14111C20 7.12721 19.7215 6.04724 19.1986 5.06946C18.6757 4.09168 17.9083 3.32432 16.9305 2.8014C15.9528 2.27848 14.8728 2 12.8589 2ZM13 6H11V11H13V6ZM7.75781 13.758L12.0005 18.0006L16.2431 13.758L14.8289 12.3438L12.0005 15.1722L9.17203 12.3438L7.75781 13.758Z"></path>
          </svg>
        );
      case "NEXT":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            width="24"
            height="24"
          >
            <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12H16L12 16L8 12H11V8H13V12Z"></path>
          </svg>
        );
      case "ANSWER":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
          </svg>
        );
      case "HTML":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            width="24"
            height="24"
          >
            <path d="M24 12L18.3431 17.6569L16.9289 16.2426L21.1716 12L16.9289 7.75736L18.3431 6.34315L24 12ZM2.82843 12L7.07107 16.2426L5.65685 17.6569L0 12L5.65685 6.34315L7.07107 7.75736L2.82843 12ZM9.78845 21H7.66009L14.2116 3H16.3399L9.78845 21Z"></path>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
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
        className={`px-5 py-3 text-md flex flex-col items-center bg-[#548E28] text-white rounded-lg transition-shadow duration-200 ease-in-out`}
        whileHover={{
          boxShadow: "0 0 4px 4px rgba(84, 142, 40, 0.3)",
        }}
      >
        <div className="flex items-center">
          <span className="mr-2">{getIcon()}</span>
          <div className="flex flex-col">
            <div className="uppercase ml-2">{label}</div>
            <div className="text-xs ml-2">
              {isSummarized ? summarizedDescription : description}
            </div>
          </div>
        </div>
        {action && <div className="text-xs mt-1 ml-2">Action: {action}</div>}
      </motion.div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full mt-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-[300px] overflow-hidden"
          >
            <p className="text-sm text-black text-center font-mono">
              {description}
            </p>
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
  const [summarizedGenerations, setSummarizedGenerations] = useState<
    SummarizedGeneration[]
  >([]);

  const summarizeDescription = useCallback(async (description: string) => {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize description");
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Error summarizing description:", error);
      return description; // Return the original description if summarization fails
    }
  }, []);

  useEffect(() => {
    const summarizeNewGenerations = async () => {
      const newGenerations = generations.slice(summarizedGenerations.length);
      if (newGenerations.length > 0) {
        const newSummarizedGenerations = await Promise.all(
          newGenerations.map(async (gen) => ({
            ...gen,
            summarizedDescription: await summarizeDescription(gen.thought),
            isSummarized: true,
          }))
        );
        setSummarizedGenerations((prev) => [
          ...prev.map((g) => ({ ...g, isSummarized: true })),
          ...newSummarizedGenerations,
        ]);
      }
    };

    summarizeNewGenerations();
  }, [generations, summarizedGenerations.length, summarizeDescription]);

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
          type: gen.label.toUpperCase() as "NEXT" | "ANSWER" | "HTML" | "OTHER",
          action: gen.action, // Add this line
        }))
      : [
          {
            label: "Start",
            description: "Initial state",
            isHighlighted: true,
            isLast: true,
            type: "OTHER",
            action: undefined, // Add this line
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
    <div className="w-full h-full flex flex-col justify-center  items-center bg-[#FDFAF5] relative overflow-hidden dotted-background">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#AFAFAF] transform -translate-x-1/2">
        <div
          className="absolute top-0 left-0 w-0.5 bg-[#AFAFAF]  transition-all duration-300 ease-in-out"
          style={{
            height:
              hoveredIndex >= 0 ? `${getNodePosition(hoveredIndex)}%` : "0%",
          }}
        ></div>
      </div>
      <div
        className="space-y-40 flex flex-col items-center"
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
            type={item.type}
            action={item.action} // Add this line
            summarizedDescription={
              summarizedGenerations.find((g) => g.label === item.label)
                ?.summarizedDescription
            }
            isSummarized={
              summarizedGenerations.find((g) => g.label === item.label)
                ?.isSummarized
            }
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
