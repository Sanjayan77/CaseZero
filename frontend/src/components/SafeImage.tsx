import React, { useState } from 'react';
import { ImageOff, FileText, User } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'suspect' | 'evidence' | 'scene' | 'document';
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'scene',
  fallbackTitle,
  ...props
}) => {
  const [error, setError] = useState<boolean>(false);

  // If src is missing or error occurred
  if (!src || error) {
    return (
      <div
        className={`w-full h-full min-h-[120px] bg-[#12151D] border border-[#2B303A] flex flex-col items-center justify-center p-4 text-center text-[#9BA2AE] select-none ${className}`}
      >
        {fallbackType === 'suspect' ? (
          <User className="w-8 h-8 text-[#D5AA63]/60 mb-2" />
        ) : fallbackType === 'document' || fallbackType === 'evidence' ? (
          <FileText className="w-8 h-8 text-[#65B8A7]/60 mb-2" />
        ) : (
          <ImageOff className="w-8 h-8 text-[#656C7A] mb-2" />
        )}
        <span className="text-xs font-mono-forensic text-[#F0F0F2] font-semibold line-clamp-1">
          {fallbackTitle || alt || 'Exhibit Record'}
        </span>
        <span className="text-[10px] font-mono-forensic text-[#656C7A] uppercase mt-0.5">
          Archived Evidence
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'CaseZero Exhibit'}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      {...props}
    />
  );
};
