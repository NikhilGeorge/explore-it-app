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

  const replaceActivity = useCallback(async (indexToReplace: number) => {
    if (!searchTerm) return
  
    setIsLoading(true)
  
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  
      // Create a JSON string of current activities to provide context
      const currentActivitiesJson = JSON.stringify(activities)
  
      const prompt = `This is a JSON array for a list of activities that can be done in one day at place ${searchTerm}: ${currentActivitiesJson}. 
      I'm fine with all the activities except the one at at index ${indexToReplace}  of the JSON array. Can you help and suggest an alternate one instead of the current one at ${indexToReplace}.
      Provide the JSON response for ONLY the replaced one in the same format as others in the existing response. Please ensure that the new one suggested is not there in the initial JSON / list shared`
  
      const result = await model.generateContent(prompt)
      const response = result.response.text()
  
      console.log('Raw Gemini Response:', response) // Add detailed logging
  
      // More robust JSON extraction
      const extractJSON = (text: string) => {
        // Remove code block markers
        const cleanedText = text
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .trim()
  
        try {
          // Try parsing the entire text
          const parsed = JSON.parse(cleanedText)
          
          // If it's an array, take the first item
          if (Array.isArray(parsed)) {
            return parsed[0]
          }
          
          return parsed
        } catch (jsonError) {
          // More aggressive extraction strategies
          try {
            // Extract object between first { and last }
            const objectMatch = cleanedText.match(/\{.*\}/s)
            if (objectMatch) {
              return JSON.parse(objectMatch[0])
            }
          } catch (extractError) {
            console.error('Failed to extract JSON', extractError)
          }
          
          return null
        }
      }
  
      const newActivity = extractJSON(response)
  
      console.log('Extracted New Activity:', newActivity) // Add detailed logging
  
      if (newActivity && 
          newActivity.activity && 
          newActivity.type && 
          newActivity.description && 
          typeof newActivity.lat === 'number' && 
          typeof newActivity.long === 'number') {
        
        // Create a new activities array with the replaced activity
        const updatedActivities = [...activities]
        updatedActivities[indexToReplace] = newActivity
        
        console.log('Updated Activities:', updatedActivities) // Add detailed logging
        
        setActivities(updatedActivities)
      } else {
        console.error('Invalid new activity structure:', newActivity)
        // Optionally, you could keep the original activity or show an error
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error replacing activity:", error)
      setIsLoading(false)
    }
  }, [searchTerm, activities])

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
            className="mb-4 p-3 bg-white rounded-lg shadow-md relative"
          >
            <h3 className="font-bold text-lg">{activity.activity}</h3>
            <p className="text-sm text-gray-600">{activity.type}</p>
            <p className="mt-2">{activity.description}</p>
            <button 
              onClick={() => replaceActivity(index)}
              className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Change Me
            </button>
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