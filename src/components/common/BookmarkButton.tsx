import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface BookmarkButtonProps {
  id?: string;
  category?: 'creator' | 'brand' | 'campaign' | 'product';
  initialBookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
  title?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  id,
  category = 'item',
  initialBookmarked = false,
  onToggle,
  className = '',
  size = 'md',
  title = 'Bookmark item',
}) => {
  const storageKey = id ? `brandwaves_saved_${category}_${id}` : null;

  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) return stored === 'true';
      } catch {}
    }
    return initialBookmarked;
  });

  const [animating, setAnimating] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!storageKey) return;
    const syncBookmark = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) setIsBookmarked(stored === 'true');
      } catch {}
    };

    window.addEventListener('brandwaves_bookmarks_changed', syncBookmark);
    return () => window.removeEventListener('brandwaves_bookmarks_changed', syncBookmark);
  }, [storageKey]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(nextState));
        window.dispatchEvent(new CustomEvent('brandwaves_bookmarks_changed'));
      } catch {}
    }

    if (!prefersReducedMotion) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 380);
    }

    if (onToggle) onToggle(nextState);
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const buttonPadding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isBookmarked ? 'Remove bookmark' : title}
      aria-label={isBookmarked ? 'Remove bookmark' : title}
      aria-pressed={isBookmarked}
      className={`rounded-xl border transition-all cursor-pointer select-none inline-flex items-center justify-center btn-tactile spring-press focus-ring-bw ${buttonPadding} ${
        isBookmarked
          ? 'bg-[#3F72AF]/10 border-[#3F72AF] text-[#3F72AF] shadow-2xs'
          : 'bg-white/85 hover:bg-white border-[#DBE2EF] text-gray-400 hover:text-[#112D4E] shadow-2xs'
      } ${className}`}
    >
      <Bookmark
        className={`${iconSize} transition-all ${
          animating ? 'animate-icon-pop' : ''
        } ${isBookmarked ? 'fill-current text-[#3F72AF]' : ''}`}
      />
    </button>
  );
};

