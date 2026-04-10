import React from 'react';

interface FlagIconProps {
  code: string;
  size?: 20 | 40 | 80;
  className?: string;
}

export function FlagIcon({ code, size = 20, className = "" }: FlagIconProps) {
  const lower = code.toLowerCase();
  const src = `https://flagcdn.com/w${size}/${lower}.png`;
  return (
    <img
      src={src}
      alt={code}
      width={size}
      className={`inline-block object-cover rounded-[2px] shrink-0 ${className}`}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}