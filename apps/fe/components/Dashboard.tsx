"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import CalendarView from "./CalenderView";
import WalletView from "./WalletView";
import { setAuthToken } from "../utils/api";

export default function Dashboard() {
  const [active, setActive] = useState<"calendar" | "wallet">("calendar");

  useEffect(() => {
    const token = localStorage.getItem("college_cms_token");
    if (token) setAuthToken(token);
  }, []);

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      <Sidebar active={active} setActive={setActive} />

      {active === "calendar" ? <CalendarView /> : <WalletView />}
    </div>
  );
}
