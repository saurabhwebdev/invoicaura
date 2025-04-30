import { 
  db, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from './firebase';
import { User } from 'firebase/auth';

// Project Interface
export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  invoiced: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  invoiceCount: number;
  hardwareBudget?: number;
  serviceBudget?: number;
  hardwareInvoiced?: number;
  serviceInvoiced?: number;
  gstEnabled?: boolean;
  gstPercentage?: number; // Default 18%
  tdsEnabled?: boolean;
  tdsPercentage?: number; // Default 2%
  poNumbers?: {
    hardware?: string;
    software?: string;
    combined?: string;
  };
  currentPo?: 'hardware' | 'software' | 'combined';
  activePOs?: ('hardware' | 'software' | 'combined')[];
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Invoice Interface
export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  type?: 'hardware' | 'service';
  poNumber?: string;
  userId: string;
  thirdParty?: {
    company: string;
    invoiceNumber: string;
    amount: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

// Vendor Interface
export interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  totalInvoiced: number;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// UserProfile Interface
export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  country: string;
  timeZone: string;
  currency: string;
  dateFormat: string;
  language: string;
  notifications: {
    email: {
      invoiceCreated: boolean;
      invoicePaid: boolean;
      projectDeadline: boolean;
      newComment: boolean;
    };
    app: {
      invoiceCreated: boolean;
      invoicePaid: boolean;
      projectDeadline: boolean;
      newComment: boolean;
    };
  };
  createdAt?: any;
  updatedAt?: any;
}

// Projects Collection
const projectsCollection = (userId: string) => 
  collection(db, 'users', userId, 'projects');

// Invoices Collection
const invoicesCollection = (userId: string) => 
  collection(db, 'users', userId, 'invoices');

// Vendors Collection
const vendorsCollection = (userId: string) => 
  collection(db, 'users', userId, 'vendors');

// UserProfiles Collection
const userProfilesCollection = () => 
  collection(db, 'userProfiles');

// Project CRUD operations
export const projectService = {
  // Create a new project
  async createProject(user: User, projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!user) throw new Error('User not authenticated');
    
    const project = {
      ...projectData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(projectsCollection(user.uid), project);
    return { id: docRef.id, ...project };
  },
  
  // Get all projects for a user
  async getProjects(user: User) {
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      projectsCollection(user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },
  
  // Get a single project by ID
  async getProject(user: User, projectId: string) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(projectsCollection(user.uid), projectId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      throw new Error('Project not found');
    }
    
    return { id: snapshot.id, ...snapshot.data() } as Project;
  },
  
  // Update a project
  async updateProject(user: User, projectId: string, projectData: Partial<Project>) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(projectsCollection(user.uid), projectId);
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated project
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Project;
  },
  
  // Delete a project
  async deleteProject(user: User, projectId: string) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(projectsCollection(user.uid), projectId);
    await deleteDoc(docRef);
    return true;
  }
};

// Invoice CRUD operations
export const invoiceService = {
  // Create a new invoice
  async createInvoice(user: User, invoiceData: Omit<Invoice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!user) throw new Error('User not authenticated');
    
    const invoice = {
      ...invoiceData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(invoicesCollection(user.uid), invoice);
    const newInvoice = { id: docRef.id, ...invoice };
    
    // Update the project's invoiced amount and invoice count
    const projectRef = doc(projectsCollection(user.uid), invoiceData.projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const projectData = projectSnap.data() as Project;
      const updateData: Record<string, any> = {
        invoiced: projectData.invoiced + invoiceData.amount,
        invoiceCount: projectData.invoiceCount + 1,
        updatedAt: serverTimestamp()
      };
      
      // If this is a hardware or service invoice and the project has hardware/service budgets
      if (invoiceData.type && 
          projectData.hardwareBudget !== undefined && 
          projectData.serviceBudget !== undefined) {
        if (invoiceData.type === 'hardware') {
          updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) + invoiceData.amount;
        } else if (invoiceData.type === 'service') {
          updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) + invoiceData.amount;
        }
      }
      
      await updateDoc(projectRef, updateData);
    }
    
    return newInvoice;
  },
  
  // Get all invoices for a user
  async getInvoices(user: User) {
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      invoicesCollection(user.uid),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
  },
  
  // Get a single invoice by ID
  async getInvoice(user: User, invoiceId: string) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(invoicesCollection(user.uid), invoiceId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      throw new Error('Invoice not found');
    }
    
    return { id: snapshot.id, ...snapshot.data() } as Invoice;
  },
  
  // Update an invoice
  async updateInvoice(user: User, invoiceId: string, invoiceData: Partial<Invoice>) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(invoicesCollection(user.uid), invoiceId);
    const oldInvoice = await getDoc(docRef);
    
    if (!oldInvoice.exists()) {
      throw new Error('Invoice not found');
    }
    
    const oldInvoiceData = oldInvoice.data() as Invoice;
    
    // Update the invoice
    await updateDoc(docRef, {
      ...invoiceData,
      updatedAt: serverTimestamp()
    });
    
    // If the amount or type has changed, update the project's invoiced amount
    if (invoiceData.amount !== undefined && 
        invoiceData.amount !== oldInvoiceData.amount || 
        invoiceData.type !== undefined && 
        invoiceData.type !== oldInvoiceData.type) {
      
      const projectRef = doc(projectsCollection(user.uid), oldInvoiceData.projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const projectData = projectSnap.data() as Project;
        const hasBudgetSplit = projectData.hardwareBudget !== undefined && 
                              projectData.serviceBudget !== undefined;
        
        const updateData: Record<string, any> = {};
        
        // Update total invoiced amount if the amount changed
        if (invoiceData.amount !== undefined && invoiceData.amount !== oldInvoiceData.amount) {
          const amountDifference = invoiceData.amount - oldInvoiceData.amount;
          updateData.invoiced = projectData.invoiced + amountDifference;
          
          // Update hardware or service invoiced amounts if the project has split budgets
          if (hasBudgetSplit) {
            const oldType = oldInvoiceData.type;
            const newType = invoiceData.type !== undefined ? invoiceData.type : oldType;
            
            // If the type hasn't changed, simply update the corresponding invoiced amount
            if (oldType === newType) {
              if (oldType === 'hardware') {
                updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) + amountDifference;
              } else if (oldType === 'service') {
                updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) + amountDifference;
              }
            } 
            // If the type has changed, update both hardware and service invoiced amounts
            else if (invoiceData.type !== undefined && oldType !== invoiceData.type) {
              // Remove the amount from the old type
              if (oldType === 'hardware') {
                updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) - oldInvoiceData.amount;
              } else if (oldType === 'service') {
                updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) - oldInvoiceData.amount;
              }
              
              // Add the amount to the new type
              if (newType === 'hardware') {
                updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) + invoiceData.amount;
              } else if (newType === 'service') {
                updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) + invoiceData.amount;
              }
            }
          }
        }
        // If only the type changed but not the amount
        else if (invoiceData.type !== undefined && 
                invoiceData.type !== oldInvoiceData.type && 
                hasBudgetSplit) {
          // Remove the amount from the old type
          if (oldInvoiceData.type === 'hardware') {
            updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) - oldInvoiceData.amount;
          } else if (oldInvoiceData.type === 'service') {
            updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) - oldInvoiceData.amount;
          }
          
          // Add the amount to the new type
          if (invoiceData.type === 'hardware') {
            updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) + oldInvoiceData.amount;
          } else if (invoiceData.type === 'service') {
            updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) + oldInvoiceData.amount;
          }
        }
        
        if (Object.keys(updateData).length > 0) {
          updateData.updatedAt = serverTimestamp();
          await updateDoc(projectRef, updateData);
        }
      }
    }
    
    // Get the updated invoice
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Invoice;
  },
  
  // Delete an invoice
  async deleteInvoice(user: User, invoiceId: string) {
    if (!user) throw new Error('User not authenticated');
    
    // Get the invoice data before deleting
    const invoiceRef = doc(invoicesCollection(user.uid), invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (!invoiceSnap.exists()) {
      throw new Error('Invoice not found');
    }
    
    const invoiceData = invoiceSnap.data() as Invoice;
    
    // Delete the invoice
    await deleteDoc(invoiceRef);
    
    // Update the project's invoiced amount and invoice count
    const projectRef = doc(projectsCollection(user.uid), invoiceData.projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const projectData = projectSnap.data() as Project;
      const updateData: Record<string, any> = {
        invoiced: projectData.invoiced - invoiceData.amount,
        invoiceCount: projectData.invoiceCount - 1,
        updatedAt: serverTimestamp()
      };
      
      // If this is a hardware or service invoice and the project has split budgets
      if (invoiceData.type && 
          projectData.hardwareBudget !== undefined && 
          projectData.serviceBudget !== undefined) {
        if (invoiceData.type === 'hardware') {
          updateData.hardwareInvoiced = (projectData.hardwareInvoiced || 0) - invoiceData.amount;
        } else if (invoiceData.type === 'service') {
          updateData.serviceInvoiced = (projectData.serviceInvoiced || 0) - invoiceData.amount;
        }
      }
      
      await updateDoc(projectRef, updateData);
    }
    
    return true;
  }
};

// Vendor CRUD operations
export const vendorService = {
  // Create a new vendor
  async createVendor(user: User, vendorData: Omit<Vendor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!user) throw new Error('User not authenticated');
    
    const vendor = {
      ...vendorData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(vendorsCollection(user.uid), vendor);
    return { id: docRef.id, ...vendor };
  },
  
  // Get all vendors for a user
  async getVendors(user: User) {
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      vendorsCollection(user.uid),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
  },
  
  // Get a single vendor by ID
  async getVendor(user: User, vendorId: string) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(vendorsCollection(user.uid), vendorId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      throw new Error('Vendor not found');
    }
    
    return { id: snapshot.id, ...snapshot.data() } as Vendor;
  },
  
  // Update a vendor
  async updateVendor(user: User, vendorId: string, vendorData: Partial<Vendor>) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(vendorsCollection(user.uid), vendorId);
    await updateDoc(docRef, {
      ...vendorData,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated vendor
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Vendor;
  },
  
  // Delete a vendor
  async deleteVendor(user: User, vendorId: string) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(vendorsCollection(user.uid), vendorId);
    await deleteDoc(docRef);
    return true;
  },
  
  // Update vendor total invoiced amount
  async updateVendorTotalInvoiced(user: User, vendorName: string, totalInvoiced: number) {
    if (!user) throw new Error('User not authenticated');
    
    // Find vendor by name
    const q = query(
      vendorsCollection(user.uid),
      where('name', '==', vendorName)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Vendor doesn't exist - create a new one with the given total
      return this.createVendor(user, {
        name: vendorName,
        contactEmail: '',
        status: 'active',
        totalInvoiced
      });
    }
    
    // Update existing vendor
    const vendorDoc = snapshot.docs[0];
    const vendorRef = doc(vendorsCollection(user.uid), vendorDoc.id);
    
    await updateDoc(vendorRef, {
      totalInvoiced,
      updatedAt: serverTimestamp()
    });
    
    const updated = await getDoc(vendorRef);
    return { id: updated.id, ...updated.data() } as Vendor;
  }
};

// UserProfile CRUD operations
export const userProfileService = {
  // Create or update a user profile
  async saveUserProfile(user: User, profileData: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!user) throw new Error('User not authenticated');
    
    // Check if profile already exists
    const existingProfile = await this.getUserProfile(user);
    
    if (existingProfile) {
      // Update existing profile
      return this.updateUserProfile(user, existingProfile.id, profileData);
    } else {
      // Create new profile
      const profile = {
        ...profileData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(userProfilesCollection(), profile);
      return { id: docRef.id, ...profile };
    }
  },
  
  // Get a user profile
  async getUserProfile(user: User) {
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      userProfilesCollection(),
      where('userId', '==', user.uid)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile;
  },
  
  // Update a user profile
  async updateUserProfile(user: User, profileId: string, profileData: Partial<UserProfile>) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(userProfilesCollection(), profileId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated profile
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as UserProfile;
  },
  
  // Delete a user profile
  async deleteUserProfile(user: User, profileId: string) {
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(userProfilesCollection(), profileId);
    await deleteDoc(docRef);
    return true;
  },
  
  // Update user notifications
  async updateUserNotifications(user: User, notifications: UserProfile['notifications']) {
    if (!user) throw new Error('User not authenticated');
    
    const profile = await this.getUserProfile(user);
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    const docRef = doc(userProfilesCollection(), profile.id);
    await updateDoc(docRef, {
      notifications,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated profile
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as UserProfile;
  }
}; 