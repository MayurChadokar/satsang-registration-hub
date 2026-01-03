import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Upload, CheckCircle, Loader2, X } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const registrationSchema = z.object({
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
  gender: z.enum(['Male', 'Female']).optional(),
  hypertension: z.enum(['Yes', 'No']).optional(),
  sugar: z.enum(['Yes', 'No']).optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<string>('Not tested');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent));
  }, []);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Could not access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob and create a file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const hypertension = watch('hypertension');
  const sugar = watch('sugar');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Validate file type - accept all common image formats
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: 'Invalid File',
          description: `File type "${file.type}" is not supported. Please select JPG, PNG, GIF, or WebP.`,
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      console.log('Image file accepted and preview created');
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  // Test storage connection
  const testStorageConnection = async () => {
    setStorageStatus('Testing...');
    try {
      console.log('=== Testing Storage Connection ===');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 10) + '...');
      
      // Test basic Supabase connection first
      console.log('Testing basic Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('sangat_registrations')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('❌ Basic Supabase connection failed:', connectionError);
        setStorageStatus(`❌ Supabase connection failed: ${connectionError.message}`);
        return;
      }
      
      console.log('✅ Basic Supabase connection working');
      
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('❌ Bucket test failed:', bucketError);
        console.error('Full error details:', bucketError);
        setStorageStatus(`❌ Storage error: ${bucketError.message}`);
        return;
      }
      
      console.log('✅ Buckets found:', buckets?.map(b => b.name));
      console.log('Total buckets:', buckets?.length);
      console.log('Raw buckets data:', buckets);
      
      if (!buckets || buckets.length === 0) {
        setStorageStatus('❌ No buckets found - check Supabase project and permissions');
        return;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'sangat-images');
      
      if (!bucketExists) {
        console.error('❌ Bucket "sangat-images" not found');
        console.log('Available buckets:', buckets?.map(b => b.name));
        setStorageStatus(`❌ Bucket "sangat-images" not found. Available: ${buckets?.map(b => b.name).join(', ')}`);
      } else {
        console.log('✅ Bucket "sangat-images" exists');
        setStorageStatus('✅ Storage connected and bucket exists');
        
        // Test upload permissions
        console.log('=== Testing Upload Permissions ===');
        try {
          const testFileName = `test-${Date.now()}.txt`;
          const testFile = new Blob(['test'], { type: 'text/plain' });
          
          const { error: uploadError } = await supabase.storage
            .from('sangat-images')
            .upload(testFileName, testFile);
            
          if (uploadError) {
            console.error('❌ Upload test failed:', uploadError);
            setStorageStatus(`✅ Bucket exists but upload failed: ${uploadError.message}`);
          } else {
            console.log('✅ Upload permissions working');
            setStorageStatus('✅ Storage fully ready for image uploads!');
            
            // Clean up test file
            await supabase.storage.from('sangat-images').remove([testFileName]);
          }
        } catch (uploadTestError: any) {
          console.error('❌ Upload test error:', uploadTestError);
          setStorageStatus(`✅ Bucket exists but upload test failed: ${uploadTestError.message}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Storage test failed:', error);
      setStorageStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // ================= IMAGE UPLOAD =================
      if (imageFile) {
        // Size check (5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image must be less than 5MB');
        }

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `photo-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('sangat-images')
          .upload(fileName, imageFile, {
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(uploadError.message);
        }

        const { data } = supabase.storage
          .from('sangat-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // ================= DATABASE INSERT =================
      const { error: insertError } = await supabase
        .from('sangat_registrations')
        .insert({
          name: data.name,
          surname: data.surname,
          mobile_number: data.mobile_number,
          alternate_mobile_number: data.alternate_mobile_number || null,
          emergency_contact_number: data.emergency_contact_number,
          aadhaar_number: data.aadhaar_number,
          address: data.address || null,
          age: data.age ? parseInt(data.age) : null,
          gender: data.gender || null,
          hypertension: data.hypertension || null,
          sugar: data.sugar || null,
          image_url: imageUrl,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // ================= SUCCESS =================
      toast({
        title: 'Registration Successful',
        description: imageUrl
          ? 'Member registered with photo'
          : 'Member registered (photo optional)',
      });

      setSubmitted(true);

      setTimeout(() => {
        reset();
        setImageFile(null);
        setImagePreview(null);
        setSubmitted(false);
      }, 3000);

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Registration Complete!
          </h2>
          <p className="text-muted-foreground text-center">
            The sangat member has been successfully registered.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-primary/30 bg-secondary transition-all duration-300 hover:border-primary hover:bg-secondary/80"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Camera className="h-8 w-8 mb-1" />
                <span className="text-xs">Add Photo</span>
              </div>
            )}
          </div>
          {imagePreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={isMobile ? 'environment' : undefined}
          onChange={handleImageChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isMobile ? 'Choose from Gallery' : 'Choose Photo'}
          </Button>
          
          {isMobile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startCamera()}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          )}
        </div>

        {cameraError && (
          <p className="text-sm text-destructive text-center">{cameraError}</p>
        )}

        {/* Storage Status Test
        <div className="flex flex-col items-center space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={testStorageConnection}
            className="text-xs"
          >
            Test Storage Connection
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Status: {storageStatus}
          </p>
          {storageStatus.includes('not found') && (
            <div className="text-xs text-muted-foreground text-center max-w-xs">
              <p className="font-semibold">📋 To fix:</p>
              <p>1. Go to Supabase Dashboard → Storage</p>
              <p>2. Click "Create new bucket"</p>
              <p>3. Name: <code className="bg-muted px-1 rounded">sangat-images</code></p>
              <p>4. Check "Public bucket"</p>
              <p>5. Click "Save"</p>
            </div>
          )}
        </div> */}

        {/* Camera Preview Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={stopCamera}
                  className="rounded-full h-16 w-16 flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </Button>
                
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  onClick={captureImage}
                  className="rounded-full h-16 w-16 bg-white hover:bg-white/90"
                >
                  <div className="h-12 w-12 rounded-full bg-red-500 border-4 border-white"></div>
                </Button>
                
                <div className="w-16"></div> {/* Spacer for alignment */}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter first name"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Surname */}
        <div className="space-y-2">
          <Label htmlFor="surname">
            Surname <span className="text-destructive">*</span>
          </Label>
          <Input
            id="surname"
            placeholder="Enter surname"
            {...register('surname')}
          />
          {errors.surname && (
            <p className="text-sm text-destructive">{errors.surname.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobile_number">
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mobile_number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            maxLength={10}
            {...register('mobile_number')}
          />
          {errors.mobile_number && (
            <p className="text-sm text-destructive">
              {errors.mobile_number.message}
            </p>
          )}
        </div>

        {/* Alternate Mobile */}
        <div className="space-y-2">
          <Label htmlFor="alternate_mobile_number">Alternate Mobile</Label>
          <Input
            id="alternate_mobile_number"
            type="tel"
            inputMode="numeric"
            placeholder="Optional"
            maxLength={10}
            {...register('alternate_mobile_number')}
          />
          {errors.alternate_mobile_number && (
            <p className="text-sm text-destructive">
              {errors.alternate_mobile_number.message}
            </p>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_number">
            Emergency Contact <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emergency_contact_number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit emergency contact"
            maxLength={10}
            {...register('emergency_contact_number')}
          />
          {errors.emergency_contact_number && (
            <p className="text-sm text-destructive">
              {errors.emergency_contact_number.message}
            </p>
          )}
        </div>

        {/* Aadhaar */}
        <div className="space-y-2">
          <Label htmlFor="aadhaar_number">
            Aadhaar Card Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="aadhaar_number"
            type="text"
            inputMode="numeric"
            placeholder="12-digit Aadhaar number"
            maxLength={12}
            {...register('aadhaar_number')}
          />
          {errors.aadhaar_number && (
            <p className="text-sm text-destructive">
              {errors.aadhaar_number.message}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            placeholder="Enter age"
            min={1}
            max={150}
            {...register('age')}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={watch('gender')}
            onValueChange={(val) => setValue('gender', val as 'Male' | 'Female')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hypertension */}
        <div className="space-y-2">
          <Label>Hypertension</Label>
          <Select
            value={hypertension}
            onValueChange={(val) => setValue('hypertension', val as 'Yes' | 'No')}
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

        {/* Sugar */}
        <div className="space-y-2">
          <Label>Sugar / Diabetes</Label>
          <Select
            value={sugar}
            onValueChange={(val) => setValue('sugar', val as 'Yes' | 'No')}
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

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Enter full address"
          {...register('address')}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Registering...
          </>
        ) : (
          'Register Sangat Member'
        )}
      </Button>
    </form>
  );
}
