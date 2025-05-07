const HeroSection = ()=>{
return(<div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
      
    <h1 className="text-white text-[1.7rem] xs:text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg leading-snug sm:leading-tight break-words px-2">
    <span className="typewriter-animation block">
      Welcome to <span className="text-yellow-300">ShopSmart</span>
    </span>
  </h1>
  
  
      <p className="mt-4 text-indigo-100 text-sm sm:text-base md:text-lg max-w-sm sm:max-w-xl animate-fade-in delay-[3500ms]">
        Discover amazing products with the help of our AI shopping assistant.
      </p>
  
      <div className="mt-8 animate-fade-in-up">
        <a
          href="#"
          className="inline-block bg-white text-indigo-700 font-semibold px-5 py-2 sm:px-8 sm:py-4 rounded-full shadow-lg hover:bg-yellow-300 hover:text-black transition-transform transform hover:scale-105 duration-300"
        >
          Start Shopping
        </a>
      </div>
      
    </div>
  </div>
  );
}
export default HeroSection