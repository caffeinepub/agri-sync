import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole, UserProfile } from '../backend';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ROLE_LABELS } from '@/lib/helpers';
import { Sprout } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contact || !location || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const profile: UserProfile = {
        name,
        contact,
        location,
        role: role as UserRole,
        createdAt: BigInt(Date.now() * 1_000_000),
      };

      await saveProfile.mutateAsync(profile);
      toast.success('Profile created successfully! Welcome to AGRI-SYNC 🌱');
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.65, 0.0, 0.35, 1] }}
            className="mx-auto mb-4"
          >
            <Sprout className="w-16 h-16 text-primary" />
          </motion.div>
          <DialogTitle className="text-center text-2xl font-display">
            Welcome to AGRI-SYNC
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Let's set up your profile to get started
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact (Phone/Email)</Label>
            <Input
              id="contact"
              type="text"
              placeholder="Phone number or email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="City, State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.farmer}>🌾 {ROLE_LABELS[UserRole.farmer]}</SelectItem>
                <SelectItem value={UserRole.homeBuyer}>🏡 {ROLE_LABELS[UserRole.homeBuyer]}</SelectItem>
                <SelectItem value={UserRole.businessBuyer}>🏢 {ROLE_LABELS[UserRole.businessBuyer]}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Creating Profile...' : 'Get Started 🌱'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
