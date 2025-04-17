import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | GraphiXo Blog',
    default: 'Blog - GraphiXo'
  },
  description: 'Latest news and tutorials about image editing',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/blog" className="text-2xl font-bold">
            Graphi<span className="text-green-600">X</span>o Blog
          </Link>
        </div>
      </header>
      {children}
    </>
  );
}