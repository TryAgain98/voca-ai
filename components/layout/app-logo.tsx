interface AppLogoProps {
  showText?: boolean
}

export function AppLogo({ showText = true }: AppLogoProps) {
  return (
    <>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#7170ff] to-[#5e6ad2] shadow-[0_0_12px_rgba(113,112,255,0.4)]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 3L5.5 10L7 7L8.5 10L12 3"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText && (
        <span className="text-[15px] font-[590] tracking-[-0.01em]">
          Voca AI
        </span>
      )}
    </>
  )
}
