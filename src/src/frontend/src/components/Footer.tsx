import { Heart, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Branding */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">AGRI-SYNC</span>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2026. Built with</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive animate-pulse" />
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground italic">
            Connecting farms to tables, naturally 🌾
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
