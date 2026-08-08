import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchBismillahForAnalytics, 
  fetchAlhamdulillahForAnalytics,
  GlobalFilter 
} from './engine';

interface FilterContextType {
  filters: GlobalFilter;
  setFilters: (filters: GlobalFilter) => void;
  bismillahData: any[];
  alhamdulillahData: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilter>({});
  const [bismillahData, setBismillahData] = useState<any[]>([]);
  const [alhamdulillahData, setAlhamdulillahData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bData = await fetchBismillahForAnalytics(filters);
      const aData = await fetchAlhamdulillahForAnalytics(filters);
      setBismillahData(bData);
      setAlhamdulillahData(aData);
    } catch (err: any) {
      console.error("Failed to load analytics", err);
      setError(err.message || 'Gagal memuat data analitik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <FilterContext.Provider value={{
      filters,
      setFilters,
      bismillahData,
      alhamdulillahData,
      loading,
      error,
      refreshData: loadData
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
