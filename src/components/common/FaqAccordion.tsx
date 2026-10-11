import React, { useState, useId } from 'react';
import { ChevronDown, Search, HelpCircle, Layers } from 'lucide-react';
import { FaqItem } from '../../lib/faqData';

interface FaqAccordionProps {
  items: FaqItem[];
  categories?: string[];
  title?: string;
  subtitle?: string;
  allowMultiple?: boolean;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  items,
  categories,
  title,
  subtitle,
  allowMultiple = false,
}) => {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const componentId = useId();

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Optional Header */}
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-sm text-gray-600 leading-relaxed">{subtitle}</p>}
        </div>
      )}

      {/* Controls: Search & Category Pills */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-[#DBE2EF] focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/10 focus:outline-none text-[#112D4E] placeholder:text-gray-400 shadow-2xs transition-all"
            aria-label="Search FAQ"
          />
        </div>

        {/* Category Pills (if provided) */}
        {categories && categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all btn-tactile ${
                    isSelected
                      ? 'bg-[#3F72AF] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F9F7F7] text-gray-600 border border-[#DBE2EF]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion Item List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#DBE2EF] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-[#3F72AF] flex items-center justify-center mx-auto">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#112D4E]">No matching questions found</h3>
              <p className="text-xs text-gray-500">
                Try refining your search terms or selecting another category.
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-[#3F72AF] hover:underline"
              >
                Clear search filters
              </button>
            )}
          </div>
        ) : (
          filteredItems.map(item => {
            const isOpen = openIds.includes(item.id);
            const questionId = `${componentId}-q-${item.id}`;
            const answerId = `${componentId}-a-${item.id}`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#DBE2EF] shadow-2xs hover:border-[#3F72AF]/40 transition-all overflow-hidden"
              >
                <button
                  type="button"
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleItem(item.id);
                    }
                  }}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3F72AF] shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-[#112D4E] leading-snug">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#3F72AF]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-[#F9F7F7] bg-[#F9F7F7]/40 animate-fadeIn"
                  >
                    <p className="whitespace-pre-line">{item.answer}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#DBE2EF]/40">
                      <span className="font-medium">Category: {item.category}</span>
                      <span className="font-mono text-[10px]">ID: {item.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
