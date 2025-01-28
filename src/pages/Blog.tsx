import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { BlogPost } from "@/types/recipe";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          title,
          excerpt,
          published_at,
          author:profiles(username)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match BlogPost type
      const transformedPosts = (data || []).map(post => ({
        ...post,
        excerpt: post.excerpt || "",
        published_at: post.published_at || new Date().toISOString(),
        is_ai_generated: false, // Default value
        content: "", // Not needed in list view
        status: "published",
        tags: [],
        author: post.author || { username: null }
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>
                <Link to={`/blog/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                By {post.author?.username || "Anonymous"} •{" "}
                {new Date(post.published_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}