import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, User, Wrench, MapPin, Calendar, Clock, Star, MessageSquare, CheckCircle, X, Flag, Phone, Mail } from 'lucide-react';
import { dummyComplaints, dummyCustomers, dummyEngineers } from '@/lib/dummyData';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function ComplaintDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const complaintId = params?.id ? parseInt(params.id) : null;
  
  const complaint = complaintId ? dummyComplaints.find(c => c.id === complaintId) : null;
  const customer = complaint ? dummyCustomers.find(c => c.id === complaint.customerId) : null;
  const engineer = complaint?.engineerId ? dummyEngineers.find(e => e.id === complaint.engineerId) : null;

  if (!complaint) {
    return (
      <MainLayout title="Complaint Not Found">
        <div className="p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Complaint Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The complaint you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/complaints')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complaints
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'assigned':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTimeElapsed = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  // Mock timeline data
  const timeline = [
    {
      id: 1,
      action: "Complaint Created",
      description: `Complaint filed by ${customer?.name}`,
      timestamp: complaint.createdAt,
      type: "created",
      user: customer?.name
    },
    ...(complaint.engineerId ? [{
      id: 2,
      action: "Engineer Assigned",
      description: `Assigned to ${engineer?.name}`,
      timestamp: complaint.updatedAt,
      type: "assigned",
      user: engineer?.name
    }] : []),
    ...(complaint.status === 'in-progress' ? [{
      id: 3,
      action: "Work Started",
      description: "Engineer began working on the issue",
      timestamp: complaint.updatedAt,
      type: "progress",
      user: engineer?.name
    }] : []),
    ...(complaint.resolvedAt ? [{
      id: 4,
      action: "Complaint Resolved",
      description: complaint.resolution || "Issue has been resolved",
      timestamp: complaint.resolvedAt,
      type: "resolved",
      user: engineer?.name
    }] : [])
  ];

  return (
    <MainLayout title={`${complaint.title} - Complaint Details`}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/complaints')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Complaints
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">#{complaint.id}</h1>
                <Badge className={cn("capitalize", getPriorityColor(complaint.priority))}>
                  {complaint.priority}
                </Badge>
                <Badge className={cn("capitalize", getStatusColor(complaint.status))}>
                  {complaint.status}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{complaint.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Escalate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Complaint Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="font-medium">{new Date(complaint.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{getTimeElapsed(complaint.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="font-medium">{new Date(complaint.updatedAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{getTimeElapsed(complaint.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">{complaint.location}</span>
                    </div>
                  </div>
                  {complaint.resolvedAt && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                      <p className="font-medium">{new Date(complaint.resolvedAt).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{getTimeElapsed(complaint.resolvedAt)}</p>
                    </div>
                  )}
                </div>

                {complaint.resolution && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Resolution
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                        {complaint.resolution}
                      </p>
                    </div>
                  </>
                )}

                {complaint.feedback && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        Customer Feedback
                        {complaint.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{complaint.rating}/5</span>
                          </div>
                        )}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                        {complaint.feedback}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          item.type === 'created' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                          item.type === 'assigned' && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                          item.type === 'progress' && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
                          item.type === 'resolved' && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        )}>
                          {item.type === 'created' && <AlertCircle className="h-4 w-4" />}
                          {item.type === 'assigned' && <User className="h-4 w-4" />}
                          {item.type === 'progress' && <Clock className="h-4 w-4" />}
                          {item.type === 'resolved' && <CheckCircle className="h-4 w-4" />}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.action}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        {item.user && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {item.user}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customer & Engineer Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className={cn(
                        "capitalize text-xs",
                        customer.status === 'active' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      )}>
                        {customer.status}
                      </Badge>
                      <span className="text-xs text-gray-500">Status</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/users/${customer.id}`)}
                  >
                    View Customer Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Engineer Info */}
            {engineer ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Assigned Engineer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        {engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{engineer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{engineer.specialization}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{engineer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{engineer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{engineer.rating}/50 Rating</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{engineer.completedJobs} Jobs Completed</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/engineers/${engineer.id}`)}
                  >
                    View Engineer Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Engineer Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <Wrench className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">No engineer assigned yet</p>
                  <Button size="sm" className="w-full">
                    Assign Engineer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}