import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';

export default function MainLayout({ children }: { children: ReactNode}) {
  return (
    <div className='font-poppins flex flex-col min-h-screen'>
      <Navbar />
      <div className="bg-background grow">
        { children }
      </div>
    </div>
  )
}
