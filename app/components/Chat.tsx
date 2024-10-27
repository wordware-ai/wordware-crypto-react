"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface StreamedResponse {
  type: string;
  value: string;
  label?: string;
  state?: string;
}

interface ChatProps {
  setGenerations: React.Dispatch<React.SetStateAction<any[]>>;
  hoveredGenerationId: number;
  setHoveredGenerationId: (id: number) => void;
}

const ExpandableSection: React.FC<{
  title: string;
  content: React.ReactNode;
  isNested?: boolean;
  generationType?: string;
  isLast?: boolean;
  defaultExpanded?: boolean;
  isCurrent?: boolean;
  isHovered?: boolean;
}> = ({
  title,
  content,
  isNested = false,
  generationType = "",
  isLast = false,
  defaultExpanded = true,
  isCurrent = false,
  isHovered = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCircleLetter = (type: string) => {
    if (!type) return null;
    const firstLetter = type.charAt(0).toUpperCase();
    return (
      <motion.div
        className={`w-6 h-6 rounded-full bg-[#538E28] flex items-center justify-center text-xs font-medium text-white
        ${isCurrent ? "animate-pulse-shadow" : ""}`}
        animate={
          isHovered ? { boxShadow: "0 0 6px 2px rgba(84, 142, 40, 0.5)" } : {}
        }
      >
        {firstLetter}
      </motion.div>
    );
  };

  return (
    <div
      className={`${isNested ? "mb-4 ml-6" : "flex"}`}
    >
      {!isNested && (
        <div className="mr-4 flex flex-col items-center">
          <div className="mb-2">{getCircleLetter(generationType)}</div>
          {!isLast && <div className="w-[1px] bg-[#969696] flex-grow"></div>}
        </div>
      )}
      <div className={`flex-grow ${isNested ? "pl-4" : ""}`}>
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="mr-2 w-4 h-4 flex-shrink-0">
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="rgba(0,0,0,0.5)"
              >
                <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="rgba(0,0,0,0.5)"
              >
                <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
              </svg>
            )}
          </span>
          <p className="text-sm font-normal text-black">{title}</p>
        </div>
        {isExpanded && <div className="mt-2 text-[#538E28]">{content}</div>}
      </div>
    </div>
  );
};

const Chat: React.FC<ChatProps> = ({ 
  setGenerations, 
  hoveredGenerationId, 
  setHoveredGenerationId 
}) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [processSteps, setProcessSteps] = useState<
    Array<{ thought: string; action: string; input: string }>
  >([]);
  const [localGenerations, setLocalGenerations] = useState<
    Array<{
      label: string;
      thought: string;
      action: string;
      input?: string;
      isCompleted?: boolean;
    }>
  >([]);

  const updateGenerations = useCallback(
    (newGenerations: any[]) => {
      setLocalGenerations(newGenerations);
      setGenerations(newGenerations);
    },
    [setGenerations]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse("");
    updateGenerations([]); // Reset generations at the start of a new query

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/wordware", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { question },
          version: "^3.4",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const content = JSON.parse(line);
              const value = content.value;

              if (value && typeof value === "object") {
                if (value.type === "generation") {
                  if (value.state === "start") {
                    console.log("New generation:", value);
                    updateGenerations((prev) => [
                      ...prev,
                      {
                        label: value.label || "",
                        thought: value.thought || "",
                        action: value.action || "",
                        input: value.input || "",
                      },
                    ]);
                  } else if (value.state === "end") {
                    updateGenerations((prev) =>
                      prev.map((gen, index) =>
                        index === prev.length - 1
                          ? { ...gen, isCompleted: true }
                          : gen
                      )
                    );
                  }
                } else if (value.type === "chunk") {
                  updateGenerations((prev) =>
                    prev.map((gen, index) =>
                      index === prev.length - 1
                        ? {
                            ...gen,
                            thought: gen.thought + (value.value ?? ""),
                            action: gen.action || value.action || "",
                            input: gen.input || value.input || "",
                          }
                        : gen
                    )
                  );
                }
              } else if (value.type === "chunk") {
                updateGenerations((prev) =>
                  prev.map((gen, index) =>
                    index === prev.length - 1
                      ? {
                          ...gen,
                          thought: gen.thought + (value.value ?? ""),
                          action: gen.action || value.action || "",
                          input: gen.input || value.input || "",
                        }
                      : gen
                  )
                );
              }
            } catch (error) {
              console.error("Error parsing chunk:", error);
            }
          }
        }

        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error:", error);
        setResponse("An error occurred while fetching the response.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-grow overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-black mb-6">Generations:</h3>
          <div className="p-4 rounded-lg">
            {localGenerations.map((generation, index) => {
              let thoughtObj;
              try {
                thoughtObj = JSON.parse(generation.thought);
              } catch (e) {
                thoughtObj = {
                  thought: generation.thought,
                  action: "",
                  input: "",
                };
              }

              return (
                <div 
                  key={index} 
                  className="pt-2"
                  onMouseEnter={() => setHoveredGenerationId(index)}
                  onMouseLeave={() => setHoveredGenerationId(-1)}
                >
                  <ExpandableSection
                    title={`Generation: ${generation.label}`}
                    generationType={generation.label}
                    isLast={index === localGenerations.length - 1}
                    defaultExpanded={true}
                    isCurrent={index === localGenerations.length - 1}
                    isHovered={hoveredGenerationId === index}
                    content={
                      <div className="space-y-3 mt-2 mb-5">
                        {thoughtObj.thought && (
                          <p className="text-sm text-gray-600">
                            {thoughtObj.thought}
                          </p>
                        )}
                        {thoughtObj.action && (
                          <ExpandableSection
                            title="Action"
                            content={
                              <p className="text-sm text-gray-600 mt-2">
                                {thoughtObj.action}
                              </p>
                            }
                            isNested
                            defaultExpanded={false}
                          />
                        )}
                        {thoughtObj.input && (
                          <ExpandableSection
                            title="Input"
                            content={
                              <p className="text-sm text-gray-600 mt-2">
                                {thoughtObj.input}
                              </p>
                            }
                            isNested
                            defaultExpanded={false}
                          />
                        )}
                        {generation.isCompleted && (
                          <p className="text-green-600 mt-2 text-sm">
                            Completed
                          </p>
                        )}
                      </div>
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg ">
            <div className="p-4">
              <form
                onSubmit={handleSubmit}
                className="flex items-center space-x-4"
              >
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  rows={1}
                  placeholder="Type your message here..."
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-normal text-white bg-[#538E28] hover:bg-[#538E28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
