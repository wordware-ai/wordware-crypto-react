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
  const [response, setResponse] = useState<RunResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setRunId(null);

    try {
      // Create run
      const createRes = await fetch("/api/wordware/create-run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { question },
          version: "^3.4",
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create run: ${createRes.statusText}`);
      }

      const createData = await createRes.text();
      console.log("Raw create run response:", createData);

      let parsedData;
      try {
        parsedData = JSON.parse(createData);
      } catch (parseError) {
        console.error("Error parsing create run response:", parseError);
        throw new Error(`Invalid JSON in create-run response: ${createData}`);
      }

      console.log("Parsed create run response:", parsedData);

      if (!parsedData || typeof parsedData !== "object") {
        throw new Error(
          `Unexpected response format from create-run: ${JSON.stringify(
            parsedData
          )}`
        );
      }

      const runId = parsedData.runId;
      if (!runId) {
        throw new Error(
          `No runId in create-run response: ${JSON.stringify(parsedData)}`
        );
      }

      setRunId(runId);

      // Poll for results
      const pollInterval = setInterval(async () => {
        const getRes = await fetch(`/api/wordware/get-run/${runId}`);
        if (!getRes.ok) {
          clearInterval(pollInterval);
          throw new Error(`Failed to get run: ${getRes.statusText}`);
        }

        const getData = await getRes.text();
        console.log("Raw get run response:", getData);

        let runResult: RunResponse;
        try {
          runResult = JSON.parse(getData);
          console.log("Parsed get run response:", runResult);
        } catch (parseError) {
          console.error("Error parsing get run response:", parseError);
          throw new Error(`Invalid response from get-run: ${getData}`);
        }

        setResponse(runResult);

        if (runResult.status === "COMPLETE" || runResult.status === "ERROR") {
          clearInterval(pollInterval);
          setIsLoading(false);
        }
      }, 1000); // Poll every second
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        status: "ERROR",
        outputs: {},
        errors: [{ message: error.message }],
      });
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
        {runId && (
          <p>
            <strong>Run ID:</strong> {runId}
          </p>
        )}
        {response && (
          <div>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={response.status === "ERROR" ? "text-red-500" : ""}
              >
                {response.status}
              </span>
            </p>
            {response.status === "ERROR" && (
              <div className="mt-4">
                <p>
                  <strong>Error Details:</strong>
                </p>
                <pre className="bg-red-100 p-2 rounded mt-2 overflow-x-auto text-red-700">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
            {response.outputs && response.outputs.content && (
              <div className="mt-4">
                <p>
                  <strong>Content:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                  {JSON.stringify(response.outputs.content, null, 2)}
                </pre>
              </div>
            )}
            {response.errors && response.errors.length > 0 && (
              <div className="mt-4">
                <p>
                  <strong>Errors:</strong>
                </p>
                <ul className="list-disc pl-5">
                  {response.errors.map((error, index) => (
                    <li key={index} className="text-red-500">
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiInterface;
