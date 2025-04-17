import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - GraphiXo',
  description: 'Latest news and tutorials about image editing',
  alternates: {
    canonical: '/blog'
  }
};

// This would normally come from an API or database
const blogPosts = [
  {
    id: 1,
    title: '5 Creative Ways to Use Our AI Background Remover',
    excerpt: 'Discover innovative applications for our background removal tool beyond just product photos.',
    date: 'May 15, 2023',
    image: '/assets/images/blog-1.webp',
    category: 'Tutorial',
    readTime: '4 min read'
  },
  {
    id: 2,
    title: 'The Future of AI in Image Editing',
    excerpt: 'How machine learning is revolutionizing creative workflows and what to expect next.',
    date: 'April 28, 2023',
    image: '/assets/images/blog-2.webp',
    category: 'Insights',
    readTime: '6 min read'
  },
  {
    id: 3,
    title: 'Behind the Scenes: How Our Generative Fill Works',
    excerpt: 'A technical deep dive into the algorithms powering our most popular feature.',
    date: 'March 10, 2023',
    image: '/assets/images/blog-3.webp',
    category: 'Technology',
    readTime: '8 min read'
  },
  {
    id: 4,
    title: 'Mastering Color Grading with AI Assistants',
    excerpt: 'How our new AI color matching tool can help achieve professional-grade color correction.',
    date: 'February 22, 2023',
    image: '/assets/images/blog-4.webp',
    category: 'Tutorial',
    readTime: '5 min read'
  },
  {
    id: 5,
    title: 'Comparing Traditional vs. AI-Powered Photo Editing',
    excerpt: 'When to use manual techniques and when to let AI handle the heavy lifting.',
    date: 'January 18, 2023',
    image: '/assets/images/blog-5.webp',
    category: 'Insights',
    readTime: '7 min read'
  },
  {
    id: 6,
    title: 'How We Built Our Real-Time Image Enhancement API',
    excerpt: 'The architecture decisions behind our lightning-fast image processing service.',
    date: 'December 5, 2022',
    image: '/assets/images/blog-6.webp',
    category: 'Technology',
    readTime: '9 min read'
  }
];

const categories = [
  { name: 'All', slug: 'all', count: 6 },
  { name: 'Tutorial', slug: 'tutorial', count: 2 },
  { name: 'Insights', slug: 'insights', count: 2 },
  { name: 'Technology', slug: 'technology', count: 2 }
];

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const activeCategory = (await searchParams).category || 'all';
  
  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category.toLowerCase() === activeCategory);

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4"><Link href="/">Graphi<span className='text-green-600'>X</span>o</Link> Blog</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tips, tutorials, and insights about AI-powered image editing
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map(category => (
          <Link
            key={category.slug}
            href={`/blog?category=${category.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === category.slug ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
          >
            {category.name} ({category.count})
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {filteredPosts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition border border-gray-200">
            <div className="relative h-48">
              <Image 
                src={post.image} 
                alt={post.title} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="inline-block bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">{post.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/blog/${post.id}`} className="hover:text-purple-600 transition">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <p className="text-sm text-gray-500">{post.date}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        <button className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg transition font-medium">
          Load More Articles
        </button>
      </div>
    </main>
  );
}