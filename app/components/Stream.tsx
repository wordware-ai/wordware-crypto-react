"use client";

import React, { useState, useEffect } from "react";

interface RunResponse {
  status: "RUNNING" | "WAITING" | "ERROR" | "STOPPED" | "COMPLETE";
  outputs: Record<string, any>;
  errors: { message: string }[];
  ask?: {
    path: string;
    content: {
      type: string;
      value: string;
    };
    askId: string;
  };
}

const ApiInterface: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/wordware/create-run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { question },
          version: "^3.4",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `API request failed: ${errorData.error || JSON.stringify(errorData)}`
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "chunk" && typeof parsed.value === "string") {
              setResponse((prev) => prev + parsed.value);
            }
          } catch (parseError) {
            console.warn(
              "Error parsing chunk:",
              parseError,
              "Raw chunk:",
              line
            );
            setResponse((prev) => prev + line + "\n");
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Response:</h3>
        <p>
          <strong>Status:</strong> {response}
        </p>
      </div>
    </div>
  );
};

export default ApiInterface;
