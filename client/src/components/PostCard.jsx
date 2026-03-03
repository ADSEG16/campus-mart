

export default function PostCard() {
    return(
        <div className="max-w-6xl  p-4 sm:p-6 ">
        {/* Moving out Banner */}
      <div className="mt-8 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Moving out for the summer?
            </h3>
            <p className="text-gray-600">
              Don't throw it away until you're ready to actually pack your stuff!
            </p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors text-sm font-medium">
            Post Your First Item
          </button>
        </div>
      </div>
        </div>
    )
}