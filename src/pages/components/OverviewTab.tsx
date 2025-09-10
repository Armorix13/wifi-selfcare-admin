import { memo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  ShieldOff,
  Globe,
  Clock,
  Lock,
  Building,
  Router,
  Wifi,
  Image as ImageIcon,
  Download
} from "lucide-react";
import { ClientData, ModemDetail, CustomerDetail, InstallationRequests } from "@/lib/types/users";
import { BASE_URL } from "@/api";

interface OverviewTabProps {
  client: ClientData;
  modemDetail: ModemDetail | null;
  customerDetail: CustomerDetail | null;
  installationRequests: InstallationRequests;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showModemPassword: boolean;
  setShowModemPassword: (show: boolean) => void;
}

const OverviewTab = ({ client, modemDetail, customerDetail, installationRequests, showPassword, setShowPassword, showModemPassword, setShowModemPassword }: OverviewTabProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>("");
  const [forceRender, setForceRender] = useState(0);

  // Force re-render when key props change
  console.log('OverviewTab rendering for client:', client._id, 'forceRender:', forceRender);

  // Force re-render when component mounts or key props change
  useEffect(() => {
    console.log('OverviewTab mounted/updated for client:', client._id);
    // Force a re-render by updating state
    setForceRender(prev => prev + 1);
  }, [client._id, modemDetail, customerDetail]);

  // Additional effect to ensure content is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('OverviewTab content should be visible now');
    }, 100);
    return () => clearTimeout(timer);
  }, [forceRender]);

  const handleDownload = (url: string, filename: string) => {
    const fullUrl = `${BASE_URL}${url}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImageModal = (url: string, title: string) => {
    setSelectedImage(`${BASE_URL}${url}`);
    setImageTitle(title);
  };

  // Get the first wifi installation request for document images
  const wifiRequest = installationRequests?.wifi?.[0];
  
  // Ensure content is visible
  if (!client || !client._id) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" key={`overview-content-${client._id}-${forceRender}`}>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="font-medium">{client?.firstName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="font-medium">{client?.lastName || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="font-medium">{client?.fullName || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="font-medium font-mono">{client?._id || 'N/A'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {client?.email || 'N/A'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {client?.countryCode || '+91'} {client?.phoneNumber || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">BB User ID</label>
              <p className="font-medium">{client?.bbUserId || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">BB Plan</label>
              <p className="font-medium">{client.bbPlan || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">FTTH Plan</label>
              <p className="font-medium">{client.ftthExchangePlan || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MTCE Franchise</label>
              <p className="font-medium">{client.mtceFranchise || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Area Type</label>
              <p className="font-medium capitalize">{client.ruralUrban || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Working Status</label>
              <p className="font-medium">{client.workingStatus || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Acquisition Type</label>
              <p className="font-medium">{client.acquisitionType || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={`${
                  client.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                } border-0`}>
                  {client.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <ShieldOff className="w-3 h-3 mr-1" />}
                  {client.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Working Status</label>
              <Badge variant={client.workingStatus === "active" ? "default" : "secondary"}>
                {client.workingStatus === "active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                {client.workingStatus}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(client.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modem Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="w-5 h-5" />
            Modem Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modemDetail ? (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modem Name</label>
                <p className="font-medium">{modemDetail.modemName || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model Number</label>
                  <p className="font-medium">{modemDetail.modelNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="font-medium font-mono">{modemDetail.serialNumber || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ONT MAC</label>
                <p className="font-medium font-mono">{modemDetail.ontMac || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ONT Type</label>
                <p className="font-medium">{modemDetail.ontType || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="font-medium font-mono">{modemDetail.username || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono">
                    {modemDetail.password ? (showModemPassword ? modemDetail.password : "••••••••") : 'N/A'}
                  </p>
                  {modemDetail.password && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowModemPassword(!showModemPassword)}
                    >
                      {showModemPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Router className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No modem information available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installation Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Installation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customerDetail ? (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Installation Date</label>
                <p className="font-medium">
                  {customerDetail.installationDate ? new Date(customerDetail.installationDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Balance Due</label>
                <p className="font-medium text-red-600">
                  ₹{customerDetail.balanceDue ? customerDetail.balanceDue.toLocaleString() : '0'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Installation Status</label>
                <Badge variant={customerDetail.isInstalled ? "default" : "secondary"}>
                  {customerDetail.isInstalled ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                  {customerDetail.isInstalled ? "Installed" : "Pending"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">FDB ID</label>
                <p className="font-medium">
                  {customerDetail.fdbId?.fdbName || (typeof customerDetail.fdbId === 'string' ? customerDetail.fdbId : 'N/A')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">OLT ID</label>
                <p className="font-medium">
                  {customerDetail.oltId?.name || (typeof customerDetail.oltId === 'string' ? customerDetail.oltId : 'N/A')}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No installation information available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Images */}
      {wifiRequest && (wifiRequest.aadhaarFrontUrl || wifiRequest.aadhaarBackUrl || wifiRequest.passportPhotoUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Document Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wifiRequest.aadhaarFrontUrl && (
                <div className="text-center">
                  <div className="mb-2">
                    <img
                      src={`${BASE_URL}${wifiRequest.aadhaarFrontUrl}`}
                      alt="Aadhaar Front"
                      className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(wifiRequest.aadhaarFrontUrl!, "Aadhaar Front")}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMzBWMTUwSDcwVjEwMEg1MEwxMDAgNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium">Aadhaar Front</p>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageModal(wifiRequest.aadhaarFrontUrl!, "Aadhaar Front")}
                      className="h-7 px-2"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(wifiRequest.aadhaarFrontUrl!, "aadhaar_front.jpg")}
                      className="h-7 px-2"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {wifiRequest.aadhaarBackUrl && (
                <div className="text-center">
                  <div className="mb-2">
                    <img
                      src={`${BASE_URL}${wifiRequest.aadhaarBackUrl}`}
                      alt="Aadhaar Back"
                      className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(wifiRequest.aadhaarBackUrl!, "Aadhaar Back")}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMzBWMTUwSDcwVjEwMEg1MEwxMDAgNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium">Aadhaar Back</p>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageModal(wifiRequest.aadhaarBackUrl!, "Aadhaar Back")}
                      className="h-7 px-2"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(wifiRequest.aadhaarBackUrl!, "aadhaar_back.jpg")}
                      className="h-7 px-2"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {wifiRequest.passportPhotoUrl && (
                <div className="text-center">
                  <div className="mb-2">
                    <img
                      src={`${BASE_URL}${wifiRequest.passportPhotoUrl}`}
                      alt="Passport Photo"
                      className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(wifiRequest.passportPhotoUrl!, "Passport Photo")}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMzBWMTUwSDcwVjEwMEg1MEwxMDAgNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium">Passport Photo</p>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageModal(wifiRequest.passportPhotoUrl!, "Passport Photo")}
                      className="h-7 px-2"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(wifiRequest.passportPhotoUrl!, "passport_photo.jpg")}
                      className="h-7 px-2"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {imageTitle}
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt={imageTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMzBWMTUwSDcwVjEwMEg1MEwxMDAgNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OverviewTab;
