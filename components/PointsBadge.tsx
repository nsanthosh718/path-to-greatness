export default function PointsBadge({ balance }: { balance: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-sm">
      ⭐ {balance} pts
    </span>
  );
}
