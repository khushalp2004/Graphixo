import { type BlogPost } from '../[id]/page';

export async function GET() {
  const blogPosts: BlogPost[] = [
    // Same as in your blog post page
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>GraphiXo Blog</title>
      <link>https://graphixo.example.com/blog</link>
      <description>Latest news and tutorials about image editing</description>
      <language>en-us</language>
      ${blogPosts.map(post => `
        <item>
          <title>${post.title}</title>
          <link>https://graphixo.example.com/blog/${post.id}</link>
          <description>${post.excerpt}</description>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <guid>https://graphixo.example.com/blog/${post.id}</guid>
        </item>
      `).join('')}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}