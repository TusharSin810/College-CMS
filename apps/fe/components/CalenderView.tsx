"use client";

import { useEffect, useState } from "react";
import api from "../utils/api";
import { CourseContext, CourseProvider } from "../context/CourseContext";
import { CourseToggle } from "./CourseToggle";
import { CoursesProvider } from "../context/CoursesContext";

export default function CalendarView() {
  const { loading, selectedCourse } = CourseContext();

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchCalendar = async () => {
      setError("");
      setUrl("");

      try {
        const res = await api.get(`/calender/${selectedCourse.id}`);

        const notionId = res.data.calenderId;

        const embedUrl = notionId.startsWith("http")
          ? notionId
          : `https://www.notion.so/${notionId}`;

        setUrl(embedUrl);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load calendar");
      }
    };

    fetchCalendar();
  }, [selectedCourse]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">

      <div className="mb-4">
        <CourseProvider>
          <CoursesProvider>
            <CourseToggle />
          </CoursesProvider>
        </CourseProvider>
        
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