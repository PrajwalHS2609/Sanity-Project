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
  params: { slug: string }; // Type definition for params
}) {
  // `params` is already an object, but we will ensure to handle it correctly.
  const { slug } = params;

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

// Static Params Generation for SSR
export async function generateStaticParams() {
  const posts = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "post"]{ slug }`
  );

  return posts.map((post) => ({
    params: { slug: post.slug.current },
  }));
}

// Metadata generation
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, {
    slug: params.slug,
  });

  return {
    title: post?.title || "Post",
  };
}
