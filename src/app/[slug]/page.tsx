// src/app/[slug]/page.tsx
import { PortableText, type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  body,
  mainImage {
    asset->{
      _id,
      url
    }
  }
}`;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Expecting params to be a Promise
}) {
  const resolvedParams = await params; // Resolve the Promise to get { slug }
  const { slug } = resolvedParams;

  const post = await client.fetch<SanityDocument>(POST_QUERY, { slug }, options);

  if (!post) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <p>Post not found.</p>
      </main>
    );
  }

  const postImageUrl = post?.mainImage?.asset?.url || null;

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <div>
        <Link href="/blog" className="hover:underline">
          ← Back to posts
        </Link>
      </div>

      {postImageUrl ? (
        <Image
          src={postImageUrl}
          alt={post.title || "Post image"}
          className="aspect-video rounded-xl object-cover"
          width={550}
          height={310}
        />
      ) : (
        <p className="text-red-500">Image not available</p>
      )}

      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

      <div className="prose">
        <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </div>
    </main>
  );
}

// Optional: Pre-generate paths for static site generation
type SlugType = {
  slug: {
    current: string;
  };
};

export async function generateStaticParams() {
  const posts = await client.fetch<SlugType[]>(`*[_type == "post"]{ slug }`);
  return posts.map((post) => ({ slug: post.slug.current }));
}
