import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  User, 
  Bell, 
  Clock, 
  Shield, 
  Mail, 
  MessageSquare,
  Save,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Zap,
  Target,
  Users,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus
} from "lucide-react";

interface SettingsPanelProps {
  onSettingsUpdate: (settings: any) => void;
}

export function SettingsPanel({ onSettingsUpdate }: SettingsPanelProps) {
  const { toast } = useToast();

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "WiFi Self-Care Platform",
    supportEmail: "support@wificare.com",
    businessHours: "Monday - Friday, 9:00 AM - 6:00 PM",
    timezone: "Asia/Kolkata",
    
    // SLA Settings
    responseTime: "2", // hours
    resolutionTime: "24", // hours
    urgentTicketResponse: "30", // minutes
    escalationTime: "4", // hours
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    customerUpdates: true,
    agentAssignments: true,
    ticketEscalation: true,
    
    // Rating Settings
    enableRatings: true,
    mandatoryRating: false,
    ratingThreshold: "3", // minimum rating to flag for review
    feedbackRequired: true,
    publicReviews: false,
    moderateReviews: true,
    
    // Auto-Assignment Settings
    autoAssignment: true,
    loadBalancing: true,
    skillBasedRouting: true,
    roundRobinAssignment: false,
    
    // Security Settings
    requireAuth: true,
    sessionTimeout: "30", // minutes
    twoFactorAuth: false,
    auditLog: true,
    
    // Integration Settings
    slackIntegration: false,
    teamsIntegration: false,
    webhookUrl: "",
    apiAccessEnabled: true,
    
    // Custom Templates
    welcomeMessage: "Thank you for contacting our support team. We'll respond to your ticket within 2 hours.",
    resolvedMessage: "Your ticket has been resolved. Please rate our service to help us improve.",
    escalationMessage: "Your ticket has been escalated to our senior team for priority handling.",
    
    // Department Settings
    departments: [
      { id: 1, name: "Technical Support", active: true, agents: 8 },
      { id: 2, name: "Billing", active: true, agents: 4 },
      { id: 3, name: "Sales", active: true, agents: 6 },
      { id: 4, name: "Installation", active: true, agents: 5 }
    ],
    
    // Priority Settings
    priorities: [
      { level: "Low", color: "#3b82f6", autoEscalate: false, escalateAfter: "72" },
      { level: "Medium", color: "#f59e0b", autoEscalate: true, escalateAfter: "24" },
      { level: "High", color: "#ef4444", autoEscalate: true, escalateAfter: "8" },
      { level: "Urgent", color: "#dc2626", autoEscalate: true, escalateAfter: "2" }
    ]
  });

  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSettingsUpdate(settings);
    setIsLoading(false);
    
    toast({
      title: "Settings Saved",
      description: "Your support settings have been updated successfully",
    });
  };

  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    });
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'support-settings.json';
    link.click();
    
    toast({
      title: "Settings Exported",
      description: "Settings have been downloaded as JSON file",
    });
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "sla", label: "SLA & Performance", icon: Target },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "ratings", label: "Ratings & Reviews", icon: MessageSquare },
    { id: "assignment", label: "Auto-Assignment", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "templates", label: "Templates", icon: Mail }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleSettingChange("companyName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleSettingChange("supportEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  value={settings.businessHours}
                  onChange={(e) => handleSettingChange("businessHours", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Departments</Label>
              <div className="space-y-3">
                {settings.departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={dept.active}
                        onCheckedChange={(checked) => {
                          const newDepts = settings.departments.map(d => 
                            d.id === dept.id ? { ...d, active: checked } : d
                          );
                          handleSettingChange("departments", newDepts);
                        }}
                      />
                      <span className="font-medium">{dept.name}</span>
                      <Badge variant="outline">{dept.agents} agents</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "sla":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responseTime">Response Time (hours)</Label>
                <Input
                  id="responseTime"
                  type="number"
                  value={settings.responseTime}
                  onChange={(e) => handleSettingChange("responseTime", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">Target time to respond to new tickets</p>
              </div>
              <div>
                <Label htmlFor="resolutionTime">Resolution Time (hours)</Label>
                <Input
                  id="resolutionTime"
                  type="number"
                  value={settings.resolutionTime}
                  onChange={(e) => handleSettingChange("resolutionTime", e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">Target time to resolve tickets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgentTicketResponse">Urgent Ticket Response (minutes)</Label>
                <Input
                  id="urgentTicketResponse"
                  type="number"
                  value={settings.urgentTicketResponse}
                  onChange={(e) => handleSettingChange("urgentTicketResponse", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="escalationTime">Auto-Escalation Time (hours)</Label>
                <Input
                  id="escalationTime"
                  type="number"
                  value={settings.escalationTime}
                  onChange={(e) => handleSettingChange("escalationTime", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Priority Settings</Label>
              <div className="space-y-3">
                {settings.priorities.map((priority, index) => (
                  <div key={priority.level} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <span className="font-medium">{priority.level} Priority</span>
                      </div>
                      <Switch
                        checked={priority.autoEscalate}
                        onCheckedChange={(checked) => {
                          const newPriorities = [...settings.priorities];
                          newPriorities[index] = { ...priority, autoEscalate: checked };
                          handleSettingChange("priorities", newPriorities);
                        }}
                      />
                    </div>
                    {priority.autoEscalate && (
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Escalate after:</Label>
                        <Input
                          className="w-20"
                          type="number"
                          value={priority.escalateAfter}
                          onChange={(e) => {
                            const newPriorities = [...settings.priorities];
                            newPriorities[index] = { ...priority, escalateAfter: e.target.value };
                            handleSettingChange("priorities", newPriorities);
                          }}
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send urgent notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-base font-semibold">Notification Types</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Customer Updates</Label>
                  <p className="text-sm text-muted-foreground">Notify customers of ticket status changes</p>
                </div>
                <Switch
                  checked={settings.customerUpdates}
                  onCheckedChange={(checked) => handleSettingChange("customerUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Agent Assignments</Label>
                  <p className="text-sm text-muted-foreground">Notify agents when tickets are assigned</p>
                </div>
                <Switch
                  checked={settings.agentAssignments}
                  onCheckedChange={(checked) => handleSettingChange("agentAssignments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Ticket Escalation</Label>
                  <p className="text-sm text-muted-foreground">Notify supervisors of escalated tickets</p>
                </div>
                <Switch
                  checked={settings.ticketEscalation}
                  onCheckedChange={(checked) => handleSettingChange("ticketEscalation", checked)}
                />
              </div>
            </div>
          </div>
        );

      case "ratings":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Ratings</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to rate support interactions</p>
                </div>
                <Switch
                  checked={settings.enableRatings}
                  onCheckedChange={(checked) => handleSettingChange("enableRatings", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Mandatory Rating</Label>
                  <p className="text-sm text-muted-foreground">Require rating before closing tickets</p>
                </div>
                <Switch
                  checked={settings.mandatoryRating}
                  onCheckedChange={(checked) => handleSettingChange("mandatoryRating", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Feedback Required</Label>
                  <p className="text-sm text-muted-foreground">Require written feedback with ratings</p>
                </div>
                <Switch
                  checked={settings.feedbackRequired}
                  onCheckedChange={(checked) => handleSettingChange("feedbackRequired", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Public Reviews</Label>
                  <p className="text-sm text-muted-foreground">Make reviews visible to other customers</p>
                </div>
                <Switch
                  checked={settings.publicReviews}
                  onCheckedChange={(checked) => handleSettingChange("publicReviews", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Moderate Reviews</Label>
                  <p className="text-sm text-muted-foreground">Review feedback before publishing</p>
                </div>
                <Switch
                  checked={settings.moderateReviews}
                  onCheckedChange={(checked) => handleSettingChange("moderateReviews", checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ratingThreshold">Rating Alert Threshold</Label>
              <Select value={settings.ratingThreshold} onValueChange={(value) => handleSettingChange("ratingThreshold", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star - Alert on very poor ratings</SelectItem>
                  <SelectItem value="2">2 Stars - Alert on poor ratings</SelectItem>
                  <SelectItem value="3">3 Stars - Alert on average ratings</SelectItem>
                  <SelectItem value="4">4 Stars - Alert on good ratings</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">Ratings below this threshold will trigger alerts</p>
            </div>
          </div>
        );

      case "assignment":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-Assignment</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign tickets to agents</p>
                </div>
                <Switch
                  checked={settings.autoAssignment}
                  onCheckedChange={(checked) => handleSettingChange("autoAssignment", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Load Balancing</Label>
                  <p className="text-sm text-muted-foreground">Distribute tickets based on agent workload</p>
                </div>
                <Switch
                  checked={settings.loadBalancing}
                  onCheckedChange={(checked) => handleSettingChange("loadBalancing", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Skill-Based Routing</Label>
                  <p className="text-sm text-muted-foreground">Assign tickets based on agent expertise</p>
                </div>
                <Switch
                  checked={settings.skillBasedRouting}
                  onCheckedChange={(checked) => handleSettingChange("skillBasedRouting", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Round Robin Assignment</Label>
                  <p className="text-sm text-muted-foreground">Assign tickets in sequential order</p>
                </div>
                <Switch
                  checked={settings.roundRobinAssignment}
                  onCheckedChange={(checked) => handleSettingChange("roundRobinAssignment", checked)}
                />
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Require Authentication</Label>
                  <p className="text-sm text-muted-foreground">Users must login to create tickets</p>
                </div>
                <Switch
                  checked={settings.requireAuth}
                  onCheckedChange={(checked) => handleSettingChange("requireAuth", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for agent accounts</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all user actions for security</p>
                </div>
                <Switch
                  checked={settings.auditLog}
                  onCheckedChange={(checked) => handleSettingChange("auditLog", checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">Auto-logout users after inactivity</p>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Slack Integration</Label>
                  <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
                </div>
                <Switch
                  checked={settings.slackIntegration}
                  onCheckedChange={(checked) => handleSettingChange("slackIntegration", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Microsoft Teams Integration</Label>
                  <p className="text-sm text-muted-foreground">Send notifications to Teams channels</p>
                </div>
                <Switch
                  checked={settings.teamsIntegration}
                  onCheckedChange={(checked) => handleSettingChange("teamsIntegration", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">API Access</Label>
                  <p className="text-sm text-muted-foreground">Enable REST API for integrations</p>
                </div>
                <Switch
                  checked={settings.apiAccessEnabled}
                  onCheckedChange={(checked) => handleSettingChange("apiAccessEnabled", checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://your-webhook-url.com/endpoint"
                value={settings.webhookUrl}
                onChange={(e) => handleSettingChange("webhookUrl", e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">Receive ticket events via webhook</p>
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                rows={3}
                value={settings.welcomeMessage}
                onChange={(e) => handleSettingChange("welcomeMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">Sent when tickets are created</p>
            </div>

            <div>
              <Label htmlFor="resolvedMessage">Resolution Message</Label>
              <Textarea
                id="resolvedMessage"
                rows={3}
                value={settings.resolvedMessage}
                onChange={(e) => handleSettingChange("resolvedMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">Sent when tickets are resolved</p>
            </div>

            <div>
              <Label htmlFor="escalationMessage">Escalation Message</Label>
              <Textarea
                id="escalationMessage"
                rows={3}
                value={settings.escalationMessage}
                onChange={(e) => handleSettingChange("escalationMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">Sent when tickets are escalated</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Support Settings</h2>
          <p className="text-muted-foreground">Configure your support system preferences and policies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border rounded-lg">
        <div className="flex flex-wrap border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Save Progress */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Saving settings...</span>
            </div>
            <Progress value={66} className="mt-2" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}