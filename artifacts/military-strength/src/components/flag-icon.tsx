interface FlagIconProps {
  code: string;
  size?: 20 | 40 | 80;
  className?: string;
}

export function FlagIcon({ code, size = 20, className = "" }: FlagIconProps) {
  const lower = code.toLowerCase();
  const src = `https://flagcdn.com/w${size}/${lower}.png`;
  const src2x = `https://flagcdn.com/w${size * 2}/${lower}.png`;
  return (
    <img
      src={src}
      srcSet={`${src2x} 2x`}
      alt={code}
      width={size}
      height={Math.round(size * 0.75)}
      className={`inline-block object-cover rounded-[2px] shrink-0 ${className}`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}
