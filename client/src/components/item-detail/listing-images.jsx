// components/ExactImageDesign.jsx
import React from "react";

const ExactImageDesign = () => {
  // Placeholder images with different colors for each section
  const images = {
    main: "https://picsum.photos/id/104/800/600", // Landscape with trees
    first: "https://picsum.photos/id/15/400/400", // Forest path
    second: "https://picsum.photos/id/96/400/400", // Mountain view
    third: "https://picsum.photos/id/20/400/400" // Beach view
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Main Layout */}
      <div className="flex flex-col">
        {/* Top - Main Large Image */}
        <div className="relative group w-full">
          <div className="aspect-video overflow-hidden">
            <img
              src={images.main}
              alt="Camping Inn main view"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* CAMPING INN Overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
              CAMPING INN
            </div>
          </div>
        </div>

        {/* Bottom - Horizontal Image Row */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100">
          {/* First Image */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden">
              <img
                src={images.first}
                alt="Image 1"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* ON THE WAY Overlay on first image */}
            <div className="absolute bottom-2 left-2">
              <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
                ON THE WAY
              </div>
            </div>
          </div>

          {/* Second Image */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden">
              <img
                src={images.second}
                alt="Image 2"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Third Image */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden">
              <img
                src={images.third}
                alt="Image 3"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Fourth Image with +2 More Overlay */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden">
              <img
                src={images.second}
                alt="More images"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Overlay with +2 More */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 transition-colors">
              <div className="text-center">
                <span className="text-white text-2xl font-bold drop-shadow-lg">+2</span>
                <p className="text-white text-xs font-medium mt-0.5 drop-shadow-lg">More</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExactImageDesign;








// import React from "react";

// const ImageListing = ({ item }) => {
//   return (
//     <div className="w-full bg-white rounded-2xl overflow-hidden shadow-md">
//       <div className="aspect-video bg-gray-100 flex items-center justify-center">
//         {item.image ? (
//           <img
//             src={item.image}
//             alt={item.title}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <span className="text-gray-400">No Image Available</span>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ImageListing; 