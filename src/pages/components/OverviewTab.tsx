import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Lock
} from "lucide-react";
import { Customer } from "@/lib/dummyData";

interface OverviewTabProps {
  user: Customer;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showModemPassword: boolean;
  setShowModemPassword: (show: boolean) => void;
}

const OverviewTab = memo(({ user, showPassword, setShowPassword, showModemPassword, setShowModemPassword }: OverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="font-medium">{user.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="font-medium">{user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="font-medium">{user.userName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
              <p className="font-medium">{user.fatherName}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {user.phone}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mobile</label>
              <p className="font-medium">{user.mobile}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Country</label>
            <p className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {user.country}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Address</label>
            <p className="font-medium">{user.address}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
            <p className="font-medium">{user.permanentAddress}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Billing Address</label>
            <p className="font-medium">{user.billingAddress}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Location</label>
            <p className="font-medium">{user.location}</p>
          </div>
          {user.lat && user.long && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
              <p className="font-medium">{user.lat}, {user.long}</p>
            </div>
          )}
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
                  user.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  user.status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                } border-0`}>
                  {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                   user.status === 'pending' ? <AlertTriangle className="w-3 h-3 mr-1" /> :
                   user.status === 'suspended' ? <ShieldOff className="w-3 h-3 mr-1" /> :
                   <CheckCircle className="w-3 h-3 mr-1" />}
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="font-medium capitalize">{user.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Activated</label>
              <Badge variant={user.isActivated ? "default" : "secondary"}>
                {user.isActivated ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                {user.isActivated ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Suspended</label>
              <Badge variant={user.isSuspended ? "destructive" : "default"}>
                {user.isSuspended ? <ShieldOff className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                {user.isSuspended ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Login</label>
            <p className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">User Password</label>
            <div className="flex items-center gap-2">
              <p className="font-medium font-mono">
                {showPassword ? user.password : "••••••••"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {user.modemUserName && user.modemPassword && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modem Username</label>
                <p className="font-medium font-mono">{user.modemUserName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modem Password</label>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono">
                    {showModemPassword ? user.modemPassword : "••••••••"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModemPassword(!showModemPassword)}
                  >
                    {showModemPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

OverviewTab.displayName = "OverviewTab";

export default OverviewTab;
