import React from 'react';

export function FlagIcon({ code, size = 20, className = "" }: { code: string; size?: number; className?: string }) {
  const src = `https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png`;
  return (
    <img
      src={src}
      alt={code}
      width={size}
      className={`inline-block object-cover rounded-sm shadow-sm ${className}`}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}