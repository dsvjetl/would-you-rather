const Sparkle = ({ className }: { className: string }) => (
  <svg className={`sparkle ${className}`} viewBox="0 0 100 100" aria-hidden="true">
    <path
      d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0 Z"
      fill="currentColor"
    />
  </svg>
);

const Sparkles = () => (
  <>
    <Sparkle className="sparkle--tl" />
    <Sparkle className="sparkle--bl" />
    <Sparkle className="sparkle--tr" />
    <Sparkle className="sparkle--br" />
  </>
);

export { Sparkles };
