import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye } from "lucide-react";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  viewCount?: number;
}

const BlogCard = ({ id, title, excerpt, category, date, readTime, image, viewCount }: BlogCardProps) => {
  return (
    <Link to={`/post/${id}`} className="group">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-[var(--shadow-hover)] border-border/50">
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {category}
            </Badge>
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readTime}
            </span>
            {viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {viewCount.toLocaleString()}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogCard;
