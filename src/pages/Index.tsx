import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-blog.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  image_url: string | null;
  read_time: string;
  created_at: string;
  view_count: number;
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ["All", "Technology", "Design", "Development", "Business", "Lifestyle", "Other"];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  
  const filteredPosts = selectedCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const postsWithFormattedData = filteredPosts.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    date: new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: post.read_time,
    image: post.image_url || heroImage,
    viewCount: post.view_count,
  }));

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">Welcome to Viral</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-display font-bold leading-tight">
                Share Ideas That Go Viral
              </h1>
              <p className="text-xl text-muted-foreground">
                A platform for creators to share their stories, insights, and ideas with the world.
              </p>
              <Link to="/create">
                <Button size="lg" className="group">
                  Start Writing
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
              <img 
                src={heroImage} 
                alt="Blog hero"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : postsWithFormattedData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet. Be the first to write!</p>
              <Link to="/create">
                <Button>Create Post</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postsWithFormattedData.map(post => (
                <BlogCard key={post.id} {...post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              © 2024 Viral. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with passion for writing and technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
