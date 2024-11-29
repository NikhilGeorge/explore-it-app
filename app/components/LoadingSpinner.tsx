export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full py-10">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-ping"></div>
        <div className="relative z-10 animate-spin rounded-full h-16 w-16 border-t-4 border-b-2 border-l-2 border-blue-500 shadow-md"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-300 rounded-full opacity-50 animate-pulse"></div>
      </div>
    </div>
  )
}