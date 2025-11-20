import Link from "next/link";

export default function Page() {
  return (
    <main>
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-semibold">College CMS</h1>
        <Link
          href="/auth/signin"
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Sign In
        </Link>
      </header>

      <section className="bg-white p-10 rounded-xl shadow">
        <h2 className="text-3xl font-bold mb-4">Manage Your Courses</h2>
        <p className="text-slate-600 mb-6">
          Access calendars, wallet, and course tools with a clean dashboard.
        </p>

        <Link
          href="/auth/signin"
          className="px-6 py-3 bg-purple-600 text-white rounded"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
