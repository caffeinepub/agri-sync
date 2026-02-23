import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sprout, Tractor, ShoppingBasket, Store, ArrowRight, Leaf, Sun } from 'lucide-react';
import { UserRole } from '../backend';
import { FloatingElement } from '../components/AnimatedComponents';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<'story' | 'language' | 'role'>('story');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const nextStep = () => {
    if (step === 'story') setStep('language');
    else if (step === 'language') setStep('role');
    else if (step === 'role' && selectedRole) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden">
      {/* Floating decorative elements */}
      <FloatingElement className="absolute top-10 left-10 text-primary/20" duration={8}>
        <Leaf className="w-24 h-24" />
      </FloatingElement>
      <FloatingElement className="absolute top-20 right-20 text-accent/20" duration={10} yOffset={15}>
        <Sun className="w-32 h-32" />
      </FloatingElement>
      <FloatingElement className="absolute bottom-20 left-1/4 text-secondary/20" duration={12}>
        <Sprout className="w-20 h-20" />
      </FloatingElement>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {step === 'story' && <StoryScreen key="story" onNext={nextStep} />}
          {step === 'language' && <LanguageScreen key="language" onNext={nextStep} />}
          {step === 'role' && (
            <RoleScreen
              key="role"
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              onNext={nextStep}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StoryScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto text-center"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Sprout className="w-32 h-32 mx-auto mb-8 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-5xl md:text-7xl font-display font-bold mb-6 text-foreground"
      >
        Welcome to AGRI-SYNC
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
      >
        A living ecosystem connecting farmers and buyers. Fresh produce, direct connections, and transparent trade.
      </motion.p>

      {/* Visual Journey */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-8 mb-12 flex-wrap"
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <Tractor className="w-10 h-10 text-primary" />
          </div>
          <p className="text-sm font-medium">Farmers Grow</p>
        </div>

        <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block" />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-3">
            <Sprout className="w-10 h-10 text-accent" />
          </div>
          <p className="text-sm font-medium">Fresh Harvest</p>
        </div>

        <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block" />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
            <ShoppingBasket className="w-10 h-10 text-secondary" />
          </div>
          <p className="text-sm font-medium">Buyers Receive</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={onNext}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full"
        >
          Get Started <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={onNext}
        className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip Introduction →
      </motion.button>
    </motion.div>
  );
}

function LanguageScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto text-center"
    >
      <h2 className="text-4xl font-display font-bold mb-4 text-foreground">
        Choose Your Language
      </h2>
      <p className="text-muted-foreground mb-12">Select your preferred language</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'English', flag: '🇬🇧', code: 'en' },
          { label: 'हिन्दी', flag: '🇮🇳', code: 'hi' },
          { label: 'తెలుగు', flag: '🇮🇳', code: 'te' },
          { label: 'தமிழ்', flag: '🇮🇳', code: 'ta' },
        ].map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all"
          >
            <div className="text-5xl mb-3">{lang.flag}</div>
            <p className="text-xl font-medium">{lang.label}</p>
          </motion.button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip →
      </button>
    </motion.div>
  );
}

function RoleScreen({
  selectedRole,
  setSelectedRole,
  onNext,
}: {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  onNext: () => void;
}) {
  const roles = [
    {
      role: UserRole.farmer,
      icon: Tractor,
      title: 'Farmer',
      description: 'I grow and sell fresh produce directly to buyers',
      color: 'bg-primary/10 border-primary text-primary',
    },
    {
      role: UserRole.homeBuyer,
      icon: ShoppingBasket,
      title: 'Home Buyer',
      description: 'I want to buy fresh produce for my household',
      color: 'bg-secondary/10 border-secondary text-secondary',
    },
    {
      role: UserRole.businessBuyer,
      icon: Store,
      title: 'Business Buyer',
      description: 'I buy in bulk for my restaurant or business',
      color: 'bg-accent/10 border-accent text-accent',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto text-center"
    >
      <h2 className="text-4xl font-display font-bold mb-4 text-foreground">
        What brings you here?
      </h2>
      <p className="text-muted-foreground mb-12">Choose your role to personalize your experience</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {roles.map((roleOption, index) => {
          const Icon = roleOption.icon;
          const isSelected = selectedRole === roleOption.role;

          return (
            <motion.button
              key={roleOption.role}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(roleOption.role)}
              className={`p-8 rounded-3xl border-2 transition-all ${
                isSelected
                  ? roleOption.color
                  : 'bg-card border-border hover:border-muted-foreground'
              }`}
            >
              <Icon className={`w-16 h-16 mx-auto mb-4 ${isSelected ? '' : 'text-muted-foreground'}`} />
              <h3 className={`text-2xl font-bold mb-3 ${isSelected ? '' : 'text-foreground'}`}>
                {roleOption.title}
              </h3>
              <p className={`text-sm ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                {roleOption.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      <Button
        onClick={onNext}
        disabled={!selectedRole}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full disabled:opacity-50"
      >
        Continue <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
}
