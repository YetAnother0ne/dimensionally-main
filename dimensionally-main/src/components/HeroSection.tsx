import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useConversionMode } from "@/hooks/conversion-mode";

export const HeroSection = () => {
  const { mode } = useConversionMode();
  const is2to3 = mode === "2d-to-3d";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(hsl(222 30% 20%) 1px, transparent 1px), linear-gradient(90deg, hsl(222 30% 20%) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            3D Generation
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          Transform{" "}
          <span className="gradient-text">2D to 3D</span>
          <br />
          and Back Again
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Upload images to generate stunning 3D models, or convert 3D models into beautiful 2D renders. 
          Export in any format for games, animations, or 3D printing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#convert"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all glow-effect"
          >
            Start Converting
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#formats"
            className="inline-flex items-center gap-2 px-8 py-4 glass-card font-semibold rounded-xl hover:bg-secondary/50 transition-all"
          >
            View Formats
          </a>
        </motion.div>

        {/* Floating 3D elements preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-4xl">
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="flex items-center justify-center gap-8">
                {/* 2D side */}
                <div className="text-center">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-xl bg-secondary flex items-center justify-center mb-3 overflow-hidden ${!is2to3 ? "animate-float" : ""}`}>
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg" />
                  </div>
                  <p className="text-sm text-muted-foreground">2D Image</p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{ x: is2to3 ? [0, 10, 0] : [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={is2to3 ? "text-primary" : "text-primary rotate-180"}
                  >
                    <ArrowRight className="w-8 h-8" />
                  </motion.div>
                  <div className="w-px h-8 bg-border" />
                  <motion.div
                    animate={{ x: is2to3 ? [0, -10, 0] : [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={is2to3 ? "text-accent rotate-180" : "text-accent"}
                  >
                    <ArrowRight className="w-8 h-8" />
                  </motion.div>
                </div>

                {/* 3D side */}
                <div className="text-center">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-xl bg-secondary flex items-center justify-center mb-3 ${is2to3 ? "animate-float" : ""}`}>
                    <div 
                      className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-lg"
                      style={{
                        transform: "perspective(500px) rotateX(15deg) rotateY(-15deg)",
                        boxShadow: "10px 10px 30px hsl(270 95% 65% / 0.3)"
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">3D Model</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
