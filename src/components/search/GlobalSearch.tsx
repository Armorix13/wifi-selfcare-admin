import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Wrench, AlertCircle, ChevronRight, X, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dummyCustomers, dummyEngineers, dummyComplaints } from '@/lib/dummyData';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  type: 'user' | 'engineer' | 'complaint';
  title: string;
  subtitle: string;
  status?: string;
  priority?: string;
  location?: string;
  details: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search functionality
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    console.log('🔍 Performing search for:', searchQuery);
    console.log('📊 Available dummy data:');
    console.log('Customers:', dummyCustomers.length, dummyCustomers.slice(0, 2));
    console.log('Engineers:', dummyEngineers.length, dummyEngineers.slice(0, 2));
    console.log('Complaints:', dummyComplaints.length, dummyComplaints.slice(0, 2));

    const searchResults: SearchResult[] = [];
    const lowercaseQuery = searchQuery.toLowerCase();

    // Search customers/users
    dummyCustomers.forEach(customer => {
      if (
        customer.name.toLowerCase().includes(lowercaseQuery) ||
        customer.email.toLowerCase().includes(lowercaseQuery) ||
        customer.phone.includes(searchQuery) ||
        customer.location.toLowerCase().includes(lowercaseQuery)
      ) {
        searchResults.push({
          id: customer.id,
          type: 'user',
          title: customer.name,
          subtitle: customer.email,
          status: customer.status,
          location: customer.location,
          details: `${customer.serviceProvider || 'No Service'} • ${customer.area} • ${customer.phone}`
        });
      }
    });

    // Search engineers
    dummyEngineers.forEach(engineer => {
      if (
        engineer.name.toLowerCase().includes(lowercaseQuery) ||
        engineer.email.toLowerCase().includes(lowercaseQuery) ||
        engineer.phone.includes(searchQuery) ||
        engineer.location.toLowerCase().includes(lowercaseQuery) ||
        engineer.specialization.toLowerCase().includes(lowercaseQuery)
      ) {
        searchResults.push({
          id: engineer.id,
          type: 'engineer',
          title: engineer.name,
          subtitle: engineer.specialization,
          status: engineer.isActive ? 'active' : 'inactive',
          location: engineer.location,
          details: `Rating: ${engineer.rating}/50 • ${engineer.completedJobs} jobs completed • ${engineer.phone}`
        });
      }
    });

    // Search complaints
    dummyComplaints.forEach(complaint => {
      if (
        complaint.title.toLowerCase().includes(lowercaseQuery) ||
        complaint.description.toLowerCase().includes(lowercaseQuery) ||
        complaint.customerName.toLowerCase().includes(lowercaseQuery) ||
        complaint.location.toLowerCase().includes(lowercaseQuery)
      ) {
        searchResults.push({
          id: complaint.id,
          type: 'complaint',
          title: complaint.title,
          subtitle: `By ${complaint.customerName}`,
          status: complaint.status,
          priority: complaint.priority,
          location: complaint.location,
          details: `${complaint.priority.toUpperCase()} • ${complaint.location} • ${new Date(complaint.createdAt).toLocaleDateString()}`
        });
      }
    });

    console.log('✅ Search results found:', searchResults.length, searchResults);

    // Sort results by relevance (exact matches first)
    searchResults.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(lowercaseQuery) ? 1 : 0;
      const bExact = b.title.toLowerCase().startsWith(lowercaseQuery) ? 1 : 0;
      return bExact - aExact;
    });

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  };

  // Handle input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        searchRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    let path = '';

    switch (result.type) {
      case 'user':
        path = `/users/${result.id}`;
        break;
      case 'engineer':
        path = `/engineers/${result.id}`;
        break;
      case 'complaint':
        path = `/complaints/${result.id}`;
        break;
    }

    navigate(path);
    setIsOpen(false);
    setQuery('');
    searchRef.current?.blur();
  };

  // Get icon for result type
  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'engineer':
        return <Wrench className="h-4 w-4" />;
      case 'complaint':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (type: string, status?: string, priority?: string) => {
    if (type === 'complaint' && priority) {
      switch (priority) {
        case 'urgent':
          return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
        case 'high':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        case 'low':
          return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      }
    }

    if (status) {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        case 'inactive':
        case 'suspended':
          return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        case 'resolved':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      }
    }

    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  return (
    <div className="relative flex-1 max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search complaints, users, engineers..."
          value={query}
          onChange={(e) => {
            console.log('🔤 Input change:', e.target.value);
            setQuery(e.target.value);
          }}
          onFocus={() => {
            console.log('🎯 Input focused');
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            console.log('⌨️ Key pressed:', e.key);
            handleKeyDown(e);
          }}
          onInput={(e) => {
            console.log('📝 Input event:', (e.target as HTMLInputElement).value);
          }}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          style={{ zIndex: 1000 }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              searchRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <>
          {/* Backdrop - positioned to not block the input */}
          <div
            className="fixed inset-0 bg-black/10 dark:bg-black/20 z-30"
            style={{ top: '100px' }} // Don't cover the header area
            onClick={() => setIsOpen(false)}
          />

          {/* Results Panel */}
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                  {/* Debug info */}
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <p>📊 Data sources: {dummyCustomers.length} customers, {dummyEngineers.length} engineers, {dummyComplaints.length} complaints</p>
                  </div>
                </div>
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 group",
                        selectedIndex === index && "bg-gray-50 dark:bg-gray-800"
                      )}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                        {getIcon(result.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {result.title}
                          </p>
                          {(result.status || result.priority) && (
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              getStatusColor(result.type, result.status, result.priority)
                            )}>
                              {result.priority || result.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                          {result.details}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : query ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for names, emails, or locations</p>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Search across all data</p>
                <p className="text-xs mt-1">Find complaints, users, and engineers instantly</p>

                {/* Sample search suggestions */}
                <div className="mt-4 text-left">
                  <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-300">Try searching for:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">• Names: "Rajesh", "Mike", "Priya"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">• Locations: "Mumbai", "Delhi", "Bangalore"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">• Issues: "Internet", "WiFi", "Router"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">• Specializations: "Network", "Hardware", "Software"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}