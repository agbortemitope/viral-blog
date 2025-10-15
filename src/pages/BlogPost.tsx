import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-blog.jpg";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  image_url: string | null;
  read_time: string;
  created_at: string;
  view_count: number;
}

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState<number>(0);

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post?.id) {
      trackView(post.id);
    }
  }, [post?.id]);

  const trackView = async (postId: string) => {
    try {
      // Generate a viewer ID from localStorage or create a new one
      let viewerId = localStorage.getItem('blog-viewer-id');
      if (!viewerId) {
        viewerId = crypto.randomUUID();
        localStorage.setItem('blog-viewer-id', viewerId);
      }

      // Check if we've already viewed this post recently
      const lastViewed = localStorage.getItem(`blog-view-${postId}`);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (lastViewed && (now - parseInt(lastViewed)) < oneDay) {
        // Already viewed recently, don't track again
        return;
      }

      const response = await fetch('/.netlify/functions/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          viewerId
        })
      });

      if (response.ok) {
        const { viewCount: newViewCount, alreadyViewed } = await response.json();
        setViewCount(newViewCount);
        
        if (!alreadyViewed) {
          // Store the view timestamp
          localStorage.setItem(`blog-view-${postId}`, now.toString());
        }
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const fetchPost = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPost(data);
        setViewCount(data.view_count || 0);
      }
    } catch (error: any) {
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Post Not Found</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const postImage = post.image_url || heroImage;
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
          
          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author_name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.read_time}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {viewCount.toLocaleString()} views
              </span>
            </div>
            
            <div className="aspect-[16/9] rounded-2xl overflow-hidden">
              <img 
                src={postImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="mt-8 whitespace-pre-line leading-relaxed">
                {post.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-3xl font-display font-semibold mt-12 mb-4">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={index} className="text-2xl font-display font-semibold mt-8 mb-3">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.trim() === '') {
                    return <div key={index} className="h-4" />;
                  }
                  return (
                    <p key={index} className="text-foreground/90 mb-4">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Written by</p>
                <p className="font-display text-xl font-semibold">{post.author_name}</p>
              </div>
              <Button onClick={() => navigate("/")}>
                More Articles
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
