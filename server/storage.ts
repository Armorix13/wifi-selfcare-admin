import {
  users,
  customers,
  engineers,
  servicePlans,
  complaints,
  notifications,
  supportTickets,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Engineer,
  type InsertEngineer,
  type ServicePlan,
  type InsertServicePlan,
  type Complaint,
  type InsertComplaint,
  type Notification,
  type InsertNotification,
  type SupportTicket,
  type InsertSupportTicket,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  getCustomersByLocation(location: string): Promise<Customer[]>;

  // Engineers
  getEngineer(id: number): Promise<Engineer | undefined>;
  createEngineer(engineer: InsertEngineer): Promise<Engineer>;
  updateEngineer(id: number, engineer: Partial<InsertEngineer>): Promise<Engineer | undefined>;
  deleteEngineer(id: number): Promise<boolean>;
  getAllEngineers(): Promise<Engineer[]>;
  getEngineersByLocation(location: string): Promise<Engineer[]>;

  // Service Plans
  getServicePlan(id: number): Promise<ServicePlan | undefined>;
  createServicePlan(plan: InsertServicePlan): Promise<ServicePlan>;
  updateServicePlan(id: number, plan: Partial<InsertServicePlan>): Promise<ServicePlan | undefined>;
  deleteServicePlan(id: number): Promise<boolean>;
  getAllServicePlans(): Promise<ServicePlan[]>;
  getServicePlansByProvider(provider: string): Promise<ServicePlan[]>;

  // Complaints
  getComplaint(id: number): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: number, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined>;
  deleteComplaint(id: number): Promise<boolean>;
  getAllComplaints(): Promise<Complaint[]>;
  getComplaintsByStatus(status: string): Promise<Complaint[]>;
  getComplaintsByEngineer(engineerId: number): Promise<Complaint[]>;
  getComplaintsByLocation(location: string): Promise<Complaint[]>;

  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getAllNotifications(): Promise<Notification[]>;

  // Support Tickets
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;

  // Analytics
  getComplaintStats(): Promise<{
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    avgResolutionTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private customers: Map<number, Customer> = new Map();
  private engineers: Map<number, Engineer> = new Map();
  private servicePlans: Map<number, ServicePlan> = new Map();
  private complaints: Map<number, Complaint> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private supportTickets: Map<number, SupportTicket> = new Map();
  
  private userIdCounter = 1;
  private customerIdCounter = 1;
  private engineerIdCounter = 1;
  private planIdCounter = 1;
  private complaintIdCounter = 1;
  private notificationIdCounter = 1;
  private supportTicketIdCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed admin users
    const adminUser: User = {
      id: this.userIdCounter++,
      username: "admin",
      email: "admin@company.com",
      password: "password123", // In real app, this would be hashed
      role: "super-admin",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Seed customers
    const customers: Customer[] = [
      {
        id: this.customerIdCounter++,
        name: "Rajesh Kumar",
        email: "rajesh@email.com",
        phone: "+91 98765 43210",
        address: "123 Main St, Mumbai Central",
        location: "Mumbai Central",
        serviceProvider: "Jio Fiber",
        planId: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.customerIdCounter++,
        name: "Priya Sharma",
        email: "priya@email.com",
        phone: "+91 87654 32109",
        address: "456 Park Ave, Delhi NCR",
        location: "Delhi NCR",
        serviceProvider: null,
        planId: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.customerIdCounter++,
        name: "Amit Patel",
        email: "amit@email.com",
        phone: "+91 76543 21098",
        address: "789 Tech Park, Bangalore",
        location: "Bangalore",
        serviceProvider: "BSNL Broadband",
        planId: 2,
        isActive: true,
        createdAt: new Date(),
      },
    ];
    customers.forEach(customer => this.customers.set(customer.id, customer));

    // Seed engineers
    const engineers: Engineer[] = [
      {
        id: this.engineerIdCounter++,
        name: "John Doe",
        email: "john.doe@company.com",
        phone: "+91 98765 43210",
        location: "Mumbai Central",
        specialization: "WiFi Installation",
        rating: 48,
        completedJobs: 143,
        activeJobs: 5,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.engineerIdCounter++,
        name: "Sarah Wilson",
        email: "sarah.wilson@company.com",
        phone: "+91 87654 32109",
        location: "Mumbai East",
        specialization: "Network Troubleshooting",
        rating: 46,
        completedJobs: 67,
        activeJobs: 3,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.engineerIdCounter++,
        name: "Mike Johnson",
        email: "mike.johnson@company.com",
        phone: "+91 76543 21098",
        location: "Delhi NCR",
        specialization: "Hardware Repair",
        rating: 49,
        completedJobs: 201,
        activeJobs: 7,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.engineerIdCounter++,
        name: "Ravi Singh",
        email: "ravi.singh@company.com",
        phone: "+91 65432 10987",
        location: "Bangalore",
        specialization: "Fiber Optic",
        rating: 45,
        completedJobs: 89,
        activeJobs: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.engineerIdCounter++,
        name: "Neha Gupta",
        email: "neha.gupta@company.com",
        phone: "+91 54321 09876",
        location: "Chennai",
        specialization: "Cable Installation",
        rating: 47,
        completedJobs: 156,
        activeJobs: 4,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.engineerIdCounter++,
        name: "Arjun Reddy",
        email: "arjun.reddy@company.com",
        phone: "+91 43210 98765",
        location: "Mumbai Central",
        specialization: "Network Troubleshooting",
        rating: 44,
        completedJobs: 78,
        activeJobs: 6,
        isActive: false,
        createdAt: new Date(),
      },
      {
        id: this.engineerIdCounter++,
        name: "Deepika Mehta",
        email: "deepika.mehta@company.com",
        phone: "+91 32109 87654",
        location: "Delhi NCR",
        specialization: "WiFi Installation",
        rating: 50,
        completedJobs: 234,
        activeJobs: 8,
        isActive: true,
        createdAt: new Date(),
      },
    ];
    engineers.forEach(engineer => this.engineers.set(engineer.id, engineer));

    // Seed service plans
    const plans: ServicePlan[] = [
      {
        id: this.planIdCounter++,
        name: "JioFiber Basic",
        provider: "jio",
        speed: "30 Mbps",
        price: 699,
        validity: 30,
        description: "Basic internet plan for home use",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: this.planIdCounter++,
        name: "BSNL Standard",
        provider: "bsnl",
        speed: "50 Mbps",
        price: 899,
        validity: 30,
        description: "Standard broadband connection",
        isActive: true,
        createdAt: new Date(),
      },
    ];
    plans.forEach(plan => this.servicePlans.set(plan.id, plan));

    // Seed complaints
    const complaints: Complaint[] = [
      {
        id: this.complaintIdCounter++,
        customerId: 1,
        title: "WiFi disconnecting frequently",
        description: "WiFi connection keeps dropping every 30 minutes",
        priority: "urgent",
        status: "assigned",
        engineerId: 1,
        location: "Mumbai Central",
        attachments: null,
        resolution: null,
        rating: null,
        feedback: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(),
        resolvedAt: null,
      },
      {
        id: this.complaintIdCounter++,
        customerId: 2,
        title: "Slow internet speed",
        description: "Internet speed is very slow, getting only 10 Mbps instead of 100 Mbps",
        priority: "high",
        status: "in-progress",
        engineerId: 2,
        location: "Delhi NCR",
        attachments: null,
        resolution: null,
        rating: null,
        feedback: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(),
        resolvedAt: null,
      },
      {
        id: this.complaintIdCounter++,
        customerId: 3,
        title: "Unable to connect to network",
        description: "Cannot connect to WiFi network, showing authentication error",
        priority: "medium",
        status: "resolved",
        engineerId: 3,
        location: "Bangalore",
        attachments: null,
        resolution: "Reset router and updated WiFi password",
        rating: 5,
        feedback: "Excellent service! John resolved my WiFi issue very quickly and professionally.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(),
        resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
    ];
    complaints.forEach(complaint => this.complaints.set(complaint.id, complaint));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.userIdCounter++,
      role: insertUser.role || "manager",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Customers
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = {
      ...insertCustomer,
      id: this.customerIdCounter++,
      isActive: insertCustomer.isActive ?? true,
      serviceProvider: insertCustomer.serviceProvider ?? null,
      planId: insertCustomer.planId ?? null,
      createdAt: new Date(),
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updateData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomersByLocation(location: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(customer => customer.location === location);
  }

  // Engineers
  async getEngineer(id: number): Promise<Engineer | undefined> {
    return this.engineers.get(id);
  }

  async createEngineer(insertEngineer: InsertEngineer): Promise<Engineer> {
    const engineer: Engineer = {
      ...insertEngineer,
      id: this.engineerIdCounter++,
      isActive: insertEngineer.isActive ?? true,
      rating: insertEngineer.rating ?? 0,
      completedJobs: insertEngineer.completedJobs ?? 0,
      activeJobs: insertEngineer.activeJobs ?? 0,
      createdAt: new Date(),
    };
    this.engineers.set(engineer.id, engineer);
    return engineer;
  }

  async updateEngineer(id: number, updateData: Partial<InsertEngineer>): Promise<Engineer | undefined> {
    const engineer = this.engineers.get(id);
    if (!engineer) return undefined;
    
    const updatedEngineer = { ...engineer, ...updateData };
    this.engineers.set(id, updatedEngineer);
    return updatedEngineer;
  }

  async deleteEngineer(id: number): Promise<boolean> {
    return this.engineers.delete(id);
  }

  async getAllEngineers(): Promise<Engineer[]> {
    return Array.from(this.engineers.values());
  }

  async getEngineersByLocation(location: string): Promise<Engineer[]> {
    return Array.from(this.engineers.values()).filter(engineer => engineer.location === location);
  }

  // Service Plans
  async getServicePlan(id: number): Promise<ServicePlan | undefined> {
    return this.servicePlans.get(id);
  }

  async createServicePlan(insertPlan: InsertServicePlan): Promise<ServicePlan> {
    const plan: ServicePlan = {
      ...insertPlan,
      id: this.planIdCounter++,
      description: insertPlan.description ?? null,
      isActive: insertPlan.isActive ?? true,
      createdAt: new Date(),
    };
    this.servicePlans.set(plan.id, plan);
    return plan;
  }

  async updateServicePlan(id: number, updateData: Partial<InsertServicePlan>): Promise<ServicePlan | undefined> {
    const plan = this.servicePlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updateData };
    this.servicePlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteServicePlan(id: number): Promise<boolean> {
    return this.servicePlans.delete(id);
  }

  async getAllServicePlans(): Promise<ServicePlan[]> {
    return Array.from(this.servicePlans.values());
  }

  async getServicePlansByProvider(provider: string): Promise<ServicePlan[]> {
    return Array.from(this.servicePlans.values()).filter(plan => plan.provider === provider);
  }

  // Complaints
  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const complaint: Complaint = {
      ...insertComplaint,
      id: this.complaintIdCounter++,
      priority: insertComplaint.priority || "medium",
      status: insertComplaint.status || "pending",
      engineerId: insertComplaint.engineerId ?? null,
      attachments: insertComplaint.attachments ?? null,
      resolution: insertComplaint.resolution ?? null,
      rating: insertComplaint.rating ?? null,
      feedback: insertComplaint.feedback ?? null,
      resolvedAt: insertComplaint.resolvedAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.complaints.set(complaint.id, complaint);
    return complaint;
  }

  async updateComplaint(id: number, updateData: Partial<InsertComplaint>): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    const updatedComplaint = { ...complaint, ...updateData, updatedAt: new Date() };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async deleteComplaint(id: number): Promise<boolean> {
    return this.complaints.delete(id);
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async getComplaintsByStatus(status: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.status === status);
  }

  async getComplaintsByEngineer(engineerId: number): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.engineerId === engineerId);
  }

  async getComplaintsByLocation(location: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.location === location);
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      ...insertNotification,
      id: this.notificationIdCounter++,
      priority: insertNotification.priority || "normal",
      recipients: insertNotification.recipients ?? null,
      deliveredCount: insertNotification.deliveredCount ?? 0,
      readCount: insertNotification.readCount ?? 0,
      sentAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  // Support Tickets
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      ...insertTicket,
      id: this.supportTicketIdCounter++,
      priority: insertTicket.priority || "medium",
      status: insertTicket.status || "open",
      assignedTo: insertTicket.assignedTo ?? null,
      response: insertTicket.response ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.supportTickets.set(ticket.id, ticket);
    return ticket;
  }

  async updateSupportTicket(id: number, updateData: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updateData, updatedAt: new Date() };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  // Analytics
  async getComplaintStats(): Promise<{
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    avgResolutionTime: number;
  }> {
    const complaints = Array.from(this.complaints.values());
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "pending").length;
    const assigned = complaints.filter(c => c.status === "assigned").length;
    const inProgress = complaints.filter(c => c.status === "in-progress").length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    
    const resolvedComplaints = complaints.filter(c => c.resolvedAt && c.createdAt);
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((sum, c) => {
          const resolutionTime = (c.resolvedAt!.getTime() - c.createdAt!.getTime()) / (1000 * 60 * 60); // hours
          return sum + resolutionTime;
        }, 0) / resolvedComplaints.length
      : 0;

    return {
      total,
      pending,
      assigned,
      inProgress,
      resolved,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
