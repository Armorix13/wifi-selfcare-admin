import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { NotificationComposer } from "@/components/notifications/notification-composer";
import { NotificationHistory } from "@/components/notifications/notification-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Bell, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Send
} from "lucide-react";

// Enhanced notification interface
interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high" | "urgent";
  recipientType: string;
  specificRecipients?: string[];
  locationFilter?: string;
  roleFilter?: string;
  deliveredCount: number;
  readCount: number;
  totalRecipients: number;
  sentAt: string;
  sentBy: string;
  status: "sent" | "scheduled" | "failed" | "draft";
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export default function Notifications() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Enhanced dummy notifications data with comprehensive metrics
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "System Maintenance Scheduled",
      message: "Network maintenance is scheduled for tomorrow from 2:00 AM to 4:00 AM. We expect minimal downtime and will work to complete upgrades as quickly as possible. All services will be restored by 4:00 AM.",
      type: "info",
      priority: "high",
      recipientType: "all-users",
      deliveredCount: 1456,
      readCount: 1127,
      totalRecipients: 1500,
      sentAt: "2025-01-20T10:00:00Z",
      sentBy: "Admin Team",
      status: "sent",
      channels: {
        push: true,
        email: true,
        sms: false
      }
    },
    {
      id: 2,
      title: "New Ultra High-Speed Plan Available",
      message: "We're excited to announce our new Ultra High-Speed 1 Gbps plan is now available in your area! Upgrade today and enjoy lightning-fast internet with no data caps. Contact customer service for special pricing.",
      type: "success",
      priority: "medium",
      recipientType: "specific-users",
      specificRecipients: ["user1", "user2", "user3"],
      deliveredCount: 834,
      readCount: 645,
      totalRecipients: 850,
      sentAt: "2025-01-19T15:30:00Z",
      sentBy: "Marketing Team",
      status: "sent",
      channels: {
        push: true,
        email: true,
        sms: true
      }
    },
    {
      id: 3,
      title: "Critical: Engineer Assignment Protocol Update",
      message: "Important: New protocol for complaint assignments has been implemented effective immediately. All engineers must review the updated guidelines in the engineering portal and complete the mandatory training module by end of week.",
      type: "warning",
      priority: "urgent",
      recipientType: "all-engineers",
      deliveredCount: 24,
      readCount: 18,
      totalRecipients: 25,
      sentAt: "2025-01-18T09:15:00Z",
      sentBy: "Engineering Manager",
      status: "sent",
      channels: {
        push: true,
        email: true,
        sms: true
      }
    },
    {
      id: 4,
      title: "Q1 Performance Review Meeting",
      message: "Quarterly performance review meetings are scheduled for next week. Please check your calendar for individual meeting times and prepare your quarterly reports. All reports must be submitted 24 hours before your scheduled meeting.",
      type: "info",
      priority: "medium",
      recipientType: "all-managers",
      deliveredCount: 8,
      readCount: 8,
      totalRecipients: 8,
      sentAt: "2025-01-17T14:20:00Z",
      sentBy: "HR Department",
      status: "sent",
      channels: {
        push: true,
        email: true,
        sms: false
      }
    },
    {
      id: 5,
      title: "Service Outage Resolved",
      message: "The service outage affecting the North District has been fully resolved. All services are now operating normally. We apologize for any inconvenience caused during the maintenance period.",
      type: "success",
      priority: "high",
      recipientType: "location-based",
      locationFilter: "North District",
      deliveredCount: 342,
      readCount: 298,
      totalRecipients: 350,
      sentAt: "2025-01-16T08:45:00Z",
      sentBy: "Network Operations",
      status: "sent",
      channels: {
        push: true,
        email: false,
        sms: true
      }
    }
  ]);

  const isLoading = false;

  const handleSendNotification = (notificationData: any) => {
    // Simulate sending notification with realistic metrics
    const estimatedRecipients = getEstimatedRecipients(notificationData.recipientType, notificationData.specificRecipients);
    const deliveryRate = 0.85 + Math.random() * 0.12; // 85-97% delivery rate
    const readRate = 0.65 + Math.random() * 0.25; // 65-90% read rate of delivered
    
    const delivered = Math.floor(estimatedRecipients * deliveryRate);
    const read = Math.floor(delivered * readRate);

    const newNotification: Notification = {
      id: Math.max(...notifications.map(n => n.id)) + 1,
      ...notificationData,
      deliveredCount: delivered,
      readCount: read,
      totalRecipients: estimatedRecipients,
      sentAt: new Date().toISOString(),
      sentBy: user?.email || "Admin",
      status: notificationData.scheduleType === "immediate" ? "sent" : "scheduled",
      channels: {
        push: notificationData.enablePushNotification,
        email: notificationData.enableEmailNotification,
        sms: notificationData.enableSMSNotification
      }
    };

    setNotifications([newNotification, ...notifications]);
  };

  const getEstimatedRecipients = (recipientType: string, specificRecipients?: string[]) => {
    switch (recipientType) {
      case "all-users":
        return 1500;
      case "all-engineers":
        return 25;
      case "all-managers":
        return 8;
      case "specific-users":
      case "specific-engineers":
      case "specific-managers":
        return specificRecipients?.length || 0;
      case "location-based":
        return 300;
      case "role-based":
        return 150;
      default:
        return 0;
    }
  };

  // Calculate overall statistics
  const totalNotifications = notifications.length;
  const totalRecipients = notifications.reduce((sum, n) => sum + n.totalRecipients, 0);
  const totalDelivered = notifications.reduce((sum, n) => sum + n.deliveredCount, 0);
  const totalRead = notifications.reduce((sum, n) => sum + n.readCount, 0);
  const avgDeliveryRate = totalRecipients > 0 ? (totalDelivered / totalRecipients) * 100 : 0;
  const avgReadRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

  if (isLoading) {
    return (
      <MainLayout title="Notification Center">
        <div className="animate-pulse space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl shadow-sm p-6 border">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notification Center">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notification Center</h1>
            <p className="text-muted-foreground mt-1">Manage and send notifications to users, engineers, and managers</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Bell className="h-4 w-4 mr-2" />
            {totalNotifications} total notifications
          </Badge>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Total Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalNotifications}</div>
              <p className="text-xs text-blue-600 mt-1">Notifications sent</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-green-700">
                <Users className="h-4 w-4 mr-2" />
                Total Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{totalRecipients.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">Recipients reached</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-orange-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Delivery Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{avgDeliveryRate.toFixed(1)}%</div>
              <p className="text-xs text-orange-600 mt-1">{totalDelivered.toLocaleString()} delivered</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm font-medium text-purple-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Read Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{avgReadRate.toFixed(1)}%</div>
              <p className="text-xs text-purple-600 mt-1">{totalRead.toLocaleString()} read</p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Composer */}
        <NotificationComposer onSend={handleSendNotification} />

        {/* Notification History */}
        <NotificationHistory 
          notifications={notifications}
          onDeleteNotification={(id) => {
            setNotifications(notifications.filter(n => n.id !== id));
            toast({
              title: "Notification deleted",
              description: "The notification has been removed from history",
            });
          }}
          onResendNotification={(id) => {
            const notification = notifications.find(n => n.id === id);
            if (notification) {
              toast({
                title: "Notification resent",
                description: `"${notification.title}" has been resent to recipients`,
              });
            }
          }}
        />
      </div>
    </MainLayout>
  );
}
