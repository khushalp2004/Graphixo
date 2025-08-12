"use client";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { navLinks } from "@/constants"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "../ui/button";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.actions";

const MobileNav = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [userCredits, setUserCredits] = useState<number>(0);

    useEffect(() => {
        const fetchUserCredits = async () => {
            if (user?.id) {
                const userInfo = await getUserById(user.id);
                setUserCredits(userInfo?.creditBalance || 0);
            }
        };
        fetchUserCredits();
    }, [user]);

    return (
        <header className='header'>
            <Link href='/' className='flex items-center gap-2 md:py-2'>
                <Image src='/assets/images/logo-text.png' alt='Logo' width={120} height={28}/>
            </Link>
            <nav className="flex gap-2">
                <SignedIn>
                    <UserButton afterSignOutUrl='/' />
                    <Sheet>
                        <SheetTrigger>
                            <Image
                                src='/assets/icons/menu.svg' 
                                alt='Menu'
                                width={32}
                                height={32}  
                                className="cursor-pointer"
                            />
                        </SheetTrigger>
                        <SheetContent className="sheet-content w-[280px] sm:w-80 md:w-96 p-0">
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b">
                                    <Image src='/assets/images/logo-text.png' width={152} height={23} alt='Logo'/>
                                </div>
                                <ul className='header-nav_elements p-4 flex-1 overflow-y-auto'>
                                    {navLinks.map((link) => {
                                        const isActive = link.route === pathname;
                                        const isPro = link.label === "Generative Fill";
                                        const showProLabel = isPro && userCredits <= 11;

                                        return(
                                            <li key={link.route} className={`${isActive ? 'gradient-text' : ''} flex whitespace-nowrap text-gray-700 mb-3`}>
                                                <Link className='sidebar-link cursor-pointer hover:text-gray-600 flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors' href={link.route}>
                                                    <div className="flex items-center gap-3">
                                                        <Image src={link.icon} alt='Logo' width={24} height={24} />
                                                        <span className="text-sm font-medium">{link.label}</span>
                                                    </div>
                                                    {showProLabel && (
                                                        <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                                            Pro
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </SheetContent>
                    </Sheet>
                </SignedIn>

                <SignedOut>
                    <Button asChild className="button bg-purple-600 bg-cover">
                        <Link href='/sign-in'>Get Started</Link>
                    </Button>
                </SignedOut>
            </nav>
        </header>
    )
}

export default MobileNav
