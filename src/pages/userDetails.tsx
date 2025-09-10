import { useState, useEffect, useMemo, memo, Suspense, lazy } from "react";
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
    PowerOff,
    Loader2
} from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useGetCompleteUserDetailbyIdQuery } from "@/api";
import { 
    ClientData, 
    ModemDetail, 
    CustomerDetail, 
    ComplaintData, 
    OrderData, 
    BillRequest, 
    InstallationRequests, 
    UserStatistics,
    UserDetailsResponse 
} from "@/lib/types/users";

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./components/OverviewTab'));
const ServiceTab = lazy(() => import('./components/ServiceTab'));
const ComplaintsTab = lazy(() => import('./components/ComplaintsTab'));
const OrdersTab = lazy(() => import('./components/OrdersTab'));
const LeadsTab = lazy(() => import('./components/LeadsTab'));
const BillingTab = lazy(() => import('./components/BillingTab'));

// Memoized components for better performance
const StatusBadge = memo(({ status }: { status: string }) => {
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
});

const LoadingSpinner = memo(() => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
    </div>
));

export default function UserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [showPassword, setShowPassword] = useState(false);
    const [showModemPassword, setShowModemPassword] = useState(false);
    
    const { data: userDetailData, isLoading: isLoadingUserDetail, error } = useGetCompleteUserDetailbyIdQuery(id!);

    // Extract data from API response
    const userData = useMemo(() => {
        if (!userDetailData?.data) return null;
        
        const { client, modemDetail, customerDetail, complaints, orders, leads, billRequests, installationRequests, statistics } = userDetailData.data;
        
        return {
            client,
            modemDetail,
            customerDetail,
            complaints,
            orders,
            leads,
            billRequests,
            installationRequests,
            statistics
        };
    }, [userDetailData]);

    if (isLoadingUserDetail) {
        return (
            <MainLayout title="User Details">
                <LoadingSpinner />
            </MainLayout>
        );
    }

    if (error || !userData) {
        return (
            <MainLayout title="User Details">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-2">User Not Found</h2>
                        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist or there was an error loading the data.</p>
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
        return <StatusBadge status={status} />;
    };

    const { client, modemDetail, customerDetail, complaints, orders, leads, billRequests, installationRequests, statistics } = userData;

    return (
        <MainLayout title={`User Details - ${client.fullName}`}>
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
                            {client.profileImage ? (
                                <img
                                    src={client.profileImage}
                                    alt={client.fullName}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">{client.fullName}</h1>
                                <p className="text-muted-foreground">{client.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(client.isActive ? "active" : "inactive")}
                        <Badge variant={client.workingStatus === "active" ? "default" : "secondary"}>
                            {client.workingStatus === "active" ? <Power className="w-3 h-3 mr-1" /> : <PowerOff className="w-3 h-3 mr-1" />}
                            {client.workingStatus}
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

                    {/* Lazy-loaded Tab Content */}
                    <Suspense fallback={<LoadingSpinner />}>
                        <ErrorBoundary>
                            <TabsContent value="overview" className="space-y-6">
                                <OverviewTab 
                                    client={client} 
                                    modemDetail={modemDetail}
                                    customerDetail={customerDetail}
                                    installationRequests={installationRequests}
                                    showPassword={showPassword} 
                                    setShowPassword={setShowPassword} 
                                    showModemPassword={showModemPassword} 
                                    setShowModemPassword={setShowModemPassword} 
                                />
                            </TabsContent>

                            <TabsContent value="service" className="space-y-6">
                                <ServiceTab 
                                    client={client}
                                    modemDetail={modemDetail}
                                    customerDetail={customerDetail}
                                />
                            </TabsContent>

                            <TabsContent value="complaints" className="space-y-6">
                                <ComplaintsTab complaints={complaints} />
                            </TabsContent>

                            <TabsContent value="orders" className="space-y-6">
                                <OrdersTab orders={orders} />
                            </TabsContent>

                            <TabsContent value="leads" className="space-y-6">
                                <LeadsTab leads={leads} />
                            </TabsContent>

                            <TabsContent value="billing" className="space-y-6">
                                <BillingTab 
                                    client={client}
                                    customerDetail={customerDetail}
                                    billRequests={billRequests}
                                    statistics={statistics}
                                />
                            </TabsContent>
                        </ErrorBoundary>
                    </Suspense>
                </Tabs>
            </div>
        </MainLayout>
    );
}
