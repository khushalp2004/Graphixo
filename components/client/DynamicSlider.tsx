// components/FlowerGallery.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow, Parallax } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Play, Pause, Info } from 'lucide-react';
import image1 from "@/public/assets/images/restoreImage.webp";
import image2 from "@/public/assets/images/generativeFill.webp";
import image3 from "@/public/assets/images/objectRemove.webp";
import image4 from "@/public/assets/images/objectRecolor.webp";
import image5 from "@/public/assets/images/removeBackground.webp";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/parallax';

interface AIimages {
  id: number;
  src: string;
  alt: string;
  tech: string[];
}

const DynamicSlider = () => {
  const swiperRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const flowerImages: AIimages[] = [
    {
      id: 1,
      src: image1.src,
      alt: 'Image Restore',
      tech: ['Deep Learning', 'GAN Architecture', '4K Upscaling']
    },
    {
      id: 2,
      src: image2.src,
      alt: 'Generative Fill',
      tech: ['Stable Diffusion', 'CLIP Guidance', '2048px Resolution']
    },
    {
      id: 3,
      src: image3.src,
      alt: 'Object Remove',
      tech: ['Context-Aware Fill', 'PatchMatch', '60FPS Processing']
    },
    {
      id: 4,
      src: image4.src,
      alt: 'Object Recolor',
      tech: ['HSV Manipulation', 'Neural Filters', 'Real-time Preview']
    },
    {
      id: 5,
      src: image5.src,
      alt: 'Remove Background',
      tech: ['Semantic Segmentation', 'Alpha Matting', 'GPU Accelerated']
    },
  ];

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      swiperRef.current?.autoplay.stop();
    } else {
      swiperRef.current?.autoplay.start();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        swiperRef.current?.slidePrev();
      } else if (e.key === 'ArrowRight') {
        swiperRef.current?.slideNext();
      } else if (e.key === ' ') {
        togglePlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div 
      className={`relative ${isFullscreen ? 'fixed inset-0 bg-gradient-to-br from-gray-900 to-black z-50' : 'max-w-[1800px] mx-auto py-16 px-6'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated cursor gradient */}
      <div 
        className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-screen opacity-20 z-0"
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(236,72,153,0.5) 50%, transparent 70%)',
          transition: 'transform 0.1s ease-out'
        }}
      />
      
      <div 
        className={`relative z-10 ${isFullscreen ? 'h-full flex flex-col justify-center' : ''}`}
        data-swiper-parallax-opacity="0"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 
            className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-fuchsia-500 ${isFullscreen ? 'text-6xl' : ''}`}
            data-swiper-parallax="-300"
          >
            <span className="font-mono text-sm opacity-70 block mb-1">AI-POWERED</span>
           Features Includes
          </h2>
        </div>
        
        <div className="relative group">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              swiper.on('slideChange', () => setActiveIndex(swiper.realIndex));
            }}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow, Parallax]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            parallax={true}
            coverflowEffect={{
              rotate: 0,
              stretch: -100,  // Increased stretch to make images wider
              depth: 50,     // Reduced depth to make the effect flatter
              modifier: 1.5,
              slideShadows: false,
            }}
            spaceBetween={-100}  // Negative space to make images overlap more
            slidesPerView={3}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 5,
              renderBullet: (index, className) => {
                return `<span class="${className}" style="background: linear-gradient(to right, #0041CF, #F241D5); border-radius: 4px; width: 24px; height: 4px;"></span>`;
              },
            }}
            breakpoints={{
              640: {
                coverflowEffect: {
                  stretch: -120,
                  depth: 50,
                }
              },
              1024: {
                coverflowEffect: {
                  stretch: -150,  // Increased stretch for wider images
                  depth: 50,
                },
                slidesPerView: 3
              },
            }}
            className={`w-full ${isFullscreen ? 'h-[70vh]' : 'h-full'} swiper-container`}
            style={{
              paddingTop: '20px',
              paddingBottom: '20px'
            }}
          >
            {flowerImages.map((flower) => (
              <SwiperSlide 
                key={flower.id} 
                className="flex justify-center transition-all duration-500 ease-out"
              >
                <div className={`
                  relative bg-gradient-to-b from-gray-900/80 to-gray-800/90 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
                  shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
                  ${activeIndex === flower.id - 1 ? 
                    'scale-110 z-10 ring-1 ring-white/20' :  // Adjusted scale for center image
                    'scale-90 z-0 opacity-80 blur-[1px]'
                  }
                  hover:scale-[1.08] hover:opacity-100 hover:blur-none
                  group/card
                `}>
                  <div className="w-full aspect-video overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />
                    <img
                      src={flower.src}
                      alt={flower.alt}
                      className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${activeIndex === flower.id - 1 ? 'scale-100' : 'scale-110'}`}
                      data-swiper-parallax-scale="1.2"
                    />
                    {/* Image heading overlay */}
                    <div className={`absolute bottom-6 left-6 z-20 transition-all duration-300 ${
                      activeIndex === flower.id - 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}>
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                        {flower.alt}
                      </h3>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation buttons */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-800 to-fuchsia-500 hover:from-blue-800 hover:to-fuchsia-500 p-4 rounded-full shadow-2xl transition-all duration-300 ${isFullscreen ? '-ml-20' : '-ml-10'} hover:scale-110 opacity-0 group-hover:opacity-100 flex items-center justify-center`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="text-white w-6 h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-blue-800 to-fuchsia-500 hover:from-blue-800 hover:to-fuchsia-500 p-4 rounded-full shadow-2xl transition-all duration-300 ${isFullscreen ? '-mr-20' : '-mr-10'} hover:scale-110 opacity-0 group-hover:opacity-100 flex items-center justify-center`}
            aria-label="Next slide"
          >
            <ChevronRight className="text-white w-6 h-6" strokeWidth={2.5} />
          </button>

          {/* Control bar */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-gray-900/80 rounded-full px-5 py-2 backdrop-blur-md border border-white/10 shadow-lg ${isFullscreen ? 'scale-125' : ''}`}>
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-fuchsia-300 transition-colors p-2"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicSlider;