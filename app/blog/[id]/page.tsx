import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Define the type for our blog post
export type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  readTime: string;
  tags: string[];
};

// Mock database of blog posts
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '5 Creative Ways to Use Our AI Background Remover',
    excerpt: 'Discover innovative applications for our background removal tool beyond just product photos.',
    content: `
      <p>When most people think of background removal tools, they imagine simple product photo editing for e-commerce. While that's certainly a valuable use case, our AI Background Remover can do so much more. Here are five creative applications you might not have considered:</p>
      
      <h2>1. Digital Scrapbooking</h2>
      <p>Remove backgrounds from personal photos to create layered, artistic scrapbook pages. Combine images seamlessly without harsh edges or awkward borders.</p>
      
      <h2>2. Custom Wallpaper Design</h2>
      <p>Extract elements from multiple images and combine them to create unique phone or desktop wallpapers. The background removal ensures clean compositions.</p>
      
      <h2>3. Meme Creation</h2>
      <p>Isolate people or objects from their original context to create humorous memes. The cleaner the extraction, the more professional your memes will look.</p>
      
      <h2>4. Artistic Composites</h2>
      <p>Combine elements from different photos to create surreal or fantasy images. Background removal is the first step in creating believable composites.</p>
      
      <h2>5. Presentation Graphics</h2>
      <p>Make your business presentations stand out by incorporating clean, background-free images that don't distract from your message.</p>
      
      <p>These are just a few examples - with a little creativity, the possibilities are endless. What will you create with our background remover?</p>
    `,
    date: 'May 15, 2023',
    image: '/assets/images/blog-1.webp',
    category: 'Tutorial',
    author: {
      name: 'Sarah Johnson',
      avatar: '/assets/images/authors/sarah.jpg',
      role: 'Product Designer'
    },
    readTime: '4 min read',
    tags: ['AI Tools', 'Photo Editing', 'Creativity']
  },
  {
    id: 2,
    title: 'The Future of AI in Image Editing',
    excerpt: 'How machine learning is revolutionizing creative workflows and what to expect next.',
    content: `
      <p>The image editing landscape is undergoing a seismic shift thanks to advances in artificial intelligence. What once required hours of manual work can now be accomplished with a few clicks. But this is just the beginning.</p>
      
      <h2>The Current State</h2>
      <p>Today's AI-powered tools excel at:</p>
      <ul>
        <li>Automated background removal</li>
        <li>Object recognition and selection</li>
        <li>Color correction and enhancement</li>
        <li>Basic retouching and restoration</li>
      </ul>
      
      <h2>Emerging Technologies</h2>
      <p>On the horizon, we're seeing development in:</p>
      <ul>
        <li>Context-aware editing that understands relationships between objects</li>
        <li>Style transfer that can apply complex artistic styles automatically</li>
        <li>Predictive editing that suggests improvements</li>
        <li>3D reconstruction from 2D images</li>
      </ul>
      
      <h2>The Creative Impact</h2>
      <p>Rather than replacing designers, these tools are democratizing creativity. Professionals can focus on high-level creative decisions while AI handles repetitive tasks. Meanwhile, beginners can achieve results that were previously out of reach.</p>
      
      <p>The future of image editing isn't about removing the human element - it's about amplifying human creativity with intelligent assistance.</p>
    `,
    date: 'April 28, 2023',
    image: '/assets/images/blog-2.webp',
    category: 'Insights',
    author: {
      name: 'Michael Chen',
      avatar: '/assets/images/authors/michael.jpg',
      role: 'AI Researcher'
    },
    readTime: '6 min read',
    tags: ['AI', 'Future Tech', 'Machine Learning']
  },
  {
    id: 3,
    title: 'Behind the Scenes: How Our Generative Fill Works',
    excerpt: 'A technical deep dive into the algorithms powering our most popular feature.',
    content: `
      <p>Our Generative Fill feature has become one of GraphiXo's most loved tools, allowing users to seamlessly extend or modify images with AI-generated content. But how does it actually work?</p>
      
      <h2>The Technology Stack</h2>
      <p>At its core, Generative Fill combines several advanced technologies:</p>
      <ul>
        <li>Diffusion models for high-quality image generation</li>
        <li>Semantic understanding of image content</li>
        <li>Context-aware inpainting algorithms</li>
        <li>Style matching to maintain consistency</li>
      </ul>
      
      <h2>Step-by-Step Process</h2>
      <ol>
        <li><strong>Analysis Phase:</strong> The system examines the selected area and surrounding pixels to understand context, lighting, textures, and patterns.</li>
        <li><strong>Generation Phase:</strong> Multiple potential fills are generated using our proprietary diffusion model, each offering slightly different interpretations.</li>
        <li><strong>Selection Phase:</strong> The most contextually appropriate generation is selected based on visual coherence with the original image.</li>
        <li><strong>Blending Phase:</strong> The generated content is seamlessly blended with the original image, adjusting for color balance and edge transitions.</li>
      </ol>
      
      <h2>Optimizations</h2>
      <p>To make this computationally intensive process fast enough for interactive use, we've developed several optimizations:</p>
      <ul>
        <li>Progressive rendering that shows quick previews that refine over time</li>
        <li>Hardware-accelerated neural network inference</li>
        <li>Smart caching of intermediate results</li>
      </ul>
      
      <p>While the technical details are complex, our goal is simple: to make advanced image editing accessible to everyone, regardless of technical skill.</p>
    `,
    date: 'March 10, 2023',
    image: '/assets/images/blog-3.webp',
    category: 'Technology',
    author: {
      name: 'David Park',
      avatar: '/assets/images/authors/david.jpg',
      role: 'Lead Engineer'
    },
    readTime: '8 min read',
    tags: ['Algorithms', 'AI', 'Technical']
  },
  {
    id: 4,
    title: 'Mastering Color Grading with AI Assistants',
    excerpt: 'How our new AI color matching tool can help achieve professional-grade color correction.',
    content: `
      <p>Color grading is often what separates amateur-looking images from professional ones. With our new AI Color Assistant, achieving cinematic color grades has never been more accessible. Here's how it works and how to get the most from it.</p>
      
      <h2>The Science of Color Perception</h2>
      <p>Our AI doesn't just adjust colors mechanically—it understands how humans perceive color relationships:</p>
      <ul>
        <li>Automatic skin tone preservation</li>
        <li>Context-aware color harmony</li>
        <li>Dynamic range optimization</li>
        <li>Cross-media consistency (print vs. digital)</li>
      </ul>
      
      <h2>Five Professional Techniques Made Easy</h2>
      <ol>
        <li><strong>Color Matching:</strong> Automatically match colors across different shots in a series</li>
        <li><strong>Mood Transfer:</strong> Apply the color palette from reference images while preserving your content</li>
        <li><strong>Selective Grading:</strong> AI identifies and isolates elements (sky, skin, foliage) for targeted adjustments</li>
        <li><strong>Historical Styles:</strong> Apply authentic vintage film looks with accurate grain and tonality</li>
        <li><strong>Accessibility Checks:</strong> Ensure color combinations meet WCAG standards for visibility</li>
      </ol>
      
      <h2>Advanced Features for Professionals</h2>
      <p>For users who want more control:</p>
      <ul>
        <li>Non-destructive adjustment layers with AI suggestions</li>
        <li>Color grading presets that adapt to your image content</li>
        <li>Batch processing with consistent style application</li>
        <li>Color space aware transformations</li>
      </ul>
      
      <p>Whether you're a social media creator or a professional retoucher, AI color assistance can help you achieve better results faster while learning color theory principles along the way.</p>
    `,
    date: 'February 22, 2023',
    image: '/assets/images/blog-4.webp',
    category: 'Tutorial',
    author: {
      name: 'Emma Rodriguez',
      avatar: '/assets/images/authors/emma.jpg',
      role: 'Color Specialist'
    },
    readTime: '5 min read',
    tags: ['Color Grading', 'Tutorial', 'AI Assistant']
  },
  {
    id: 5,
    title: 'Comparing Traditional vs. AI-Powered Photo Editing',
    excerpt: 'When to use manual techniques and when to let AI handle the heavy lifting.',
    content: `
      <p>The photography world is divided between purists who prefer manual editing and innovators embracing AI tools. The truth is both approaches have their place—here's our professional recommendation on when to use each.</p>
      
      <h2>Cases Where AI Excels</h2>
      <p>AI tools are particularly strong for:</p>
      <ul>
        <li>Batch processing large numbers of images</li>
        <li>Technical corrections (noise reduction, sharpening)</li>
        <li>Object removal and background editing</li>
        <li>Style-consistent edits across a series</li>
        <li>Accessibility enhancements (auto-captioning, alt-text generation)</li>
      </ul>
      
      <h2>When Manual Editing Still Reigns</h2>
      <p>Human judgment is still superior for:</p>
      <ul>
        <li>Creative conceptual work</li>
        <li>Fine art photography with specific visions</li>
        <li>Precise local adjustments requiring artistic discretion</li>
        <li>Brand-specific color grading needs</li>
        <li>Correcting AI artifacts or unusual cases</li>
      </ul>
      
      <h2>The Hybrid Workflow</h2>
      <p>Most professionals find an 80/20 approach works best:</p>
      <ol>
        <li>Let AI handle initial technical corrections</li>
        <li>Use AI suggestions as starting points</li>
        <li>Make manual adjustments for creative control</li>
        <li>Use AI again for final output optimization</li>
      </ol>
      
      <h2>Performance Comparison</h2>
      <table>
        <tr>
          <th>Task</th>
          <th>Traditional Time</th>
          <th>AI Time</th>
          <th>Quality Difference</th>
        </tr>
        <tr>
          <td>Background Removal</td>
          <td>15-30 min</td>
          <td>15-30 sec</td>
          <td>AI often better</td>
        </tr>
        <tr>
          <td>Portrait Retouching</td>
          <td>20-45 min</td>
          <td>2-5 min</td>
          <td>Manual more precise</td>
        </tr>
        <tr>
          <td>Color Grading</td>
          <td>10-20 min</td>
          <td>1-3 min</td>
          <td>Depends on style</td>
        </tr>
      </table>
      
      <p>The future belongs to photographers who can skillfully combine both approaches to maximize efficiency without sacrificing creativity.</p>
    `,
    date: 'January 18, 2023',
    image: '/assets/images/blog-5.webp',
    category: 'Insights',
    author: {
      name: 'James Wilson',
      avatar: '/assets/images/authors/james.jpg',
      role: 'Professional Photographer'
    },
    readTime: '7 min read',
    tags: ['Workflow', 'Comparison', 'Photography']
  },
  {
    id: 6,
    title: 'How We Built Our Real-Time Image Enhancement API',
    excerpt: 'The architecture decisions behind our lightning-fast image processing service.',
    content: `
      <p>Our Image Enhancement API processes over 5 million images daily with average latency under 300ms. Here's the technical story of how we built this high-performance system.</p>
      
      <h2>System Architecture Overview</h2>
      <p>The three core components:</p>
      <ul>
        <li><strong>Edge Processing Nodes:</strong> Distributed globally to minimize latency</li>
        <li><strong>Model Orchestrator:</strong> Selects the optimal AI model for each request</li>
        <li><strong>Result Cache:</strong> Stores frequently accessed transformations</li>
      </ul>
      
      <h2>Key Technical Challenges</h2>
      <h3>1. Latency Reduction</h3>
      <p>Solutions we implemented:</p>
      <ul>
        <li>Model quantization to reduce size without quality loss</li>
        <li>Pre-warming GPU instances during peak periods</li>
        <li>Smart request batching</li>
      </ul>
      
      <h3>2. Cost Optimization</h3>
      <p>Our innovative approaches:</p>
      <ul>
        <li>Spot instance utilization with failover</li>
        <li>Adaptive model selection based on content complexity</li>
        <li>Cold storage archiving of intermediate results</li>
      </ul>
      
      <h2>Benchmark Results</h2>
      <p>Comparison of our API vs. major competitors (lower is better):</p>
      <table>
        <tr>
          <th>Service</th>
          <th>P50 Latency</th>
          <th>P99 Latency</th>
          <th>Success Rate</th>
        </tr>
        <tr>
          <td>GraphiXo</td>
          <td>285ms</td>
          <td>420ms</td>
          <td>99.98%</td>
        </tr>
        <tr>
          <td>Competitor A</td>
          <td>510ms</td>
          <td>1200ms</td>
          <td>99.2%</td>
        </tr>
        <tr>
          <td>Competitor B</td>
          <td>380ms</td>
          <td>950ms</td>
          <td>99.7%</td>
        </tr>
      </table>
      
      <h2>Lessons Learned</h2>
      <p>Key takeaways from our development process:</p>
      <ol>
        <li>Optimizing for the 99th percentile is more important than average case</li>
        <li>Different image types need fundamentally different processing pipelines</li>
        <li>Client-side preprocessing can dramatically reduce server load</li>
        <li>Comprehensive image metadata is crucial for smart processing</li>
      </ol>
      
      <p>We're continuing to innovate with upcoming features like region-specific processing and adaptive quality scaling based on network conditions.</p>
    `,
    date: 'December 5, 2022',
    image: '/assets/images/blog-6.webp',
    category: 'Technology',
    author: {
      name: 'Lisa Zhang',
      avatar: '/assets/images/authors/lisa.jpg',
      role: 'Systems Architect'
    },
    readTime: '9 min read',
    tags: ['API', 'Performance', 'Engineering']
  }
];

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = blogPosts.find(post => post.id === Number(params.id));
  
  if (!post) {
    return {
      title: 'Post Not Found - GraphiXo',
      description: 'The blog post you are looking for does not exist.'
    };
  }
  
  return {
    title: `${post.title} - GraphiXo`,
    description: post.excerpt,
    openGraph: {
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPosts.find(post => post.id === Number(params.id));
  
  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <article className="mb-16">
        <div className="mb-8">
          <span className="inline-block bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Image 
                src={post.author.avatar} 
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-500">{post.author.role}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {post.date} · {post.readTime}
            </div>
          </div>
        </div>

        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <Image 
            src={post.image} 
            alt={post.title} 
            fill
            className="object-cover"
          />
        </div>

        <div 
          className="prose max-w-none prose-purple prose-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="mt-12">
            <h3 className="text-sm font-medium mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">More from GraphiXo</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts
            .filter(p => p.id !== post.id)
            .map(post => (
              <div key={post.id} className="bg-purple-50 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-2">
                    <Link href={`/blog/${post.id}`} className="hover:text-purple-600 transition">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <p className="text-sm text-gray-500">{post.date}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}