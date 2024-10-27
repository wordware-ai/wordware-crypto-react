"use client";

import React, { useState } from "react";

const ApiInterface: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      });

      const textResponse = await res.text();
      console.log("Raw response:", textResponse); // Log the raw response

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setResponse(
          `Failed to parse API response. Raw response:\n\n${textResponse}`
        );
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`API request failed: ${JSON.stringify(data)}`);
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error:", error);
      setResponse(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
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
      {response && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">Response:</h3>
          <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiInterface;
