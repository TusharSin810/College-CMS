"use client";
import Dashboard from "../../components/Dashboard";
import { CoursesProvider } from "../../context/CoursesContext";

export default function DashboardPage() {
  return( 
    <CoursesProvider>   
      <Dashboard />
    </CoursesProvider>
  );
}
