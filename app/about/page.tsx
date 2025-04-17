import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - GraphiXo',
  description: 'Learn about our mission and team',
};

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4"><span className='text-gray-600'>About</span> <Link href="/">Graphi<span className="text-green-600">X</span>o</Link></h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Empowering creativity through AI-powered image transformation
        </p>
      </div>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
          <p className="mb-4">
            Founded in 2025, GraphiXo began as a passion project between developers 
            who wanted to make professional-grade image editing accessible to everyone.
          </p>
          <p>
            Today, we serve thousands of creators worldwide with our cutting-edge AI tools.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Our Mission</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Democratize Creativity",
              description: "Make advanced editing tools available to all skill levels",
              icon: "🎨"
            },
            {
              title: "Innovate Constantly",
              description: "Push boundaries of what's possible with AI",
              icon: "🚀"
            },
            {
              title: "User-First Approach",
              description: "Build tools that solve real creative challenges",
              icon: "❤️"
            }
          ].map((item, index) => (
            <div key={index} className="bg-purple-300 p-6 rounded-lg">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}