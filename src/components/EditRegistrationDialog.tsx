import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  surname: z.string().min(1, 'Surname is required').max(100),
  mobile_number: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
  alternate_mobile_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length === 10 && /^\d+$/.test(val)),
      'Alternate mobile must be 10 digits'
    ),
  emergency_contact_number: z
    .string()
    .min(10, 'Emergency contact must be 10 digits')
    .max(10, 'Emergency contact must be 10 digits')
    .regex(/^\d+$/, 'Emergency contact must contain only digits'),
  aadhaar_number: z
    .string()
    .min(12, 'Aadhaar must be 12 digits')
    .max(12, 'Aadhaar must be 12 digits')
    .regex(/^\d+$/, 'Aadhaar must contain only digits'),
  address: z.string().optional(),
  age: z.string().optional(),
  bp: z.string().optional(),
  hypertension: z.enum(['Yes', 'No', '']).optional(),
  sugar: z.enum(['Yes', 'No', '']).optional(),
});

type EditFormData = z.infer<typeof editSchema>;

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
}

interface EditRegistrationDialogProps {
  registration: Registration;
}

export function EditRegistrationDialog({ registration }: EditRegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: registration.name,
      surname: registration.surname,
      mobile_number: registration.mobile_number,
      alternate_mobile_number: registration.alternate_mobile_number || '',
      emergency_contact_number: registration.emergency_contact_number,
      aadhaar_number: registration.aadhaar_number,
      address: registration.address || '',
      age: registration.age?.toString() || '',
      bp: registration.bp || '',
      hypertension: (registration.hypertension as 'Yes' | 'No' | '') || '',
      sugar: (registration.sugar as 'Yes' | 'No' | '') || '',
    },
  });

  const hypertension = watch('hypertension');
  const sugar = watch('sugar');

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('sangat_registrations')
        .update({
          name: data.name,
          surname: data.surname,
          mobile_number: data.mobile_number,
          alternate_mobile_number: data.alternate_mobile_number || null,
          emergency_contact_number: data.emergency_contact_number,
          aadhaar_number: data.aadhaar_number,
          address: data.address || null,
          age: data.age ? parseInt(data.age) : null,
          bp: data.bp || null,
          hypertension: data.hypertension || null,
          sugar: data.sugar || null,
        })
        .eq('id', registration.id);

      if (error) throw error;

      toast({
        title: 'Updated Successfully',
        description: 'Registration has been updated.',
      });

      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input id="edit-name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-surname">Surname *</Label>
              <Input id="edit-surname" {...register('surname')} />
              {errors.surname && (
                <p className="text-sm text-destructive">{errors.surname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile Number *</Label>
              <Input
                id="edit-mobile"
                type="tel"
                maxLength={10}
                {...register('mobile_number')}
              />
              {errors.mobile_number && (
                <p className="text-sm text-destructive">{errors.mobile_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-alt-mobile">Alternate Mobile</Label>
              <Input
                id="edit-alt-mobile"
                type="tel"
                maxLength={10}
                {...register('alternate_mobile_number')}
              />
              {errors.alternate_mobile_number && (
                <p className="text-sm text-destructive">
                  {errors.alternate_mobile_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergency">Emergency Contact *</Label>
              <Input
                id="edit-emergency"
                type="tel"
                maxLength={10}
                {...register('emergency_contact_number')}
              />
              {errors.emergency_contact_number && (
                <p className="text-sm text-destructive">
                  {errors.emergency_contact_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-aadhaar">Aadhaar Number *</Label>
              <Input
                id="edit-aadhaar"
                type="text"
                maxLength={12}
                {...register('aadhaar_number')}
              />
              {errors.aadhaar_number && (
                <p className="text-sm text-destructive">{errors.aadhaar_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-age">Age</Label>
              <Input
                id="edit-age"
                type="number"
                min={1}
                max={150}
                {...register('age')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bp">BP Reading</Label>
              <Input id="edit-bp" {...register('bp')} />
            </div>

            <div className="space-y-2">
              <Label>Hypertension</Label>
              <Select
                value={hypertension || ''}
                onValueChange={(val) =>
                  setValue('hypertension', val as 'Yes' | 'No' | '')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sugar / Diabetes</Label>
              <Select
                value={sugar || ''}
                onValueChange={(val) => setValue('sugar', val as 'Yes' | 'No' | '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea id="edit-address" {...register('address')} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
