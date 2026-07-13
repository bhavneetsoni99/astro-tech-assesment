import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterOptions } from '../types';

export const useFilterParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilters = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const setFilters = useCallback((
    filtersOrUpdater: FilterOptions | ((prev: FilterOptions) => FilterOptions)
  ) => {
    setSearchParams((prevSearchParams) => {
      const currentFilters = Object.fromEntries(prevSearchParams.entries());
      const nextFilters = typeof filtersOrUpdater === 'function' 
        ? filtersOrUpdater(currentFilters) 
        : filtersOrUpdater;

      const cleanedParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(nextFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          cleanedParams[key] = String(value);
        }
      }
      return cleanedParams;
    });
  }, [setSearchParams]);

  return { selectedFilters, setFilters };
};
