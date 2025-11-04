'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

const tourSteps: TourStep[] = [
  {
    title: '👋 Bienvenue sur BPC Funnels !',
    description: 'Créez et gérez vos tunnels de conversion en quelques minutes. Laissez-nous vous faire découvrir les fonctionnalités principales.',
  },
  {
    title: '🎯 Créez votre premier funnel',
    description: 'Un funnel est composé d\'une landing page, d\'un formulaire multi-étapes et d\'une page de remerciement. Tout est configurable visuellement.',
    action: {
      label: 'Créer un funnel',
      href: '/funnels/new',
    },
  },
  {
    title: '✏️ Form Builder intuitif',
    description: 'Modifiez vos formulaires par glisser-déposer, ajoutez des champs, personnalisez les couleurs. La prévisualisation est en temps réel.',
  },
  {
    title: '🔀 Routage automatique',
    description: 'Créez des règles pour router vos leads automatiquement vers les bons clients selon leurs réponses (budget, objectif, etc.).',
  },
  {
    title: '📊 Analytics en temps réel',
    description: 'Suivez les performances de vos funnels : taux de conversion, A/B testing, distribution par client.',
  },
  {
    title: '🚀 Vous êtes prêt !',
    description: 'Commencez par créer votre premier funnel. En cas de besoin, consultez la documentation ou le support.',
    action: {
      label: 'Commencer',
      href: '/funnels',
    },
  },
];

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasSeenTour = localStorage.getItem('bpc-funnels-tour-seen');
    if (!hasSeenTour) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('bpc-funnels-tour-seen', 'true');
    setIsOpen(false);
  };

  const handleFinish = () => {
    localStorage.setItem('bpc-funnels-tour-seen', 'true');
    setIsOpen(false);
  };

  const step = tourSteps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
          >
            <Card className="shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {step.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="flex gap-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {currentStep + 1} / {tourSteps.length}
                  </span>

                  <div className="flex gap-2">
                    {currentStep > 0 && currentStep < tourSteps.length - 1 && (
                      <Button variant="ghost" onClick={handleSkip}>
                        Passer le tour
                      </Button>
                    )}
                    
                    {currentStep < tourSteps.length - 1 ? (
                      <Button onClick={handleNext}>
                        Suivant
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleFinish} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {step.action?.label || 'Terminer'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Checklist de setup
export function SetupChecklist() {
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Créer mon premier funnel', completed: false },
    { id: 2, label: 'Configurer les règles de routage', completed: false },
    { id: 3, label: 'Tester la soumission d\'un lead', completed: false },
    { id: 4, label: 'Activer le funnel', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Premiers pas</CardTitle>
        <CardDescription>
          {completedCount}/{tasks.length} tâches complétées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-primary border-primary'
                    : 'border-gray-300'
                }`}
              >
                {task.completed && (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                )}
              </div>
              <span
                className={`flex-1 ${
                  task.completed
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                }`}
              >
                {task.label}
              </span>
            </button>
          ))}
        </div>

        {completedCount === tasks.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
          >
            <p className="text-green-800 font-medium">
              🎉 Félicitations ! Vous maîtrisez BPC Funnels !
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

