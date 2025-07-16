import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { insertNotificationSchema, type InsertNotification } from "@shared/schema";

export default function Notifications() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Dummy notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Scheduled Maintenance",
      message: "Network maintenance scheduled for tomorrow 2-4 AM. Minimal downtime expected.",
      type: "all-users",
      priority: "high",
      recipientType: "all-users",
      recipients: null,
      sentBy: 1,
      deliveredCount: 156,
      readCount: 89,
      sentAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      title: "New Service Plan Available",
      message: "We're excited to announce our new Ultra High-Speed 1 Gbps plan now available in your area!",
      type: "customers",
      priority: "normal",
      recipientType: "customers",
      recipients: null,
      sentBy: 1,
      deliveredCount: 234,
      readCount: 145,
      sentAt: "2024-01-14T15:30:00Z"
    },
    {
      id: 3,
      title: "Engineer Assignment Updates",
      message: "New protocol for complaint assignments has been implemented. Please review the updated guidelines.",
      type: "engineers",
      priority: "urgent",
      recipientType: "engineers",
      recipients: null,
      sentBy: 1,
      deliveredCount: 12,
      readCount: 8,
      sentAt: "2024-01-13T09:15:00Z"
    }
  ]);

  const isLoading = false;

  const form = useForm<InsertNotification>({
    resolver: zodResolver(insertNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "all-users",
      priority: "normal",
      recipientType: "all-users",
      recipients: null,
      sentBy: user?.id || 1,
      deliveredCount: 0,
      readCount: 0,
    },
  });

  const onSubmit = (data: InsertNotification) => {
    const newNotification = {
      id: Math.max(...notifications.map(n => n.id)) + 1,
      ...data,
      sentBy: user?.id || 1,
      deliveredCount: 0,
      readCount: 0,
      sentAt: new Date().toISOString()
    };
    setNotifications([newNotification, ...notifications]);
    toast({
      title: "Success",
      description: "Notification sent successfully",
    });
    form.reset();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "all-users":
        return "bg-blue-100 text-blue-800";
      case "all-engineers":
        return "bg-purple-100 text-purple-800";
      case "specific-user":
        return "bg-green-100 text-green-800";
      case "location-based":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRecipientType = (type: string) => {
    switch (type) {
      case "all-users":
        return "All Users";
      case "all-engineers":
        return "Engineers";
      case "specific-user":
        return "Specific User";
      case "location-based":
        return "Location Based";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Notifications">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notifications">
      <div className="space-y-6">
        {/* Send Notification Form */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientType">Recipient Type</Label>
                  <Select
                    value={form.watch("recipientType")}
                    onValueChange={(value) => form.setValue("recipientType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-users">All Users</SelectItem>
                      <SelectItem value="all-engineers">All Engineers</SelectItem>
                      <SelectItem value="specific-user">Specific User</SelectItem>
                      <SelectItem value="location-based">Users in Location</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.recipientType && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.recipientType.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={form.watch("priority")}
                    onValueChange={(value) => form.setValue("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.priority && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.priority.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Subject</Label>
                <Input
                  id="title"
                  placeholder="Enter notification subject"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Enter notification message"
                  {...form.register("message")}
                />
                {form.formState.errors.message && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.message.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Send Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Notification History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No notifications sent yet
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <div key={notification.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getTypeColor(notification.recipientType)} rounded-full px-2 py-1 text-xs font-medium`}>
                            {formatRecipientType(notification.recipientType)}
                          </Badge>
                          <Badge className={`${getPriorityColor(notification.priority)} rounded-full px-2 py-1 text-xs font-medium`}>
                            {notification.priority}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium">
                            Sent
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Delivered: {notification.deliveredCount}</span>
                          <span>Read: {notification.readCount}</span>
                          <span>{new Date(notification.sentAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
