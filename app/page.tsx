'use client'
import { useState } from 'react'
import { SearchRow } from './components/SearchRow'
import { ResultColumns } from './components/ResultColumns'

export default function Home() {
  const [searchData, setSearchData] = useState<{
    searchTerm: string;
    includeRestaurants: boolean;
    includeReligious: boolean;
  } | null>(null)

  const handleSearch = (
    searchTerm: string, 
    includeRestaurants: boolean, 
    includeReligious: boolean
  ) => {
    // Ensure search only happens with a non-empty search term
    if (searchTerm.trim()) {
      setSearchData({ 
        searchTerm: searchTerm.trim(), 
        includeRestaurants, 
        includeReligious 
      })
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <SearchRow onSearch={handleSearch} />
      {searchData && (
        <ResultColumns 
          searchTerm={searchData.searchTerm}
          includeRestaurants={searchData.includeRestaurants}
          includeReligious={searchData.includeReligious}
        />
      )}
    </main>
  )
}