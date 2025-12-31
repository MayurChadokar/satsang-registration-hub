import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, Search, Users, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Registration {
  id: string;
  name: string;
  surname: string;
  mobile_number: string;
  alternate_mobile_number: string | null;
  emergency_contact_number: string;
  aadhaar_number: string;
  address: string | null;
  age: number | null;
  bp: string | null;
  hypertension: string | null;
  sugar: string | null;
  image_url: string | null;
  created_at: string;
}

export default function Registrations() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sangat_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Registration[];
    },
    enabled: !!user && isAdmin,
  });

  const filteredRegistrations = registrations?.filter((reg) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reg.name.toLowerCase().includes(searchLower) ||
      reg.surname.toLowerCase().includes(searchLower) ||
      reg.mobile_number.includes(searchTerm) ||
      reg.aadhaar_number.includes(searchTerm)
    );
  });

  const exportToCSV = () => {
    if (!filteredRegistrations?.length) return;

    const headers = [
      'Name',
      'Surname',
      'Mobile Number',
      'Alternate Mobile',
      'Emergency Contact',
      'Aadhaar Number',
      'Address',
      'Age',
      'BP',
      'Hypertension',
      'Sugar',
      'Registration Date',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map((reg) =>
        [
          `"${reg.name}"`,
          `"${reg.surname}"`,
          `"${reg.mobile_number}"`,
          `"${reg.alternate_mobile_number || ''}"`,
          `"${reg.emergency_contact_number}"`,
          `"${reg.aadhaar_number}"`,
          `"${(reg.address || '').replace(/"/g, '""')}"`,
          reg.age || '',
          `"${reg.bp || ''}"`,
          reg.hypertension || '',
          reg.sugar || '',
          new Date(reg.created_at).toLocaleDateString('en-IN'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sangat_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center animate-fade-in">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
              Access Restricted
            </h2>
            <p className="text-muted-foreground">
              You don't have admin privileges to view registrations.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                All Registrations
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredRegistrations?.length || 0} total registrations
              </p>
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={!filteredRegistrations?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 animate-fade-in">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-hidden animate-fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRegistrations?.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              {searchTerm ? 'No registrations found matching your search.' : 'No registrations yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Emergency Contact</TableHead>
                    <TableHead>Aadhaar</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations?.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        {reg.image_url ? (
                          <img
                            src={reg.image_url}
                            alt={`${reg.name} ${reg.surname}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {reg.name} {reg.surname}
                      </TableCell>
                      <TableCell>{reg.mobile_number}</TableCell>
                      <TableCell>{reg.emergency_contact_number}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {reg.aadhaar_number.replace(/(\d{4})/g, '$1 ').trim()}
                      </TableCell>
                      <TableCell>{reg.age || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {reg.bp && <span>BP: {reg.bp}</span>}
                          {reg.hypertension === 'Yes' && (
                            <span className="text-amber-600">Hypertension</span>
                          )}
                          {reg.sugar === 'Yes' && (
                            <span className="text-amber-600">Sugar</span>
                          )}
                          {!reg.bp && reg.hypertension !== 'Yes' && reg.sugar !== 'Yes' && '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(reg.created_at).toLocaleDateString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/50 bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Radhasoami Satsang Beas • Bujurag Sangat Portal
        </div>
      </footer>
    </div>
  );
}
