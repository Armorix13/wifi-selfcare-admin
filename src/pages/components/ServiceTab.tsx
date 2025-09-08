import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wifi, 
  Router, 
  Calendar, 
  Building
} from "lucide-react";
import { Customer } from "@/lib/dummyData";

interface ServiceTabProps {
  user: Customer;
}

const ServiceTab = memo(({ user }: ServiceTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Service Provider</label>
            <p className="font-medium">{user.serviceProvider || "Not assigned"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
            <p className="font-medium">{user.planName || "Not assigned"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">BB Plan</label>
              <p className="font-medium">{user.bbPlan || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">FTTH Plan</label>
              <p className="font-medium">{user.ftthExchangePlan || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="font-medium">{user.category || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Working Status</label>
              <p className="font-medium">{user.workingStatus || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="w-5 h-5" />
            Network Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Static IP</label>
              <p className="font-medium font-mono">{user.staticIp || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MAC IP</label>
              <p className="font-medium font-mono">{user.macIp || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">MAC Address</label>
              <p className="font-medium font-mono">{user.macAddress || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">OLT IP</label>
              <p className="font-medium font-mono">{user.oltIp || "N/A"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">BB User ID</label>
            <p className="font-medium">{user.bbUserId || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">MTCE Franchise</label>
            <p className="font-medium">{user.mtceFranchise || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Service Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Service Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Installation Date</label>
            <p className="font-medium">{user.installationDate ? new Date(user.installationDate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Activation Date</label>
            <p className="font-medium">{user.activationDate ? new Date(user.activationDate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
            <p className="font-medium">{user.expirationDate ? new Date(user.expirationDate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Billing Date</label>
            <p className="font-medium">{user.lastBillingDate ? new Date(user.lastBillingDate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">LL Install Date</label>
            <p className="font-medium">{user.llInstallDate ? new Date(user.llInstallDate).toLocaleDateString() : "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Assigned Company</label>
            <p className="font-medium">{user.assignedCompany || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Area Type</label>
            <p className="font-medium capitalize">{user.ruralUrban || user.area}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Acquisition Type</label>
            <p className="font-medium">{user.acquisitionType || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ServiceTab.displayName = "ServiceTab";

export default ServiceTab;
