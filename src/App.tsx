import 'regenerator-runtime/runtime';
import  { useState, useEffect } from 'react';
import { Bot, Send, User, ShoppingCart, Package, CreditCard, Sparkles, Mic, MicOff, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import ShopByCategory from './components/shopByCategory';


// import CartPage from './components/CartPage';


type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isRecommendation?: boolean;
  products?: Product[];
};

type QuickQuestion = {
  id: number;
  text: string;
  response: string;
};

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  image: string;
};

const featuredProducts: Product[] = [
  {
    _id: '1',
    name: 'ASUS ROG Gaming Laptop',
    category: 'Electronics',
    price: 96000,
    description: 'ASUS ROG Strix G16 Gaming Laptop, 16” 16:10 FHD 165Hz Display, NVIDIA® GeForce RTX™ 4060, Intel Core i7-13650HX, 16GB DDR5, 1TB PCIe Gen4 SSD, Wi-Fi 6E, Windows 11',
    rating: 5,
    image: 'https://m.media-amazon.com/images/I/81GrCeuCzxL._AC_SX466_.jpg'
  },
  {
    _id: '2',
    name: 'Mens Slim Fit Formal Shirt',
    category: 'Electronics',
    price: 1000,
    description: 'Van Heusen Mens Slim Fit Solid Formal Shirt',
    rating: 5,
    image: 'https://m.media-amazon.com/images/I/71BNKdaMENL._SX569_.jpg'
  },
  {
    _id: '3',
    name: 'Men Cargo Pants',
    category: 'Clothing',
    price: 700,
    description: 'Lymio Men Cargo || Men Cargo Pants || Men Cargo Pants Cotton || Cargos for Men (Cargo-70-73)',
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/61JmT1iY3CL._SY741_.jpg'
  },
  {
    _id: '4',
    name: 'Ethnic Kurta for Women',
    category: 'Fashion',
    price: 450,
    description: 'Foil Printed Rayon Double Layered & Tiered Ethnic with 3/4 Sleeve Length Kurta for Womens All Occasions',
    rating: 5,
    image: 'https://m.media-amazon.com/images/I/71nnm20LQvL._SY741_.jpg'
  }
];

const genAI = new GoogleGenerativeAI('AIzaSyAUWLIvdLVOddI0Ihe_DefCAlaBA83yk3E');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function ShoppingAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your shopping assistant. I can help you find the perfect products based on your needs. Let me ask you a few quick questions to understand what you're looking for.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [cart, setCart] = useState<Product[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);


  const handleAddToCart = (product: Product) => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  
    const alreadyInCart = storedCart.find((item: Product) => item._id === product._id);
    if (alreadyInCart) return;
  
    const updatedCart = [...storedCart, product];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition  
  } = useSpeechRecognition({
    // continuous: true,
    // interimResults: true
  });
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://virtual-assistant-backend-wott.onrender.com/api/products');
        // const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
    console.log("Fetched products: ", products);
  }, []);

  useEffect(() => {
    if (transcript && isListening) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    console.log('Cart updated:', cart);
  }, [cart]);
  
  
  const quickQuestions: QuickQuestion[] = [
    { id: 1, text: 'Track my order', response: 'To track your order, please provide your order number and I can help you check its status.' },
    { id: 2, text: 'Return policy', response: 'Our return policy allows returns within 30 days of purchase. Items must be unused and in original packaging.' },
    { id: 3, text: 'Payment methods', response: 'We accept UPI Payments and all major credit cards, PayPal and Apple Pay.' },
    { id: 4, text: 'Find products', response: "I'll help you find the perfect products! Let me ask you a few questions." },
  ];

  const getNextQuestion = async (previousAnswers: string[]) => {
    try {
      const context = previousAnswers.join('\n');
      const prompt = `You are an AI shopping assistant conducting a focused conversation to understand customer needs. Based on the following context of previous answers:

${context}

Current question count: ${questionCount + 1}

Generate the next question for the customer. Requirements:
1. Ask only 3 essential questions maximum
2. Focus on key decision factors: purpose/use case, budget, and preferences
3. Each question should gather multiple data points
4. Be conversational and friendly
5.  Make the question sound natural, not robotic.
6. If this is the 3rd question or if you have sufficient information, respond with "COMPLETE: [brief summary of needs]"

If you don't have enough context, ask a broad but meaningful question that captures multiple requirements at once.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting next question:', error);
      return "I apologize, but I'm having trouble generating the next question. Would you like to see some recommendations based on what we've discussed so far?";
    }
  };

  const getProductRecommendations = async (context: string[]) => {
    try {
      const productsContext = products.map(p => 
        `${p.name} (${p.category}) - $${p.price} - ${p.description}`
      ).join('\n');

      const userContext = context.join('\n');
      const prompt = `You are an AI shopping assistant. Based on the following conversation with the user:

${userContext}

And these available products:

${productsContext}
do the following:

1. Analyze the user's key requirements and preferences(purpose, budget,category, preferences )
2. Recommend up to 3 most suitable products from the list
3.  For each product, explain *briefly* why it’s a good match.
4. Keep the response concise and friendly
5.Donot sound like robot, make the conversation in a human like
6. Keep your tone conversational, clear, and non-repetitive.
7. Avoid markdown formatting like "*" or headers.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        text: response.text().replace(/\*/g, ''),
        recommendedProducts: products.filter(p => 
          response.text().toLowerCase().includes(p.name.toLowerCase())
        )
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        text: "I apologize, but I'm having trouble generating recommendations right now. Please try again later.",
        recommendedProducts: []
      };
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (isListening) {
      SpeechRecognition.stopListening();
    }

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    resetTranscript();
    setIsLoading(true);

    try {
      const newContext = [...conversationContext, `User: ${inputText}`];
      setConversationContext(newContext);

      const nextResponse = await getNextQuestion(newContext);

      if (nextResponse.startsWith('COMPLETE:') || questionCount >= 2) {
        const { text, recommendedProducts } = await getProductRecommendations(newContext);
        
        const summaryMessage: Message = {
          id: messages.length + 2,
          text: "Perfect! Based on what you've told me, here are some recommendations that match your needs:",
          sender: 'bot',
          timestamp: new Date(),
        };

        const recommendationMessage: Message = {
          id: messages.length + 3,
          text: text,
          sender: 'bot',
          timestamp: new Date(),
          isRecommendation: true,
          products: recommendedProducts
        };

        setMessages(prev => [...prev, summaryMessage, recommendationMessage]);
        setQuestionCount(0);
      } else {
        const botMessage: Message = {
          id: messages.length + 2,
          text: nextResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        setQuestionCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleQuickQuestion = async (question: QuickQuestion) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: question.text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    if (question.text === 'Find products') {
      setConversationContext([]);
      setQuestionCount(0);
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: "I'll help you find the perfect products! To start, could you tell me what type of product you're looking for and how you plan to use it?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      const botMessage: Message = {
        id: messages.length + 2,
        text: question.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex">
    {/* Assistant Window */}
    <div className="fixed bottom-4 left-4 right-4 top-10 sm:bottom-20 sm:right-8 sm:left-auto sm:top-auto sm:w-[400px] sm:h-[630px] z-50 bg-white rounded-t-2xl sm:rounded-lg shadow-2xl overflow-hidden flex flex-col">
  
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="text-white" size={24} />
          <h1 className="text-xl font-semibold text-white">Shopping Assistant</h1>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
  
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex items-start gap-2 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' ? 'bg-indigo-100' : 'bg-gray-100'
                }`}
              >
                {message.sender === 'user' ? (
                  <User size={16} className="text-indigo-600" />
                ) : (
                  <Bot size={16} className="text-gray-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.isRecommendation
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.text}
                {message.isRecommendation && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                    <Sparkles size={12} />
                    <span>AI-Powered Recommendation</span>
                  </div>
                )}
              </div>
            </div>
  
            {message.products && message.products.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 pl-10">
                {message.products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-contain mb-2"
                    />
                    <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
                    <p className="text-gray-600 text-sm">₹{product.price}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: product.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xs">★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Bot size={16} />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>
  
      {/* Quick Questions */}
      <div className="p-2 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuickQuestion(q)}
              className="flex items-center gap-2 text-left p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {q.id === 1 && <Package size={14} />}
              {q.id === 2 && <ShoppingCart size={14} />}
              {q.id === 3 && <CreditCard size={14} />}
              {q.id === 4 && <Sparkles size={14} />}
              <span className="text-sm">{q.text}</span>
            </button>
          ))}
        </div>
      </div>
  
      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Type your message...'}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        {browserSupportsSpeechRecognition === false && (
          <p className="text-sm text-red-500 mt-2">
            * Browser doesn't support speech recognition.
          </p>
        )}
      </div>
    </div>
  
    {/* Success Popup */}
    {showSuccessPopup && (
      <div className="fixed bottom-28 right-4 sm:right-10 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md transition-all duration-300 z-50 max-w-[90vw] text-sm">
        ✅ Added to cart successfully!
      </div>
    )}
  
    {/* Product Details Section */}
    {selectedProduct && (
      <div className="fixed bottom-4 left-4 right-4 top-10 sm:bottom-20 sm:right-8 sm:left-auto sm:top-auto sm:w-[400px] sm:h-[630px] z-[100] bg-white rounded-t-2xl sm:rounded-lg shadow-2xl overflow-y-auto">
        <div className="w-full p-4">
          <button
            onClick={() => setSelectedProduct(null)}
            className="text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back to chat
          </button>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-48 object-contain mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedProduct.name}
            </h2>
            <p className="text-2xl font-bold text-indigo-600 mb-4">
              ₹{selectedProduct.price}
            </p>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: selectedProduct.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
  
            <button
              onClick={() => {
                handleAddToCart(selectedProduct);
                setSelectedProduct(null);
                setShowSuccessPopup(true);
                setTimeout(() => setShowSuccessPopup(false), 5000);
              }}
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  


  );
}

function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
     
     {/* Hero section */}
     <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
    
    <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg leading-tight">
      <span className="typewriter-animation block">
        Welcome to <span className="text-yellow-300">ShopSmart</span>
      </span>
    </h1>

    <p className="mt-4 text-indigo-100 text-base sm:text-lg md:text-xl max-w-md sm:max-w-xl animate-fade-in delay-[3500ms]">
      Discover amazing products with the help of our AI shopping assistant.
    </p>

    <div className="mt-8 animate-fade-in-up">
      <a
        href="#"
        className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg hover:bg-yellow-300 hover:text-black transition-transform transform hover:scale-105 duration-300"
      >
        Start Shopping
      </a>
    </div>
    
  </div>
</div>



      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
                  <div className="flex items-center">
                    {Array.from({ length: product.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
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
      </div> */}

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>

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
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-gray-500 text-sm mb-2">{product.category}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
              <div className="flex items-center">
                {Array.from({ length: product.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
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
      <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2">{product.category}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
            <div className="flex items-center">
              {Array.from({ length: product.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
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



{/* Shop by category */}
  
      <ShopByCategory/>
      
     
  
<div className="fixed bottom-4 right-4 flex flex-col items-center gap-2 z-50">
  {!isAssistantOpen && (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm px-4 py-1 rounded-full shadow-md font-medium opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]">
      How may I help you?
    </div>
  )}

  <div className="relative">
    {/* Conditional wave animation (only when assistant is closed) */}
    {!isAssistantOpen && (
      <div className="absolute inset-0 rounded-full border-4 border-indigo-400 opacity-70 animate-[wave_1.8s_ease-out_infinite] z-0" />
    )}

    <button
      onClick={() => setIsAssistantOpen(true)}
      className="relative z-10 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-transform hover:scale-110"
    >
      <Bot size={24} />
    </button>
  </div>
</div>



<ShoppingAssistant
  isOpen={isAssistantOpen}
  onClose={() => setIsAssistantOpen(false)}
/>

    </div>    
  );
}
export default App;



