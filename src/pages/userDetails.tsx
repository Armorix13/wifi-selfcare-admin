import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Wifi, 
  Activity, 
  CreditCard, 
  Router, 
  Shield, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  ShieldOff,
  WifiOff,
  Globe,
  Building,
  Users,
  FileText,
  Package,
  MessageSquare,
  Receipt,
  Clock,
  Settings,
  Lock,
  Unlock,
  Power,
  PowerOff
} from "lucide-react";
import { generateDummyCustomers, generateDummyComplaints, generateDummyOrders, generateDummyLeads, type Customer, type Complaint, type Order, type Lead } from "@/lib/dummyData";

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [showModemPassword, setShowModemPassword] = useState(false);

  // Load dummy data
  const customers = generateDummyCustomers();
  const complaints = generateDummyComplaints();
  const orders = generateDummyOrders();
  const leads = generateDummyLeads();

  useEffect(() => {
    if (id) {
      const foundUser = customers.find(customer => customer.id === parseInt(id));
      setUser(foundUser || null);
    }
  }, [id, customers]);

  if (!user) {
    return (
      <MainLayout title="User Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/users')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
      suspended: { color: "bg-red-100 text-red-800 border-red-200", icon: ShieldOff },
      expired: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: WifiOff },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || CheckCircle;
    
    return (
      <Badge className={`${config?.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter data for this user
  const userComplaints = complaints.filter(complaint => complaint.customerId === user.id);
  const userOrders = orders.filter(order => order.customerId === user.id);
  const userLeads = leads.filter(lead => lead.name === user.name);

  return (
    <MainLayout title={`User Details - ${user.name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/users");
              }
            }}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
            <div className="flex items-center gap-3">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(user.status)}
            <Badge variant={user.mode === "online" ? "default" : "secondary"}>
              {user.mode === "online" ? <Power className="w-3 h-3 mr-1" /> : <PowerOff className="w-3 h-3 mr-1" />}
              {user.mode}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6 gap-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Complaints</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                      <div className="mt-1">{getStatusBadge(user.status)}</div>
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
          </TabsContent>

          {/* Service Tab */}
          <TabsContent value="service" className="space-y-6">
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
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  User Complaints ({userComplaints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userComplaints.length > 0 ? (
                  <DataTable
                    data={userComplaints}
                    columns={[
                      { key: "title", label: "Title" },
                      { key: "priority", label: "Priority" },
                      { 
                        key: "status", 
                        label: "Status",
                        render: (value) => (
                          <Badge variant={value === "resolved" ? "default" : "secondary"}>
                            {value}
                          </Badge>
                        )
                      },
                      { 
                        key: "createdAt", 
                        label: "Created",
                        render: (value) => new Date(value).toLocaleDateString()
                      },
                      { key: "engineerName", label: "Assigned Engineer" }
                    ]}
                  />
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No complaints found for this user.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  User Orders ({userOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length > 0 ? (
                  <DataTable
                    data={userOrders}
                    columns={[
                      { key: "orderNumber", label: "Order #" },
                      { key: "productName", label: "Product" },
                      { key: "quantity", label: "Qty" },
                      { 
                        key: "totalAmount", 
                        label: "Amount",
                        render: (value) => `₹${value.toLocaleString()}`
                      },
                      { 
                        key: "status", 
                        label: "Status",
                        render: (value) => (
                          <Badge variant={value === "delivered" ? "default" : "secondary"}>
                            {value}
                          </Badge>
                        )
                      },
                      { 
                        key: "createdAt", 
                        label: "Ordered",
                        render: (value) => new Date(value).toLocaleDateString()
                      }
                    ]}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders found for this user.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Related Leads ({userLeads.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userLeads.length > 0 ? (
                  <DataTable
                    data={userLeads}
                    columns={[
                      { key: "name", label: "Name" },
                      { key: "email", label: "Email" },
                      { key: "phone", label: "Phone" },
                      { key: "source", label: "Source" },
                      { key: "inquiryType", label: "Inquiry Type" },
                      { 
                        key: "status", 
                        label: "Status",
                        render: (value) => (
                          <Badge variant={value === "converted" ? "default" : "secondary"}>
                            {value}
                          </Badge>
                        )
                      },
                      { 
                        key: "createdAt", 
                        label: "Created",
                        render: (value) => new Date(value).toLocaleDateString()
                      }
                    ]}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No leads found for this user.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">₹{user.balanceDue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Balance Due</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {user.lastBillingDate ? new Date(user.lastBillingDate).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Last Billing Date</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {user.expirationDate ? new Date(user.expirationDate).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Next Due Date</div>
                  </div>
                </div>
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Detailed billing history will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
