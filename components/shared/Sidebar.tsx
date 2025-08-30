"use client";

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { navLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserById } from '@/lib/actions/user.actions';

const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [creditBalance, setCreditBalance] = useState(0);

    useEffect(() => {
        const fetchCredits = async () => {
            if (user?.id) {
                const userInfo = await getUserById(user.id);
                setCreditBalance(userInfo?.creditBalance || 0);
            }
        };
        fetchCredits();
    }, [user]);

    return (
        <aside className='sidebar'>
            <div className="flex size-full flex-col gap-4">
                <Link href='/' className='sidebar-logo'>
                    <Image src='/assets/images/logo-text.png' alt='Logo' width={180} height={28}/>
                </Link>
                <nav className='sidebar-nav'>
                    <SignedIn>
                        <ul className='sidebar-nav_elements space-y-2'>
                            {navLinks.slice(0,6).map((link) => {
                                const isActive = link.route === pathname;
                                const isPro = link.label === "Generative Fill" || link.label=== "Text to Image";
                                const showProLabel = isPro && creditBalance <= 11;

                                return(
                                    <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-gradient-to-r from-blue-800 to-fuchsia-500 text-white' : 'text-gray-700'}`}>
                                        <Link className={`sidebar-link flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActive ? '' : 'hover:bg-gray-50 hover:shadow-sm'}`} href={link.route}>
                                            <div className="flex items-center gap-3">
                                                <Image src={link.icon} alt='Logo' width={20} height={20} className={`${isActive ? 'brightness-200' : 'brightness-50'}`}/>
                                                <span className="text-sm font-medium">{link.label}</span>
                                            </div>
                                            {showProLabel && (
                                                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-semibold">
                                                    Pro
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                        <ul className='sidebar-nav_elements space-y-2 mt-4'>
                            {navLinks.slice(6).map((link) => {
                                const isActive = link.route === pathname;
                                return(
                                    <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-gradient-to-r from-blue-800 to-fuchsia-500 text-white' : 'text-gray-700'}`}>
                                        <Link className={`sidebar-link flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive ? '' : 'hover:bg-gray-50 hover:shadow-sm'}`} href={link.route}>
                                            <Image src={link.icon} alt='Logo' width={20} height={20} className={`${isActive ? 'brightness-200' : 'brightness-50'}`}/>
                                            <span className="text-sm font-medium">{link.label}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                            <li className="flex justify-center items-center cursor-pointer gap-2 p-4 mt-4">
                                <UserButton afterSignOutUrl='/' showName/>
                            </li>
                        </ul>
                    </SignedIn>

                    <SignedOut>
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

export default Sidebar
