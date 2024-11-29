'use client'
import { useState, useEffect, useCallback } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai"
import dynamic from 'next/dynamic'
import { LoadingSpinner } from './LoadingSpinner'

// Type definition for our activity
interface ActivityItem {
  activity: string
  type: string
  description: string
  lat: number
  long: number
}

// Dynamically load Leaflet map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <LoadingSpinner />
})

interface ResultColumnsProps {
  searchTerm: string
  includeRestaurants: boolean
  includeReligious: boolean
}

export const ResultColumns: React.FC<ResultColumnsProps> = ({ 
  searchTerm, 
  includeRestaurants, 
  includeReligious 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const fetchGeminiActivities = useCallback(async () => {
    if (!searchTerm) return

    // Reset loading state and activities for each search
    setIsLoading(true)
    setActivities([])

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      const prompt = `Suggest top things that can be done in ${searchTerm} in a one-day itinerary in JSON format with the following fields: activity, type, description, lat, long.`

      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // More robust JSON extraction
      const extractJSON = (text: string) => {
        // Remove code block markers
        const cleanedText = text
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .trim()

        // Try parsing directly
        try {
          return JSON.parse(cleanedText)
        } catch (jsonError) {
          // If direct parsing fails, try extracting JSON-like content
          const jsonMatch = cleanedText.match(/\[.*\]/s)
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0])
            } catch (fallbackError) {
              console.error('Failed to parse JSON', fallbackError)
              return []
            }
          }
          return []
        }
      }

      const parsedActivities: ActivityItem[] = extractJSON(response)
      
      // Fallback if no activities found
      if (parsedActivities.length === 0) {
        // Generate mock data if Gemini fails
        const mockActivities: ActivityItem[] = [
          {
            activity: `Explore ${searchTerm}`,
            type: 'Sightseeing',
            description: `A general tour of ${searchTerm}`,
            lat: 0,
            long: 0
          }
        ]
        setActivities(mockActivities)
      } else {
        setActivities(parsedActivities)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching Gemini activities:", error)
      setIsLoading(false)
    }
  }, [searchTerm])

  // Use effect to trigger search whenever searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      fetchGeminiActivities()
    }
  }, [searchTerm, fetchGeminiActivities])

  // If loading, always show the spinner
  if (isLoading) return <LoadingSpinner />

  return (
    <div className="flex w-full h-[calc(100vh-100px)]">
      {/* Left Column - Activities List */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">One-Day Itinerary</h2>
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className="mb-4 p-3 bg-white rounded-lg shadow-md"
          >
            <h3 className="font-bold text-lg">{activity.activity}</h3>
            <p className="text-sm text-gray-600">{activity.type}</p>
            <p className="mt-2">{activity.description}</p>
          </div>
        ))}
      </div>
      
      {/* Right Column - Map */}
      <div className="w-2/3 bg-white">
        <MapComponent activities={activities} />
      </div>
    </div>
  )
}