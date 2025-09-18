import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  Router, 
  Calendar, 
  Building,
  MapPin,
  Activity,
  Power,
  Globe
} from "lucide-react";
import { ClientData, ModemDetail, CustomerDetail } from "@/lib/types/users";

interface ServiceTabProps {
  client: ClientData;
  modemDetail: ModemDetail;
  customerDetail: CustomerDetail;
}

const ServiceTab = memo(({ client, modemDetail, customerDetail }: ServiceTabProps) => {
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">BB Plan</label>
              <p className="font-medium">{client.bbPlan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">FTTH Plan</label>
              <p className="font-medium">{client.ftthExchangePlan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">BB User ID</label>
              <p className="font-medium">{client.bbUserId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Working Status</label>
              <Badge variant={client.workingStatus === "active" ? "default" : "secondary"}>
                {client.workingStatus === "active" ? <Power className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                {client.workingStatus}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Area Type</label>
              <p className="font-medium capitalize">{client.ruralUrban}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Acquisition Type</label>
              <p className="font-medium">{client.acquisitionType}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">MTCE Franchise</label>
            <p className="font-medium">{client.mtceFranchise}</p>
          </div>
        </CardContent>
      </Card>

      {/* Modem Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="w-5 h-5" />
            Modem Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Modem Name</label>
            <p className="font-medium">{modemDetail.modemName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Model Number</label>
              <p className="font-medium">{modemDetail.modelNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
              <p className="font-medium font-mono">{modemDetail.serialNumber}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">ONT MAC Address</label>
            <p className="font-medium font-mono">{modemDetail.ontMac}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">ONT Type</label>
            <p className="font-medium">{modemDetail.ontType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Modem Status</label>
            <Badge variant={modemDetail.isActive ? "default" : "secondary"}>
              {modemDetail.isActive ? <Power className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
              {modemDetail.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Network Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Network Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">OLT Name</label>
            <p className="font-medium">{customerDetail.oltId.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">OLT IP</label>
              <p className="font-medium font-mono">{customerDetail.oltId.oltIp}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">OLT MAC</label>
              <p className="font-medium font-mono">{customerDetail.oltId.macAddress}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">FDB Name</label>
            <p className="font-medium">{customerDetail.fdbId.fdbName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">FDB Type</label>
              <p className="font-medium">{customerDetail.fdbId.fdbType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">FDB Power</label>
              <p className="font-medium">{customerDetail.fdbId.fdbPower} Port</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">OLT Status</label>
              <Badge variant={customerDetail.oltId.status === "active" ? "default" : "secondary"}>
                {customerDetail.oltId.status === "active" ? <Power className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                {customerDetail.oltId.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">FDB Status</label>
              <Badge variant={customerDetail.fdbId.status === "active" ? "default" : "secondary"}>
                {customerDetail.fdbId.status === "active" ? <Power className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                {customerDetail.fdbId.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Timeline */}
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
            <p className="font-medium">{new Date(customerDetail.installationDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
            <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="font-medium">{new Date(client.updatedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Installation Status</label>
            <Badge variant={customerDetail.isInstalled ? "default" : "secondary"}>
              {customerDetail.isInstalled ? <Power className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
              {customerDetail.isInstalled ? "Installed" : "Pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">OLT Location</label>
            <p className="font-medium">
              {customerDetail.oltId.latitude}, {customerDetail.oltId.longitude}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">FDB Location</label>
            <p className="font-medium">
              {customerDetail.fdbId.latitude}, {customerDetail.fdbId.longitude}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">OLT Type</label>
            <p className="font-medium uppercase">{customerDetail.oltId.oltType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">OLT Power</label>
            <p className="font-medium">{customerDetail.oltId.oltPower} Port</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ServiceTab.displayName = "ServiceTab";

export default ServiceTab;
