"use client";

import { useState, useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import CalendarView from "./CalenderView";
import WalletView from "./WalletView";
import { setAuthToken } from "../utils/api";
import { CourseProvider } from "../context/CourseContext";

export default function Dashboard() {

  const [active, setActive] = useState<"calendar" | "wallet">("calendar");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);
  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      <Sidebar active={active} setActive={setActive} />

      {active === "calendar" ? <CourseProvider><CalendarView /></CourseProvider> : <WalletView />}
    </div>
  );
}
