import { motion } from "framer-motion";
import { Box } from "lucide-react";
export const Footer = () => {
  return <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Box className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Dimensionally</span>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Contact
            </a>
          </motion.div>
        </div>

        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.3
      }} className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            Dimensionally — Transform your creative vision into any dimension.
          </p>
        </motion.div>
      </div>
    </footer>;
};