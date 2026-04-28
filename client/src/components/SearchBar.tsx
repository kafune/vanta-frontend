import { useState, useRef, useEffect } from "react";
import { Search, X, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const RECENT_SEARCHES_KEY = "vanta_recent_searches";

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Get suggestions
  const { data: suggestions = [] } = trpc.search.suggestions.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  // Get trending searches
  const { data: trending = [] } = trpc.search.trending.useQuery(
    { limit: 5 },
    { enabled: query.length === 0 && isOpen }
  );

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setQuery("");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      {/* Search input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar produtos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 text-gray-400 hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {query ? (
            // Suggestions
            <div className="max-h-64 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors text-sm text-gray-200 flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-gray-500" />
                    {suggestion}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          ) : (
            // Recent searches and trending
            <div className="p-3">
              {recentSearches.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 mb-2 px-1">Buscas recentes</p>
                  {recentSearches.map((search, idx) => (
                    <button
                      key={`recent-${idx}`}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors text-sm text-gray-300 rounded flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3 text-gray-600" />
                      {search}
                    </button>
                  ))}
                  <div className="border-t border-gray-700 my-2" />
                </>
              )}
              <p className="text-xs text-gray-500 mb-2 px-1">Buscas em alta</p>
              {trending.map((search, idx) => (
                <button
                  key={`trending-${idx}`}
                  onClick={() => handleSearch(search)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors text-sm text-gray-300 rounded flex items-center gap-2"
                >
                  <Search className="w-3 h-3 text-gray-600" />
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
