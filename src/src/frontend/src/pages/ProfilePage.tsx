import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { ROLE_LABELS, formatDate } from '@/lib/helpers';
import { toast } from 'sonner';
import { UserProfile } from '../backend';
import { SeedGrowthLoader } from '../components/AnimatedComponents';

interface ProfilePageProps {
  navigate: (page: any, params?: any) => void;
}

export default function ProfilePage({ navigate }: ProfilePageProps) {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [contact, setContact] = useState(userProfile?.contact || '');
  const [location, setLocation] = useState(userProfile?.location || '');

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        name,
        contact,
        location,
      };

      await saveProfile.mutateAsync(updatedProfile);
      toast.success('Profile updated successfully! 🌱');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SeedGrowthLoader />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header navigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary via-accent to-secondary" />
            
            <div className="relative px-8 pb-8">
              <div className="absolute -top-16 left-8">
                <div className="w-32 h-32 rounded-full bg-background border-4 border-background flex items-center justify-center">
                  <User className="w-16 h-16 text-primary" />
                </div>
              </div>

              <div className="pt-20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-display font-bold mb-2">{userProfile.name}</h1>
                    <Badge className="bg-primary text-primary-foreground">
                      {ROLE_LABELS[userProfile.role]}
                    </Badge>
                  </div>

                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        setIsEditing(true);
                        setName(userProfile.name);
                        setContact(userProfile.contact);
                        setLocation(userProfile.location);
                      }
                    }}
                    disabled={saveProfile.isPending}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {saveProfile.isPending ? 'Saving...' : 'Save'}
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      <p className="text-lg">{userProfile.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    {isEditing ? (
                      <Input
                        id="contact"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                      />
                    ) : (
                      <p className="text-lg">{userProfile.contact}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    ) : (
                      <p className="text-lg">{userProfile.location}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label>Member Since</Label>
                    <p className="text-lg">{formatDate(userProfile.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
