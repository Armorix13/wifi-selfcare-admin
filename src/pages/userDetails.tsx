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
import { generateDummyCustomers, generateDummyComplaints, generateDummyOrders, generateDummyLeads, type Customer, type Complaint, type Order, type Lead } from "@/lib/dummyData";
import ErrorBoundary from "@/components/ErrorBoundary";

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
    const [user, setUser] = useState<Customer | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showPassword, setShowPassword] = useState(false);
    const [showModemPassword, setShowModemPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Memoize dummy data generation to prevent unnecessary re-renders
    const dummyData = useMemo(() => ({
        customers: generateDummyCustomers(),
        complaints: generateDummyComplaints(),
        orders: generateDummyOrders(),
        leads: generateDummyLeads(),
    }), []);

    // Memoize filtered data for this user
    const userData = useMemo(() => {
        if (!user) return { complaints: [], orders: [], leads: [] };

        return {
            complaints: dummyData.complaints.filter(complaint => complaint.customerId === user.id),
            orders: dummyData.orders.filter(order => order.customerId === user.id),
            leads: dummyData.leads.filter(lead => lead.name === user.name),
        };
    }, [user, dummyData]);

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));

            if (id) {
                const foundUser = dummyData.customers.find(customer =>
                    customer.id === parseInt(id) || customer._id === id
                );
                setUser(foundUser || null);
            }
            setIsLoading(false);
        };

        loadUser();
    }, [id, dummyData.customers]);

    if (isLoading) {
        return (
            <MainLayout title="User Details">
                <LoadingSpinner />
            </MainLayout>
        );
    }

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
        return <StatusBadge status={status} />;
    };

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

                    {/* Lazy-loaded Tab Content */}
                    <Suspense fallback={<LoadingSpinner />}>
                        <ErrorBoundary>
                            <TabsContent value="overview" className="space-y-6">
                                <OverviewTab user={user} showPassword={showPassword} setShowPassword={setShowPassword} showModemPassword={showModemPassword} setShowModemPassword={setShowModemPassword} />
                            </TabsContent>

                            <TabsContent value="service" className="space-y-6">
                                <ServiceTab user={user} />
                            </TabsContent>

                            <TabsContent value="complaints" className="space-y-6">
                                <ComplaintsTab complaints={userData.complaints} />
                            </TabsContent>

                            <TabsContent value="orders" className="space-y-6">
                                <OrdersTab orders={userData.orders} />
                            </TabsContent>

                            <TabsContent value="leads" className="space-y-6">
                                <LeadsTab leads={userData.leads} />
                            </TabsContent>

                            <TabsContent value="billing" className="space-y-6">
                                <BillingTab user={user} />
                            </TabsContent>
                        </ErrorBoundary>
                    </Suspense>
                </Tabs>
            </div>
        </MainLayout>
    );
}
