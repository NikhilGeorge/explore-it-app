'use client'
import React, { useState } from 'react'
import { Menu, Search, MapPin } from 'lucide-react'

interface SearchRowProps {
  onSearch: (searchTerm: string, includeRestaurants: boolean, includeReligious: boolean) => void
}

export const SearchRow: React.FC<SearchRowProps & { onToggleDarkMode?: () => void, darkMode?: boolean }> = ({ onSearch, onToggleDarkMode, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [includeRestaurants, setIncludeRestaurants] = useState(false)
  const [includeReligious, setIncludeReligious] = useState(false)

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm, includeRestaurants, includeReligious)
    }
  }

  return (
    <div className={`relative w-full ${darkMode ? 'bg-gray-900' : 'bg-blue-100'}`}>
      {/* Compact Header */}
      <div className="relative z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Heading */}
          <div className="flex items-center space-x-8">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Explore</h1>

            {/* Search and Checkbox Container */}
            <div className="flex flex-col space-y-2">
              {/* Search Input and Button */}
              <div className="flex items-center">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Enter search location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`px-3 py-2 pl-8 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-80 ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : ''}`}
                  />
                  <MapPin 
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} 
                    size={18}
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className={`px-4 py-2 rounded-r-lg transition duration-300 flex items-center text-sm ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  <Search className="mr-1" size={16} />
                  Search
                </button>
              </div>

              {/* Checkboxes */}
              <div className={`flex items-center space-x-4 text-sm ${darkMode ? 'text-gray-200' : ''}`}>
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={includeRestaurants}
                    onChange={(e) => setIncludeRestaurants(e.target.checked)}
                    className="mr-1 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Restaurants
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={includeReligious}
                    onChange={(e) => setIncludeReligious(e.target.checked)}
                    className="mr-1 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Religious Places
                </label>
              </div>
            </div>
          </div>

          {/* Navigation and Menu */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle Button */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className={`px-3 py-1 rounded text-xs font-semibold border ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            )}

            {/* Navigation */}
            <nav className={`flex space-x-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <a href="#" className={`hover:text-blue-600 text-sm`}>Home</a>
              <a href="#" className={`hover:text-blue-600 text-sm`}>About</a>
              <a href="#" className={`hover:text-blue-600 text-sm`}>Contact</a>
            </nav>

            {/* Menu Icon */}
            <Menu className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`} size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}