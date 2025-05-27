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
  const [darkMode, setDarkMode] = useState(false)

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

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      if (!prev) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return !prev
    })
  }

  return (
    <main className={`flex min-h-screen flex-col ${darkMode ? 'bg-gray-900' : ''}`}>
      <SearchRow 
        onSearch={handleSearch} 
        onToggleDarkMode={handleToggleDarkMode} 
        darkMode={darkMode} 
      />
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