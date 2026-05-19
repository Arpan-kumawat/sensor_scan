export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-12 rounded-xl" />
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="skeleton h-24 rounded-2xl" />
);
