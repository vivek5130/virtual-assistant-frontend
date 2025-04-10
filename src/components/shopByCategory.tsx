
import  { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1
        }
      }
    ],
    arrows: true,
  };

  if (loading) return <div className="text-center py-12">Loading products...</div>;

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        {Object.entries(categorizedProducts).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{category}</h3>
            <Slider {...sliderSettings}>
              {(items as any[]).map((item: any) => (
                <div key={item._id} className="px-2">
                  <div
                    className="h-[380px] flex flex-col justify-between bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 text-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-40 w-full object-contain mb-3"
                    />
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">₹{item.price}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-sm text-yellow-500 mt-1">⭐ {item.rating}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        ))}
      </div>

      <style>{`
        .slick-prev:before, .slick-next:before {
          font-size: 36px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default ShopByCategory;
