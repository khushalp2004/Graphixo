"use client";

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { navLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import React, { useState, useEffect } from 'react';
import { MagicWand, Lightning, Users } from '@phosphor-icons/react'; // or any other icon library

const slides = [
  {
    id: 1,
    title: "AI-Powered Editing",
    content: "Transform your images with our advanced AI tools",
    icon: <MagicWand size={32} weight="duotone" className="text-purple-600" />,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: 2,
    title: "Lightning Fast",
    content: "Process images in seconds with our optimized engine",
    icon: <Lightning size={32} weight="duotone" className="text-blue-600" />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: 3,
    title: "Trusted by Many",
    content: "Join our community of thousands of creators",
    icon: <Users size={32} weight="duotone" className="text-green-600" />,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection('right');
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 'right' : 'left');
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (dir: string) => ({
      x: dir === 'right' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir: string) => ({
      x: dir === 'right' ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <aside className='sidebar'>
      <div className="flex size-full flex-col gap-4">
        <Link href='/' className='sidebar-logo'>
          <Image src='/assets/images/logo-text.png' alt='Logo' width={180} height={28}/>
        </Link>
        <nav className='sidebar-nav'>
          <SignedIn>
            <ul className='sidebar-nav_elements'>
              {navLinks.slice(0,6).map((link) => {
                const isActive = link.route === pathname;

                return(
                  <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-gradient-to-r from-blue-800 to-fuchsia-500 text-white' : 'text-gray-700'}`}>
                    <Link className='sidebar-link' href={link.route}>
                      <Image src={link.icon} alt='Logo' width={24} height={24} className={`${isActive && 'brightness-200'} ${!isActive && 'brightness-50'}`}/>
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <ul className='sidebar-nav_elements'>
              {navLinks.slice(6).map((link) => {
                const isActive = link.route === pathname;

                return(
                  <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-gradient-to-r from-blue-800 to-fuchsia-500 text-white' : 'text-gray-700'}`}>
                    <Link className='sidebar-link' href={link.route}>
                      <Image src={link.icon} alt='Logo' width={24} height={24} className={`${isActive && 'brightness-200'} ${!isActive && 'brightness-50'}`}/>
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              <li className="flex justify-center items-center cursor-pointer gap-2 p-4">
                <UserButton afterSignOutUrl='/' showName/>
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <div className="mb-6">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 ${slide.bgColor} border ${slide.borderColor} rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    style={{
                      transform: `translateX(${index === currentSlide ? 0 : index > currentSlide ? '100%' : '-100%'})`
                    }}
                  >
                    <div className="mb-3">
                      {slide.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">{slide.title}</h3>
                    <p className="text-sm text-gray-600">{slide.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-sm transition-all ${index === currentSlide ? 'bg-gradient-to-r from-blue-800 to-fuchsia-500 w-6' : 'bg-gray-300'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button asChild className='button bg-purple-600 hover:bg-purple-700 transition-colors'>
                <Link href='/sign-in'>Get Started</Link>
              </Button>
            </div>
          </SignedOut>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar;