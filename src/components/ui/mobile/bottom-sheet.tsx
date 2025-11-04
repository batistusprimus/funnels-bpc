'use client';

import { motion, PanInfo, useAnimation } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Pourcentages de hauteur (ex: [0.3, 0.6, 0.9])
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.4, 0.9],
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    if (isOpen) {
      controls.start({
        y: `${(1 - snapPoints[currentSnap]) * 100}%`,
        transition: { type: 'spring', damping: 25, stiffness: 300 },
      });
    } else {
      controls.start({ y: '100%' });
    }
  }, [isOpen, currentSnap, controls, snapPoints]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;

    if (velocity > 500 || info.offset.y > threshold) {
      // Fermer ou snap vers le bas
      if (currentSnap === 0) {
        onClose();
      } else {
        setCurrentSnap((prev) => Math.max(0, prev - 1));
      }
    } else if (velocity < -500 || info.offset.y < -threshold) {
      // Snap vers le haut
      setCurrentSnap((prev) => Math.min(snapPoints.length - 1, prev + 1));
    } else {
      // Retour à la position actuelle
      controls.start({
        y: `${(1 - snapPoints[currentSnap]) * 100}%`,
        transition: { type: 'spring', damping: 25, stiffness: 300 },
      });
    }
  };

  if (!isOpen) return null;

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

      {/* Bottom Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ y: '100%' }}
        className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {children}
        </div>
      </motion.div>
    </>
  );
}

