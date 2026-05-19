interface AppLogoProps {
  showText?: boolean
}

export function AppLogo({ showText = true }: AppLogoProps) {
  return (
    <>
      <span
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-sky-400 via-indigo-500 to-violet-500 shadow-[0_8px_20px_rgba(79,70,229,0.28)]"
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-black/10" />
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          className="relative"
        >
          <path
            d="M4.25 3.25H17.75C18.58 3.25 19.25 3.92 19.25 4.75V17.25C19.25 18.08 18.58 18.75 17.75 18.75H4.25C3.42 18.75 2.75 18.08 2.75 17.25V4.75C2.75 3.92 3.42 3.25 4.25 3.25Z"
            fill="white"
            fillOpacity="0.96"
          />
          <path
            d="M14.95 3.25H17.75C18.58 3.25 19.25 3.92 19.25 4.75V7.6L14.95 3.25Z"
            fill="#A5F3FC"
          />
          <path
            d="M5.7 6.35H8.65L11 14.05L13.35 6.35H16.3L12.75 15.85H9.25L5.7 6.35Z"
            fill="#4338CA"
          />
          <path
            d="M6.25 16.35H15.75"
            stroke="#22D3EE"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showText && (
        <span className="text-[15px] font-[650] tracking-normal whitespace-nowrap">
          Voca AI
        </span>
      )}
    </>
  )
}
