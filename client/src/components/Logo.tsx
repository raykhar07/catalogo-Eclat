import { Link } from "react-router-dom";

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export default function Logo({ className = "", compact = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={`group flex items-center gap-2.5 font-display tracking-tight ${className}`}
      aria-label="Éclat Studio. Ir al inicio"
    >
      <span
        aria-hidden="true"
        className="relative grid size-9 place-items-center overflow-hidden rounded-lg bg-linear-to-br from-cobalt via-[color-mix(in_srgb,var(--accent)_88%,#ffffff_12%)] to-cobalt-deep shadow-[0_18px_40px_-24px_var(--accent-glow)] transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-[0_22px_50px_-24px_var(--accent-glow)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="relative h-5 w-5 text-white drop-shadow-[0_8px_18px_rgba(15,23,42,0.28)]"
          role="img"
        >
          <path
            d="M6.2 6.2h9.2v2.2H6.2zM6.2 10.2h9.2v2.2H6.2zM6.2 14.2h6.6v2.2H6.2z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M12.6 7.6c1.8-1.2 3.8-1.6 5.4-.9.4.18.7.4.95.68l-1.26 1.6c-.16-.16-.36-.3-.58-.4-1-.44-2.26-.16-3.34.56l-.76-1.54z"
            fill="currentColor"
            opacity="0.8"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex items-baseline gap-1 text-lg font-semibold tracking-tight text-(--nav-text) sm:text-xl">
          <span className="font-display">Éclat</span>
          <span className="text-(--nav-text)/70">Studio</span>
        </span>
      )}
    </Link>
  );
}
