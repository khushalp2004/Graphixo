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
import React from "react";
  

const MobileNav = () => {
    const pathname=usePathname();
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
            <SheetContent className="sheet-content sm:w-64">
                <>
                    <Image src='/assets/images/logo-text.png' width={152} height={23} alt='Logo'/>
                    <ul className='header-nav_elements'>
                       {navLinks.map((link) => {
                        const isActive=link.route===pathname

                        return(
                            <li key={link.route} className={`${isActive && 'gradient-text'} flex whitespace-nowrap text-gray-700`}>
                                <Link className='sidebar-link cursor-pointer hover:text-gray-600' href={link.route}>
                                    <Image src={link.icon} alt='Logo' width={24} height={24} />
                                    {link.label}
                                </Link>
                            </li>
                           )
                       })}
                    </ul>
                </>
            </SheetContent>
            </Sheet>
        </SignedIn>

        <SignedOut>
            <Button asChild className="button bg-purple-600 bg-cover">
                <Link href='/sign-in'>Login</Link>
            </Button>
        </SignedOut>
      </nav>
    </header>
  )
}

export default MobileNav