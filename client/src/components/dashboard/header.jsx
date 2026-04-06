

export default function Header() {
    return(
    <div className="flex flex-col justify-start max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 py-4 sm:py-6 bg-white">
      {/* Header */}
      <div className="mb-2 sm:mb-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto sm:mx-0">
          Shop campus deals with a clean, fast, ecommerce-style experience.
        </p>
      </div>
    </div>
    )
}