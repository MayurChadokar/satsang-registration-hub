import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, Edit, Search, Download, User, Phone, Calendar, MapPin, Image, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EditRegistrationDialog } from '@/components/EditRegistrationDialog';
import { useToast } from '@/hooks/use-toast';

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
  gender: 'Male' | 'Female' | null;
  hypertension: 'Yes' | 'No' | null;
  sugar: 'Yes' | 'No' | null;
  image_url: string | null;
  created_at: string;
}

export default function Registrations() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRegistrations();
    }
  }, [isAdmin]);

  useEffect(() => {
    const filtered = registrations.filter(reg => 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.mobile_number.includes(searchTerm) ||
      reg.aadhaar_number.includes(searchTerm)
    );
    setFilteredRegistrations(filtered);
  }, [searchTerm, registrations]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('sangat_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
      setFilteredRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleView = (registration: Registration) => {
    setSelectedRegistration(registration);
    setViewDialogOpen(true);
  };

  const handleEdit = (registration: Registration) => {
    setSelectedRegistration(registration);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchRegistrations();
    setEditDialogOpen(false);
    setSelectedRegistration(null);
  };

  const handleDelete = (registration: Registration) => {
    setSelectedRegistration(registration);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRegistration) return;
    
    setIsDeleting(true);
    try {
      // Delete the image from storage if it exists
      if (selectedRegistration.image_url) {
        const fileName = selectedRegistration.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('sangat-images').remove([fileName]);
        }
      }
      
      // Delete the registration from database
      const { error } = await supabase
        .from('sangat_registrations')
        .delete()
        .eq('id', selectedRegistration.id);
      
      if (error) throw error;
      
      toast({
        title: 'Registration Deleted',
        description: `${selectedRegistration.name} ${selectedRegistration.surname}'s registration has been deleted successfully.`,
      });
      
      fetchRegistrations();
      setDeleteDialogOpen(false);
      setSelectedRegistration(null);
    } catch (error: any) {
      console.error('Error deleting registration:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Custom image component with error handling
  const MemberAvatar = ({ imageUrl, name, surname, size = "default" }: { 
    imageUrl: string | null; 
    name: string; 
    surname: string; 
    size?: "small" | "default" | "large" 
  }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);
    
    const sizeClasses = {
      small: "h-8 w-8",
      default: "h-10 w-10", 
      large: "h-20 w-20"
    };
    
    const textSizeClasses = {
      small: "text-xs",
      default: "text-sm",
      large: "text-lg"
    };

    const handleImageError = () => {
      console.log('Image failed to load:', imageUrl);
      setImgError(true);
      setImgLoading(false);
    };

    const handleImageLoad = () => {
      setImgLoading(false);
    };

    return (
      <Avatar className={sizeClasses[size]}>
        {imageUrl && !imgError ? (
          <AvatarImage 
            src={imageUrl} 
            alt={`${name} ${surname}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : null}
        <AvatarFallback className={textSizeClasses[size]}>
          {imgLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {name.charAt(0)}{surname.charAt(0)}
            </>
          )}
        </AvatarFallback>
      </Avatar>
    );
  };

  if (loading || loadingRegistrations) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mx-auto max-w-md text-center animate-fade-in p-8">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            Access Restricted
          </h2>
          <p className="text-muted-foreground">
            You don't have admin privileges. Please contact the administrator to
            get access to this portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        {/* Title Section */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            All Registrations
          </h2>
          <p className="text-muted-foreground">
            View and manage all registered sangat members
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, mobile, or Aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{registrations.length}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.age && r.age >= 60).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Senior Citizens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.alternate_mobile_number).length}
                  </p>
                  <p className="text-sm text-muted-foreground">With Alternate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.address).length}
                  </p>
                  <p className="text-sm text-muted-foreground">With Address</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Emergency</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? 'No registrations found matching your search.' : 'No registrations yet.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <MemberAvatar 
                              imageUrl={registration.image_url} 
                              name={registration.name} 
                              surname={registration.surname}
                              size="small"
                            />
                            <div>
                              <div className="font-medium">
                                {registration.name} {registration.surname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {registration.aadhaar_number}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{registration.mobile_number}</div>
                            {registration.alternate_mobile_number && (
                              <div className="text-sm text-muted-foreground">
                                Alt: {registration.alternate_mobile_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{registration.emergency_contact_number}</TableCell>
                        <TableCell>
                          {registration.age ? (
                            <Badge variant={registration.age >= 60 ? "destructive" : "secondary"}>
                              {registration.age} years
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {registration.gender && (
                              <Badge variant="outline">{registration.gender}</Badge>
                            )}
                            {registration.hypertension && (
                              <Badge variant="outline">BP: {registration.hypertension}</Badge>
                            )}
                            {registration.sugar && (
                              <Badge variant="outline">Sugar: {registration.sugar}</Badge>
                            )}
                            {!registration.gender && !registration.hypertension && !registration.sugar && (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(registration.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(registration)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(registration)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(registration)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
            </DialogHeader>
            {selectedRegistration && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <MemberAvatar 
                    imageUrl={selectedRegistration.image_url} 
                    name={selectedRegistration.name} 
                    surname={selectedRegistration.surname}
                    size="large"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedRegistration.name} {selectedRegistration.surname}
                    </h3>
                    <p className="text-muted-foreground">Aadhaar: {selectedRegistration.aadhaar_number}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                    <p>{selectedRegistration.mobile_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Alternate Mobile</label>
                    <p>{selectedRegistration.alternate_mobile_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                    <p>{selectedRegistration.emergency_contact_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p>{selectedRegistration.age ? `${selectedRegistration.age} years` : 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p>{selectedRegistration.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hypertension</label>
                    <p>{selectedRegistration.hypertension || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sugar/Diabetes</label>
                    <p>{selectedRegistration.sugar || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p>{selectedRegistration.address || 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registered On</label>
                  <p>{new Date(selectedRegistration.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <EditRegistrationDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          registration={selectedRegistration}
          onSuccess={handleEditSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete the registration for:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">
                  {selectedRegistration?.name} {selectedRegistration?.surname}
                </p>
                <p className="text-sm text-muted-foreground">
                  Aadhaar: {selectedRegistration?.aadhaar_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Mobile: {selectedRegistration?.mobile_number}
                </p>
              </div>
              <p className="text-sm text-destructive">
                This action cannot be undone. The registration and associated photo (if any) will be permanently deleted.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Registration
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}