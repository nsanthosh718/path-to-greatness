export default function SetupNotice() {
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900 mb-2">⚙️ FamilyBoard isn&apos;t connected yet</h1>
      <p className="text-slate-600 mb-4">
        This app needs a free Supabase project to store the schedule, chores, and points, and to
        sync them live across devices.
      </p>
      <ol className="list-decimal list-inside space-y-1 text-slate-600 text-sm">
        <li>
          Create a project at{" "}
          <span className="font-mono text-slate-800">supabase.com</span>
        </li>
        <li>
          Run <span className="font-mono text-slate-800">supabase/schema.sql</span> then{" "}
          <span className="font-mono text-slate-800">supabase/seed.sql</span> in its SQL editor
        </li>
        <li>
          Copy <span className="font-mono text-slate-800">.env.local.example</span> to{" "}
          <span className="font-mono text-slate-800">.env.local</span> and fill in your project
          URL + anon key
        </li>
        <li>Restart the dev server</li>
      </ol>
      <p className="text-slate-400 text-xs mt-4">Full steps are in README.md.</p>
    </div>
  );
}
