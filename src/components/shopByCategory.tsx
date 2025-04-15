import { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react"; // optional icon lib

const ShopByCategory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://virtual-assistant-backend-wott.onrender.com/api/products")
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const categorizedProducts = products.reduce((acc: { [key: string]: any[] }, product: any) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  // Custom arrow components
  const CustomPrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow left-[-20px] md:left-[-30px]`}
        style={{ ...style, display: "block", zIndex: 1 }}
        onClick={onClick}
      >
        <ChevronLeft size={32} className="text-gray-600" />
      </div>
    );
  };

  const CustomNextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow right-[-20px] md:right-[-30px]`}
        style={{ ...style, display: "block", zIndex: 1 }}
        onClick={onClick}
      >
        <ChevronRight size={32} className="text-gray-600" />
      </div>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          arrows: false, // hide arrows on small screens
        }
      }
    ]
  };

  if (loading) return <div className="text-center py-12">Loading products...</div>;

  return (
    <div className="bg-gray-100 py-12" id = "shopByCategory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>

        {Object.entries(categorizedProducts).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{category}</h3>
            <div className="relative">
              <Slider {...sliderSettings}>
                {(items as any[]).map((item: any) => (
                  <div key={item._id} className="px-2">
                    <div className="h-[380px] flex flex-col justify-between bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 text-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-40 w-full object-contain mb-3"
                      />
                      <div>
                        <h4 className="text-md font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm font-semibold text-gray-500 mt-1">₹{item.price}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                        {/* <p className="text-sm text-yellow-500 mt-1">⭐ {item.rating}</p> */}
                        <div className="flex items-center justify-center mt-1 text-yellow-500 text-sm">
                        <div className="flex items-center justify-center mt-1 text-yellow-500 text-base sm:text-lg md:text-xl">
  {Array.from({ length: 5 }, (_, i) => (
    <span key={i}>
      {item.rating >= i + 1
        ? "★"
        : item.rating >= i + 0.5
        ? "☆"
        : "✩"}
    </span>
  ))}
</div>

</div>

                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        ))}
      </div>

      <style>{`
  .custom-arrow {
    position: absolute;
    top: 40%;
    transform: translateY(-50%);
    cursor: pointer;
  }
  .slick-prev:before,
  .slick-next:before {
    display: none !important;
  }
    .slick-dots {
  display: flex !important;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.slick-dots::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

  @media (max-width: 640px) {
    .custom-arrow {
      display: none !important;
    }
  }
`}</style>
``
    </div>
  );
};

export default ShopByCategory;
