export default function Eyebrow({
  children,
  tone = "pink",
}: {
  children: React.ReactNode;
  tone?: "pink" | "violet" | "orange" | "cyan";
}) {
  const toneClass = {
    pink: "text-sunset-pink",
    violet: "text-violet",
    orange: "text-orange",
    cyan: "text-cyan",
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <span className={`h-px w-8 ${toneClass} bg-current`} />
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.35em] ${toneClass}`}
      >
        {children}
      </span>
    </div>
  );
}
