import {useEffect, useState} from 'react';
import type {Product} from '@aeki/contracts';
import {useSearchProductsQuery} from '../api/products.api';

export type SearchState =
  | {kind: 'waiting' | 'loading' | 'empty' | 'failed' | 'invalid'}
  | {kind: 'results'; products: Product[]};

export function useProductSearch() {
  const [input, setInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const normalizedQuery = input.trim().replace(/\s+/g, ' ');
  useEffect(() => {
    if (!normalizedQuery) return;
    const debounce = setTimeout(() => setAppliedQuery(normalizedQuery), 300);
    return () => clearTimeout(debounce);
  }, [normalizedQuery]);

  const searchQuery = useSearchProductsQuery(appliedQuery, {
    skip: !appliedQuery,
  });
  let state: SearchState = {kind: 'loading'};
  if (!normalizedQuery) {
    state = {kind: 'waiting'};
  } else if (searchQuery.isError && normalizedQuery === appliedQuery) {
    const error = searchQuery.error;
    const hasInvalidResponse =
      error &&
      'status' in error &&
      (error.status === 'CUSTOM_ERROR' || error.status === 'PARSING_ERROR');
    state = {kind: hasInvalidResponse ? 'invalid' : 'failed'};
  } else if (
    searchQuery.isSuccess &&
    normalizedQuery === appliedQuery &&
    !searchQuery.isFetching
  ) {
    state = searchQuery.currentData.items.length
      ? {kind: 'results', products: searchQuery.currentData.items}
      : {kind: 'empty'};
  }

  function changeInput(value: string) {
    setInput(value);
    if (!value.trim()) setAppliedQuery('');
  }

  function retrySearch() {
    void searchQuery.refetch();
  }

  return {input, state, changeInput, retrySearch};
}
