import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function Navbar() {
  const { user, loading } = useSession();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight">DevShelf</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            to="/explore"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            Explore
          </Link>
          {loading ? null : user ? (
            <Link to="/dashboard">
              <Button size="sm" variant="default">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                Login
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}