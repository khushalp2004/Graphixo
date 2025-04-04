import Sidebar from '@/components/shared/Sidebar'
import MobileNav from '@/components/shared/MobileNav'
import React from 'react'
import { Toaster } from 'sonner'

const layout = ({children}:{children: React.ReactNode}) => {
  return (
    <main className='root'>
        <Sidebar/>
        <MobileNav/>

      <div className="root-container">
        <div className="wrapper">
            {children}
        </div>
      </div>
      <Toaster />
    </main>
  )
}

export default layout
