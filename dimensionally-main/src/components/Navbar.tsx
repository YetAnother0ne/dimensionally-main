import { Box } from "lucide-react";
export const Navbar = () => {
  return <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Box className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Dimensionally</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#convert" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Convert
            </a>
            <a href="#formats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Formats
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              API
            </a>
          </div>

          <a href="#convert" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all">
            Get Started
          </a>
        </div>
      </div>
    </nav>;
};