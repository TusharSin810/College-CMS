"use client";

export default function Sidebar({
  active,
  setActive
}: {
  active: "calendar" | "wallet";
  setActive: (next: "calendar" | "wallet") => void;
}) {
  return (
    <aside className="bg-white p-4 rounded shadow h-fit">
      <button
        onClick={() => setActive("calendar")}
        className={`w-full text-left px-3 py-2 rounded ${
          active === "calendar"
            ? "bg-purple-600 text-white"
            : "hover:bg-slate-100"
        }`}
      >
        Calendar
      </button>

      <button
        onClick={() => setActive("wallet")}
        className={`w-full text-left px-3 py-2 rounded mt-2 ${
          active === "wallet"
            ? "bg-purple-600 text-white"
            : "hover:bg-slate-100"
        }`}
      >
        Wallet
      </button>
    </aside>
  );
}
