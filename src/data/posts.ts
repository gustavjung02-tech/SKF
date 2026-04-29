import postData from "./posts.json";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime?: string;
};

export const blogPosts = postData as BlogPost[];

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
