import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Mail, Phone, MapPin, Calendar, Star, Briefcase, Clock, Award, MoreHorizontal, Edit } from 'lucide-react';
import { dummyEngineers, dummyComplaints } from '@/lib/dummyData';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function EngineerDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const engineerId = params?.id ? parseInt(params.id) : null;
  
  const engineer = engineerId ? dummyEngineers.find(e => e.id === engineerId) : null;
  const engineerComplaints = engineerId ? dummyComplaints.filter(c => c.engineerId === engineerId) : [];

  if (!engineer) {
    return (
      <MainLayout title="Engineer Not Found">
        <div className="p-8 text-center">
          <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Engineer Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The engineer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/engineers')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Engineers
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

  const getRatingColor = (rating: number) => {
    if (rating >= 45) return 'text-green-600 dark:text-green-400';
    if (rating >= 35) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const completionRate = engineer.completedJobs / (engineer.completedJobs + engineer.activeJobs) * 100;

  return (
    <MainLayout title={`${engineer.name} - Engineer Details`}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/engineers')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Engineers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{engineer.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Engineer Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Engineer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <CardTitle className="text-xl">{engineer.name}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">{engineer.specialization}</p>
                <div className="flex justify-center">
                  <Badge className={cn(
                    "capitalize",
                    engineer.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}>
                    {engineer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium">{engineer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium">{engineer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium">{engineer.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                  <span className="font-medium">{new Date(engineer.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className={cn("h-4 w-4", getRatingColor(engineer.rating))} />
                      <span className={cn("font-bold", getRatingColor(engineer.rating))}>
                        {engineer.rating}/50
                      </span>
                    </div>
                  </div>
                  <Progress value={(engineer.rating / 50) * 100} className="h-2" />
                </div>

                {/* Completion Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>

                {/* Jobs Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
                      <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{engineer.completedJobs}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{engineer.activeJobs}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Assigned Complaints */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Assigned Complaints</span>
                  <Badge variant="secondary">{engineerComplaints.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {engineerComplaints.length > 0 ? (
                  <div className="space-y-4">
                    {engineerComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{complaint.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={cn("text-xs", getPriorityColor(complaint.priority))}>
                              {complaint.priority}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(complaint.status))}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <span>Customer: {complaint.customerName}</span>
                            <span>Location: {complaint.location}</span>
                          </div>
                          <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Complaints</h3>
                    <p className="text-gray-600 dark:text-gray-400">This engineer has no complaints assigned currently.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {((engineer.completedJobs / (engineer.completedJobs + engineer.activeJobs)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {Math.round(engineer.completedJobs / 12)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Jobs/Month</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {engineer.rating >= 45 ? 'Excellent' : engineer.rating >= 35 ? 'Good' : 'Average'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}