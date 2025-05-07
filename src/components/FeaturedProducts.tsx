
type Product = {
  _id: string;
  name: string;
  category: string;
  image: string;
  description : string;
  price: number;
  rating: number;
};

const featuredProducts: Product[] = [
    {
      _id: "1",
      name: "ASUS ROG Gaming Laptop",
      category: "Electronics",
      price: 96000,
      description:
        "ASUS ROG Strix G16 Gaming Laptop, 16” 16:10 FHD 165Hz Display, NVIDIA® GeForce RTX™ 4060, Intel Core i7-13650HX, 16GB DDR5, 1TB PCIe Gen4 SSD, Wi-Fi 6E, Windows 11",
      rating: 5,
      image: "https://m.media-amazon.com/images/I/81GrCeuCzxL._AC_SX466_.jpg",
    },
    {
      _id: "2",
      name: "Mens Slim Fit Formal Shirt",
      category: "Electronics",
      price: 1000,
      description: "Van Heusen Mens Slim Fit Solid Formal Shirt",
      rating: 5,
      image: "https://m.media-amazon.com/images/I/71BNKdaMENL._SX569_.jpg",
    },
    {
      _id: "3",
      name: "Men Cargo Pants",
      category: "Clothing",
      price: 700,
      description:
        "Lymio Men Cargo || Men Cargo Pants || Men Cargo Pants Cotton || Cargos for Men (Cargo-70-73)",
      rating: 4,
      image: "https://m.media-amazon.com/images/I/61JmT1iY3CL._SY741_.jpg",
    },
    {
      _id: "4",
      name: "Ethnic Kurta for Women",
      category: "Fashion",
      price: 450,
      description:
        "Foil Printed Rayon Double Layered & Tiered Ethnic with 3/4 Sleeve Length Kurta for Womens All Occasions",
      rating: 5,
      image: "https://m.media-amazon.com/images/I/71nnm20LQvL._SY741_.jpg",
    },
  ];

export function FeaturedProducts() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Featured Products
      </h2>

      {/* Mobile Carousel */}
      <div className="block lg:hidden overflow-x-auto">
        <div className="flex gap-4">
          {featuredProducts.map((product) => (
            <div
              key={product._id}
              className="min-w-[250px] flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{product.price}
                  </span>
                  <div className="flex items-center">
                    {Array.from({ length: product.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid layout for larger screens */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="h-48 w-full overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              <p className="text-gray-500 text-sm mb-2">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-600">
                  ₹{product.price}
                </span>
                <div className="flex items-center">
                  {Array.from({ length: product.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
