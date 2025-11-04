'use client';

import { motion, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface SwipeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  position?: 'left' | 'right';
}

export function SwipeDrawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right',
}: SwipeDrawerProps) {
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const shouldClose =
      position === 'right' ? info.offset.x > threshold : info.offset.x < -threshold;

    if (shouldClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const slideFrom = position === 'right' ? '100%' : '-100%';
  const dragDirection = position === 'right' ? 'x' : 'x';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Drawer */}
      <motion.div
        drag={dragDirection}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        initial={{ x: slideFrom }}
        animate={{ x: 0 }}
        exit={{ x: slideFrom }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} bottom-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-73px)] p-6">{children}</div>
      </motion.div>
    </>
  );
}

