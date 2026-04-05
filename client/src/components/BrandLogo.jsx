import { Link } from "react-router-dom";

export default function BrandLogo({
  to = "/marketplace",
  compact = false,
  stacked = false,
  className = "",
  textClassName = "",
}) {
  const titleSizeClass = compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl";
  const layoutClass = stacked
    ? "inline-flex flex-col items-center justify-center gap-1"
    : "inline-flex items-center";

  return (
    <Link to={to} className={`${layoutClass} ${className}`}>
      <span className={`${titleSizeClass} font-bold text-gray-900 ${textClassName}`}>
        Campus<span className="text-[#137FEC]">Mart</span>
      </span>
    </Link>
  );
}
