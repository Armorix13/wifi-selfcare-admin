import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Clock, 
  Users, 
  UserCheck, 
  Settings, 
  CalendarDays,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  message: z.string().min(1, "Message is required").max(500, "Message must be less than 500 characters"),
  type: z.enum(["info", "warning", "error", "success"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  recipientType: z.enum(["all-users", "all-engineers", "all-managers", "specific-users", "specific-engineers", "specific-managers", "location-based", "role-based"]),
  specificRecipients: z.array(z.string()).optional(),
  locationFilter: z.string().optional(),
  roleFilter: z.string().optional(),
  scheduleType: z.enum(["immediate", "scheduled"]),
  scheduledDate: z.date().optional(),
  enablePushNotification: z.boolean().default(true),
  enableEmailNotification: z.boolean().default(false),
  enableSMSNotification: z.boolean().default(false),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

interface NotificationComposerProps {
  onSend: (notification: NotificationFormData) => void;
}

// Dummy data for users, engineers, and managers
const users: Option[] = [
  { value: "user1", label: "John Smith", avatar: "JS", role: "Premium Customer", department: "North District" },
  { value: "user2", label: "Sarah Johnson", avatar: "SJ", role: "Basic Customer", department: "South District" },
  { value: "user3", label: "Mike Davis", avatar: "MD", role: "Business Customer", department: "East District" },
  { value: "user4", label: "Emily Brown", avatar: "EB", role: "Premium Customer", department: "West District" },
  { value: "user5", label: "David Wilson", avatar: "DW", role: "Basic Customer", department: "Central District" },
];

const engineers: Option[] = [
  { value: "eng1", label: "Alex Rodriguez", avatar: "AR", role: "Senior Engineer", department: "Network Team" },
  { value: "eng2", label: "Lisa Chen", avatar: "LC", role: "Field Engineer", department: "Installation Team" },
  { value: "eng3", label: "James Park", avatar: "JP", role: "Technical Lead", department: "Support Team" },
  { value: "eng4", label: "Maria Garcia", avatar: "MG", role: "Network Engineer", department: "Infrastructure Team" },
  { value: "eng5", label: "Kevin Lee", avatar: "KL", role: "Junior Engineer", department: "Maintenance Team" },
];

const managers: Option[] = [
  { value: "mgr1", label: "Robert Taylor", avatar: "RT", role: "Regional Manager", department: "Operations" },
  { value: "mgr2", label: "Jennifer White", avatar: "JW", role: "Technical Manager", department: "Engineering" },
  { value: "mgr3", label: "Thomas Anderson", avatar: "TA", role: "Customer Success Manager", department: "Customer Relations" },
  { value: "mgr4", label: "Amanda Martinez", avatar: "AM", role: "Network Operations Manager", department: "NOC" },
];

const locations = [
  "North District", "South District", "East District", "West District", "Central District"
];

const roles = [
  "Premium Customer", "Basic Customer", "Business Customer", "Senior Engineer", "Field Engineer", "Technical Lead", "Regional Manager", "Technical Manager"
];

export function NotificationComposer({ onSend }: NotificationComposerProps) {
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      recipientType: "all-users",
      specificRecipients: [],
      scheduleType: "immediate",
      enablePushNotification: true,
      enableEmailNotification: false,
      enableSMSNotification: false,
    },
  });

  const recipientType = form.watch("recipientType");
  const scheduleType = form.watch("scheduleType");
  const messageLength = form.watch("message")?.length || 0;

  const getRecipientOptions = () => {
    switch (recipientType) {
      case "specific-users":
        return users;
      case "specific-engineers":
        return engineers;
      case "specific-managers":
        return managers;
      default:
        return [];
    }
  };

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

  const getEstimatedReach = () => {
    switch (recipientType) {
      case "all-users":
        return `~${users.length * 50} users`;
      case "all-engineers":
        return `${engineers.length} engineers`;
      case "all-managers":
        return `${managers.length} managers`;
      case "specific-users":
      case "specific-engineers":
      case "specific-managers":
        return `${selectedRecipients.length} selected`;
      case "location-based":
        return form.watch("locationFilter") ? `~${Math.floor(users.length * 50 / locations.length)} users` : "Select location";
      case "role-based":
        return form.watch("roleFilter") ? `~${Math.floor(users.length * 50 / roles.length)} users` : "Select role";
      default:
        return "0 recipients";
    }
  };

  const onSubmit = (data: NotificationFormData) => {
    if (data.scheduleType === "scheduled" && !data.scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date",
        variant: "destructive",
      });
      return;
    }

    if (recipientType.includes("specific") && selectedRecipients.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    const notificationData = {
      ...data,
      specificRecipients: selectedRecipients,
    };

    onSend(notificationData);
    form.reset();
    setSelectedRecipients([]);
    toast({
      title: "Success",
      description: data.scheduleType === "immediate" ? "Notification sent successfully" : "Notification scheduled successfully",
    });
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Compose Notification</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Reach: {getEstimatedReach()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="flex items-center space-x-2">
                  <span>Type</span>
                  {getTypeIcon(form.watch("type"))}
                </Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span>Information</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Success</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Warning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center space-x-2">
                        <X className="h-4 w-4 text-red-600" />
                        <span>Error</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) => form.setValue("priority", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>
                    </SelectItem>
                    <SelectItem value="medium">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
                    </SelectItem>
                    <SelectItem value="high">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Subject</Label>
              <Input
                id="title"
                placeholder="Enter notification subject"
                {...form.register("title")}
                className="text-base"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message" className="flex items-center justify-between">
                <span>Message</span>
                <span className={cn(
                  "text-xs",
                  messageLength > 400 ? "text-red-600" : messageLength > 300 ? "text-yellow-600" : "text-muted-foreground"
                )}>
                  {messageLength}/500
                </span>
              </Label>
              <Textarea
                id="message"
                rows={4}
                placeholder="Enter notification message"
                {...form.register("message")}
                className="text-base resize-none"
              />
              {form.formState.errors.message && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.message.message}</p>
              )}
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Recipients</Label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{getEstimatedReach()}</span>
              </div>
            </div>

            <Select
              value={recipientType}
              onValueChange={(value) => {
                form.setValue("recipientType", value as any);
                setSelectedRecipients([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-users">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>All Users</span>
                  </div>
                </SelectItem>
                <SelectItem value="all-engineers">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>All Engineers</span>
                  </div>
                </SelectItem>
                <SelectItem value="all-managers">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>All Managers</span>
                  </div>
                </SelectItem>
                <SelectItem value="specific-users">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Specific Users</span>
                  </div>
                </SelectItem>
                <SelectItem value="specific-engineers">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Specific Engineers</span>
                  </div>
                </SelectItem>
                <SelectItem value="specific-managers">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Specific Managers</span>
                  </div>
                </SelectItem>
                <SelectItem value="location-based">Location Based</SelectItem>
                <SelectItem value="role-based">Role Based</SelectItem>
              </SelectContent>
            </Select>

            {/* Specific Recipients Selection */}
            {recipientType.includes("specific") && (
              <div>
                <Label>Select Recipients</Label>
                <MultiSelect
                  options={getRecipientOptions()}
                  selected={selectedRecipients}
                  onChange={setSelectedRecipients}
                  placeholder={`Select ${recipientType.replace("specific-", "")}...`}
                  maxItems={3}
                  searchPlaceholder={`Search ${recipientType.replace("specific-", "")}...`}
                />
              </div>
            )}

            {/* Location Filter */}
            {recipientType === "location-based" && (
              <div>
                <Label htmlFor="locationFilter">Location</Label>
                <Select
                  value={form.watch("locationFilter") || ""}
                  onValueChange={(value) => form.setValue("locationFilter", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Role Filter */}
            {recipientType === "role-based" && (
              <div>
                <Label htmlFor="roleFilter">Role</Label>
                <Select
                  value={form.watch("roleFilter") || ""}
                  onValueChange={(value) => form.setValue("roleFilter", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Advanced Options</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 bg-muted/20 rounded-lg p-4">
                {/* Scheduling */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Scheduling</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={scheduleType === "immediate"}
                        onCheckedChange={(checked) => 
                          form.setValue("scheduleType", checked ? "immediate" : "scheduled")
                        }
                      />
                      <Label className="text-sm">Send Immediately</Label>
                    </div>
                    {scheduleType === "scheduled" && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              <CalendarDays className="h-4 w-4 mr-2" />
                              {form.watch("scheduledDate") 
                                ? format(form.watch("scheduledDate")!, "PPP") 
                                : "Pick date"
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={form.watch("scheduledDate")}
                              onSelect={(date) => form.setValue("scheduledDate", date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Channels */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Delivery Channels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("enablePushNotification")}
                        onCheckedChange={(checked) => form.setValue("enablePushNotification", checked)}
                      />
                      <Label className="text-sm">Push Notification</Label>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("enableEmailNotification")}
                        onCheckedChange={(checked) => form.setValue("enableEmailNotification", checked)}
                      />
                      <Label className="text-sm">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.watch("enableSMSNotification")}
                        onCheckedChange={(checked) => form.setValue("enableSMSNotification", checked)}
                      />
                      <Label className="text-sm">SMS</Label>
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(form.watch("priority"))}>
                {form.watch("priority").toUpperCase()}
              </Badge>
              {getTypeIcon(form.watch("type"))}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedRecipients([]);
                }}
              >
                Clear
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {scheduleType === "immediate" ? "Send Now" : "Schedule"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}