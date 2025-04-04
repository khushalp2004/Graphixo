"use client";

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { navLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import React from 'react';

const Sidebar = () => {
    const pathname=usePathname();
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
                        const isActive=link.route===pathname

                        return(
                            <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-purple-600 text-white' : 'text-gray-700'}`}>
                                <Link className='sidebar-link' href={link.route}>
                                    <Image src={link.icon} alt='Logo' width={24} height={24} className={`${isActive && 'brightness-200'}`}/>
                                    {link.label}
                                </Link>
                            </li>
                           )
                       })}
                    </ul>
                    <ul className='sidebar-nav_elements'>
                    {navLinks.slice(6).map((link) => {
                        const isActive=link.route===pathname

                        return(
                            <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-purple-600 text-white' : 'text-gray-700'}`}>
                                <Link className='sidebar-link' href={link.route}>
                                    <Image src={link.icon} alt='Logo' width={24} height={24} className={`${isActive && 'brightness-200'}`}/>
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
                    <Button asChild className='button bg-purple-600 bg-cover'>
                        <Link href='/sign-in' className={`bg-gray-50 hover:bg-purple-600 hover:text-white`}>Login</Link>
                    </Button>
                </SignedOut>

            </nav>
        </div>
    </aside>
  )
}

export default Sidebar
