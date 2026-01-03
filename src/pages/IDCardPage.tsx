import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IDCard } from '@/components/IDCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function IDCardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sangat_registrations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading ID Card</h1>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'Member not found'}
        </p>
        <Button onClick={() => navigate('/')} variant="outline">
          Back to Home
        </Button>
      </div>
    );
  }

  // Generate a member ID (you can customize this)
  const memberId = `RSSB-${member.id.toString().padStart(6, '0')}`;
  
  // Set issue date to today and expiry to 1 year from now
  const issueDate = new Date().toISOString();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return (
    <div className="container mx-auto py-8">
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Registrations
      </Button>
      
      <IDCard
        name={member.name}
        surname={member.surname}
        mobileNumber={member.mobile_number}
        aadhaarNumber={member.aadhaar_number}
        photoUrl={member.image_url}
        idNumber={memberId}
        issueDate={issueDate}
        expiryDate={expiryDate.toISOString()}
      />
    </div>
  );
}
