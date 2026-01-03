import { Button } from "./ui/button";
import { Download, Printer } from "lucide-react";

interface IDCardProps {
  name: string;
  surname: string;
  mobileNumber: string;
  aadhaarNumber: string;
  photoUrl: string;
  idNumber: string;
  issueDate: string;
  expiryDate: string;
}

export function IDCard({
  name,
  surname,
  mobileNumber,
  aadhaarNumber,
  photoUrl,
  idNumber,
  issueDate,
  expiryDate,
}: IDCardProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('id-card-print');
    if (!element) return;
    
    const canvas = document.createElement('canvas');
    const scale = 2; // Higher scale for better quality
    
    // @ts-ignore - Using html2canvas
    return import('html2canvas').then((html2canvas) => {
      return html2canvas.default(element, {
        scale,
        logging: false,
        useCORS: true,
        allowTaint: true,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `id-card-${idNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div id="id-card-print" className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md border-2 border-gray-200 print:shadow-none print:border-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white text-center">
          <h2 className="text-xl font-bold">SATSANG MEMBER ID CARD</h2>
          <p className="text-sm opacity-90">Radha Soami Satsang Beas</p>
        </div>
        
        <div className="p-0">
          <div className="flex p-4">
            {/* Photo */}
            <div className="w-1/3 pr-4">
              <div className="border-2 border-gray-200 rounded-md overflow-hidden">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={`${name} ${surname}`} 
                    className="w-full h-auto aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 w-full aspect-[3/4] flex items-center justify-center">
                    <span className="text-gray-500">No Photo</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-center text-xs text-gray-500">
                ID: {idNumber}
              </div>
            </div>
            
            {/* Details */}
            <div className="w-2/3 space-y-2">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-semibold">{name} {surname}</h3>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">Mobile:</span>
                  <span>{mobileNumber}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">Aadhaar:</span>
                  <span>{aadhaarNumber}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">Issued:</span>
                  <span>{new Date(issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">Expires:</span>
                  <span>{new Date(expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="pt-2 mt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 italic">
                  This ID card is the property of Radha Soami Satsang Beas
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barcode */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-500 mb-1">Scan QR for verification</div>
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded border">
              {/* Placeholder for QR code - you can replace this with an actual QR code generator */}
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-center text-gray-400">
                QR Code
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Print ID Card
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Image
        </Button>
      </div>
    </div>
  );
}
