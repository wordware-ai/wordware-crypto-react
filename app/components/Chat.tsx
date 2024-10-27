"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface StreamedResponse {
  type: string;
  value: string;
  label?: string;
  state?: string;
}

interface ChatProps {
  setGenerations: React.Dispatch<React.SetStateAction<any[]>>;
}

const Chat: React.FC<ChatProps> = ({ setGenerations }) => {
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
      <div className="flex-grow overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-black mb-4">Generations:</h3>
          {localGenerations.map((generation, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <h4 className="font-bold">Generation: {generation.label}</h4>
              <p>
                <strong>Thought:</strong> {generation.thought}
              </p>
              <div>
                <strong>Action:</strong>
                {generation.action && <pre>{generation.action}</pre>}
              </div>
              {generation.input && (
                <div>
                  <strong>Input:</strong>
                  <pre>{generation.input}</pre>
                </div>
              )}
              {generation.isCompleted && (
                <p className="text-green-600">Completed</p>
              )}
            </div>
          ))}
          <h3 className="text-lg font-medium text-black mb-4">
            Final Response:
          </h3>
          <div className="p-4 rounded-md text-black">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border-2 border-gray-200">
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#538E28] hover:bg-[#538E28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
