import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, PenSquare, LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-display text-lg sm:text-xl font-bold">Viral</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/about") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              About
            </Link>
            
            {user ? (
              <>
                <Link to={`/profile/${user.id}`}>
                  <Button size="sm" variant="ghost">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/create">
                  <Button size="sm" variant="default">
                    <PenSquare className="h-4 w-4 mr-2" />
                    Write
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <div className="flex flex-col space-y-4 mt-8">
                <Link 
                  to="/" 
                  onClick={() => setOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                    isActive("/") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                    isActive("/about") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  About
                </Link>
                
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <>
                      <Link to={`/profile/${user.id}`} onClick={() => setOpen(false)}>
                        <Button className="w-full mb-3" variant="ghost">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Link to="/create" onClick={() => setOpen(false)}>
                        <Button className="w-full mb-3" variant="default">
                          <PenSquare className="h-4 w-4 mr-2" />
                          Write
                        </Button>
                      </Link>
                      <Button 
                        className="w-full" 
                        variant="ghost" 
                        onClick={() => {
                          signOut();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      <Button className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
