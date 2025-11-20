"use client";

import { useState } from "react";
import api from "../utils/api";

export default function CalendarView() {
  const [courseId, setCourseId] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function fetchCalendar() {
    setError("");
    try {
      const res = await api.get(`/calender/${courseId}`);

      const notionId = res.data.calenderId;
      const embedUrl = notionId.startsWith("http")
        ? notionId
        : `https://www.notion.so/${notionId}`;

      setUrl(embedUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load calendar");
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter course ID"
          className="px-3 py-2 border rounded w-64"
          onChange={(e) => setCourseId(e.target.value)}
        />

        <button
          onClick={fetchCalendar}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Load
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {url && (
        <iframe
          src={url}
          className="w-full h-[650px] border rounded"
        />
      )}
    </div>
  );
}
