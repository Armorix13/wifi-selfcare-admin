import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

interface NotificationHistoryProps {
  notifications: Notification[];
  onDeleteNotification?: (id: number) => void;
  onResendNotification?: (id: number) => void;
}

export function NotificationHistory({ 
  notifications, 
  onDeleteNotification, 
  onResendNotification 
}: NotificationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDeliveryRate = (notification: Notification) => {
    return notification.totalRecipients > 0 
      ? (notification.deliveredCount / notification.totalRecipients) * 100
      : 0;
  };

  const getReadRate = (notification: Notification) => {
    return notification.deliveredCount > 0 
      ? (notification.readCount / notification.deliveredCount) * 100
      : 0;
  };

  const formatRecipientType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      "all-users": "All Users",
      "all-engineers": "All Engineers", 
      "all-managers": "All Managers",
      "specific-users": "Specific Users",
      "specific-engineers": "Specific Engineers",
      "specific-managers": "Specific Managers",
      "location-based": "Location Based",
      "role-based": "Role Based"
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="border-2 border-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Notification History</span>
            <Badge variant="outline" className="ml-2">
              {filteredNotifications.length} notifications
            </Badge>
          </CardTitle>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {notifications.length > 0 
                  ? (notifications.reduce((sum, n) => sum + getReadRate(n), 0) / notifications.length).toFixed(1)
                  : 0}% avg read rate
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>
                {notifications.reduce((sum, n) => sum + n.totalRecipients, 0)} total reach
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const deliveryRate = getDeliveryRate(notification);
              const readRate = getReadRate(notification);

              return (
                <div key={notification.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={cn("text-xs", getTypeColor(notification.type))}>
                          {getTypeIcon(notification.type)}
                          <span className="ml-1">{notification.type}</span>
                        </Badge>
                        <Badge className={cn("text-xs", getPriorityColor(notification.priority))}>
                          {notification.priority}
                        </Badge>
                        <Badge className={cn("text-xs", getStatusColor(notification.status))}>
                          {notification.status}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground ml-2">
                          {notification.channels.push && <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" title="Push" />}
                          {notification.channels.email && <Mail className="h-3 w-3 mr-1" title="Email" />}
                          {notification.channels.sms && <MessageSquare className="h-3 w-3" title="SMS" />}
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="font-semibold text-foreground mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Recipients */}
                      <div className="flex items-center space-x-4 mb-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatRecipientType(notification.recipientType)}</span>
                          {notification.specificRecipients && (
                            <span className="text-muted-foreground">({notification.specificRecipients.length} selected)</span>
                          )}
                          {notification.locationFilter && (
                            <span className="text-muted-foreground">• {notification.locationFilter}</span>
                          )}
                          {notification.roleFilter && (
                            <span className="text-muted-foreground">• {notification.roleFilter}</span>
                          )}
                        </div>
                      </div>

                      {/* Metrics */}
                      {notification.status === "sent" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Delivery Rate</span>
                              <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={deliveryRate} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {notification.deliveredCount}/{notification.totalRecipients} delivered
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Read Rate</span>
                              <span className="font-medium">{readRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={readRate} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {notification.readCount}/{notification.deliveredCount} read
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Engagement</span>
                              <span className="font-medium">
                                {notification.totalRecipients > 0 
                                  ? ((notification.readCount / notification.totalRecipients) * 100).toFixed(1)
                                  : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={notification.totalRecipients > 0 
                                ? (notification.readCount / notification.totalRecipients) * 100
                                : 0} 
                              className="h-2" 
                            />
                            <div className="text-xs text-muted-foreground">
                              Overall engagement rate
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamp and Sender */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(notification.sentAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          <span>Sent by {notification.sentBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedNotification(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              {getTypeIcon(notification.type)}
                              <span>{notification.title}</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Message</Label>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Recipients</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatRecipientType(notification.recipientType)}
                                  {notification.totalRecipients && ` (${notification.totalRecipients} users)`}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Priority</Label>
                                <Badge className={cn("text-xs mt-1", getPriorityColor(notification.priority))}>
                                  {notification.priority}
                                </Badge>
                              </div>
                            </div>

                            {notification.status === "sent" && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Performance Metrics</Label>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="text-lg font-bold text-foreground">{notification.deliveredCount}</div>
                                    <div className="text-xs text-muted-foreground">Delivered</div>
                                  </div>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="text-lg font-bold text-foreground">{notification.readCount}</div>
                                    <div className="text-xs text-muted-foreground">Read</div>
                                  </div>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="text-lg font-bold text-foreground">{readRate.toFixed(1)}%</div>
                                    <div className="text-xs text-muted-foreground">Read Rate</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}