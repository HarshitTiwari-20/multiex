import { AlertTriangle, ExternalLink, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  screen: { name: string; url: string };
  onRetry: () => void;
  onOpenExternal: () => void;
};

export function TileError({ screen, onRetry, onOpenExternal }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full p-6 text-center text-muted"
      role="alert"
    >
      <AlertTriangle className="w-10 h-10 text-yellow-500 mb-3" aria-hidden="true" />
      <p className="text-text font-medium mb-1">Unable to display “{screen.name}”</p>
      <p className="text-sm mb-4 max-w-xs">
        This website does not allow embedding inside MultiView.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onOpenExternal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 text-sm font-medium transition"
        >
          <ExternalLink className="w-4 h-4" /> Open in browser
        </button>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-bg/80 text-text text-sm font-medium transition"
        >
          <RotateCcw className="w-4 h-4" /> Try again
        </button>
      </div>
    </motion.div>
  );
}