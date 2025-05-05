// app/post/[slug]/page.tsx

import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
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

const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params; // Get the slug value from params

  const post = await client.fetch<SanityDocument>(
    POST_QUERY,
    { slug },
    options
  );

  // Get the main image URL
  const postImageUrl = post?.mainImage?.asset?.url || null;

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <div>
        {" "}
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>
      </div>
      {postImageUrl ? (
        <Image
          src={postImageUrl}
          alt={post.title || "Post image"}
          width={550}
          height={310}
          className="rounded-xl object-cover aspect-video"
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
