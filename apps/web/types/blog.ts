export interface IBlogItem {
  id: string;
  title: string;
  description: string;
  published: boolean;
  recommended: boolean;
  image: string;
  author: string;
  publishedTime?: string;
  readingTime?: number;
}

export interface IBlogList {
  title: string;
  description: string;
  blogs: IBlogItem[];
}

export interface IBlogPageConfig {
  id: string;
  title: string;
  markdown: string;
  html?: string;
  description: string;
  type: string;
  readingTime: number;
  publishedTime: string;
  updatedTime: string;
  author: string;
  authorImage?: string;
  tags?: string[];
  meta: {
    title: string;
    description: string;
    keywords: string;
    image: string;
  };
}
