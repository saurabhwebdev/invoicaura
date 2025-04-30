import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjects } from '@/context/ProjectsContext';
import { userProfileService } from '@/lib/dbService';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { settings, updateSettings, formatCurrency } = useSettings();
  const { projects, invoices } = useProjects();
  const [loading, setLoading] = useState(true);
  
  // User profile data
  const [profile, setProfile] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    company: 'Thoucentric',
    position: 'Project Manager',
    phone: '+1 (555) 123-4567',
    timeZone: settings.timeZone,
    country: settings.country,
    currency: settings.currency,
    dateFormat: settings.dateFormat || 'MM/DD/YYYY',
    language: settings.language || 'en-US'
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email: {
      invoiceCreated: true,
      invoicePaid: true,
      projectDeadline: true,
      newComment: false
    },
    app: {
      invoiceCreated: true,
      invoicePaid: true,
      projectDeadline: true,
      newComment: true
    }
  });
  
  // Load user profile from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userProfile = await userProfileService.getUserProfile(currentUser);
        
        if (userProfile) {
          // Update profile data
          setProfile(prev => ({
            ...prev,
            company: userProfile.company || prev.company,
            position: userProfile.position || prev.position,
            phone: userProfile.phone || prev.phone,
            timeZone: userProfile.timeZone || settings.timeZone,
            country: userProfile.country || settings.country,
            currency: userProfile.currency || settings.currency,
            dateFormat: userProfile.dateFormat || settings.dateFormat,
            language: userProfile.language || settings.language
          }));
          
          // Update notification settings
          if (userProfile.notifications) {
            setNotifications(userProfile.notifications);
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [currentUser, settings]);
  
  // Update local state when settings change
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      timeZone: settings.timeZone,
      country: settings.country,
      currency: settings.currency,
      dateFormat: settings.dateFormat,
      language: settings.language
    }));
  }, [settings]);
  
  // Billing information
  const [billing, setBilling] = useState({
    plan: 'Business',
    billingCycle: 'Monthly',
    nextBillingDate: '2025-05-15',
    paymentMethod: 'Visa ending in 4242'
  });
  
  // Timezone options
  const timeZones = [
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' }
  ];
  
  // Country options
  const countries = [
    { value: 'United States', label: 'United States', currency: 'USD' },
    { value: 'Canada', label: 'Canada', currency: 'CAD' },
    { value: 'United Kingdom', label: 'United Kingdom', currency: 'GBP' },
    { value: 'Germany', label: 'Germany', currency: 'EUR' },
    { value: 'France', label: 'France', currency: 'EUR' },
    { value: 'Japan', label: 'Japan', currency: 'JPY' },
    { value: 'China', label: 'China', currency: 'CNY' },
    { value: 'Australia', label: 'Australia', currency: 'AUD' },
    { value: 'India', label: 'India', currency: 'INR' }
  ];

  // Currency options
  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (CA$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' }
  ];

  // Date format options
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Europe)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
  ];

  // Language options
  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' }
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      // Save profile data to Firebase
      await userProfileService.saveUserProfile(currentUser, {
        name: profile.name,
        email: profile.email,
        company: profile.company,
        position: profile.position,
        phone: profile.phone,
        country: profile.country,
        timeZone: profile.timeZone,
        currency: profile.currency,
        dateFormat: profile.dateFormat,
        language: profile.language,
        notifications
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile information.",
        variant: "destructive"
      });
    }
  };
  
  const handleCountryChange = (value: string) => {
    // Find the selected country
    const selectedCountry = countries.find(country => country.value === value);
    
    // Update profile with country and its default currency
    if (selectedCountry) {
      const countryUpdate = {
        country: selectedCountry.value,
        currency: selectedCountry.currency
      };
      
      setProfile(prev => ({
        ...prev,
        ...countryUpdate
      }));
      
      // Update global settings
      updateSettings(countryUpdate);
    }
  };

  const handleSaveRegionalSettings = async () => {
    if (!currentUser) return;
    
    try {
      // Update global settings
      await updateSettings({
        timeZone: profile.timeZone,
        currency: profile.currency,
        dateFormat: profile.dateFormat,
        language: profile.language
      });
      
      // Save to user profile
      await userProfileService.saveUserProfile(currentUser, {
        name: profile.name,
        email: profile.email,
        company: profile.company,
        position: profile.position,
        phone: profile.phone,
        country: profile.country,
        timeZone: profile.timeZone,
        currency: profile.currency,
        dateFormat: profile.dateFormat,
        language: profile.language,
        notifications
      });
    } catch (error) {
      console.error('Error saving regional settings:', error);
      toast({
        title: "Error",
        description: "Failed to update regional settings.",
        variant: "destructive"
      });
    }
  };
  
  const handleNotificationToggle = (category: 'email' | 'app', setting: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };
  
  const handleSaveNotifications = async () => {
    if (!currentUser) return;
    
    try {
      // Save notification settings to Firebase
      await userProfileService.updateUserNotifications(currentUser, notifications);
      
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your Google account information and additional profile settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your name and email are managed through your Google account. Changes made here to company and other details will be saved to your InvoiceAura profile.
                  </AlertDescription>
                </Alert>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={currentUser?.photoURL || ""} alt={profile.name} />
                        <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <p className="text-center text-sm text-muted-foreground">
                        Profile image from Google account
                      </p>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={profile.name}
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">Name from Google account</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile.email}
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">Email from Google account</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input 
                            id="company" 
                            value={profile.company}
                            onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input 
                            id="position" 
                            value={profile.position}
                            onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={profile.phone}
                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure your region preferences, timezone, and currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={profile.country} 
                      onValueChange={handleCountryChange}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={profile.timeZone} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, timeZone: value }))}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeZones.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={profile.currency} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Sample: {formatCurrency(1234.56)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={profile.dateFormat} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, dateFormat: value }))}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={profile.language} 
                      onValueChange={(value) => setProfile(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(language => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveRegionalSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure additional system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* System preferences content will go here when needed */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-invoice-created">Invoice Created</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when a new invoice is created
                          </p>
                        </div>
                        <Switch 
                          id="email-invoice-created" 
                          checked={notifications.email.invoiceCreated}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('email', 'invoiceCreated', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-invoice-paid">Invoice Paid</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when an invoice is marked as paid
                          </p>
                        </div>
                        <Switch 
                          id="email-invoice-paid" 
                          checked={notifications.email.invoicePaid}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('email', 'invoicePaid', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-project-deadline">Project Deadline</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when a project deadline is approaching
                          </p>
                        </div>
                        <Switch 
                          id="email-project-deadline" 
                          checked={notifications.email.projectDeadline}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('email', 'projectDeadline', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-new-comment">New Comment</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive an email when someone comments on your project
                          </p>
                        </div>
                        <Switch 
                          id="email-new-comment" 
                          checked={notifications.email.newComment}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('email', 'newComment', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">In-App Notifications</h3>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app-invoice-created">Invoice Created</Label>
                          <p className="text-sm text-muted-foreground">
                            Show a notification when a new invoice is created
                          </p>
                        </div>
                        <Switch 
                          id="app-invoice-created" 
                          checked={notifications.app.invoiceCreated}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('app', 'invoiceCreated', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app-invoice-paid">Invoice Paid</Label>
                          <p className="text-sm text-muted-foreground">
                            Show a notification when an invoice is marked as paid
                          </p>
                        </div>
                        <Switch 
                          id="app-invoice-paid" 
                          checked={notifications.app.invoicePaid}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('app', 'invoicePaid', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app-project-deadline">Project Deadline</Label>
                          <p className="text-sm text-muted-foreground">
                            Show a notification when a project deadline is approaching
                          </p>
                        </div>
                        <Switch 
                          id="app-project-deadline" 
                          checked={notifications.app.projectDeadline}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('app', 'projectDeadline', checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app-new-comment">New Comment</Label>
                          <p className="text-sm text-muted-foreground">
                            Show a notification when someone comments on your project
                          </p>
                        </div>
                        <Switch 
                          id="app-new-comment" 
                          checked={notifications.app.newComment}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle('app', 'newComment', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md mb-6">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Free Beta Period</p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      InvoiceAura is currently in beta. All features are free to use during this period.
                      We appreciate your feedback to help us improve the platform!
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Current Plan</h3>
                        <p className="text-2xl font-bold">{billing.plan}</p>
                      </div>
                      <div className="mt-2 md:mt-0 md:text-right">
                        <p className="text-sm text-muted-foreground">Billing Cycle</p>
                        <p>{billing.billingCycle}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Next billing date</p>
                        <p>{billing.nextBillingDate}</p>
                      </div>
                      <div className="mt-2 md:mt-0 md:text-right">
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p>{billing.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Available Plans</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className={`border-2 ${billing.plan === 'Basic' ? 'border-primary' : ''} opacity-60`}>
                        <CardHeader>
                          <CardTitle>Basic</CardTitle>
                          <div className="text-2xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">For freelancers and small businesses</p>
                          <ul className="text-sm space-y-1">
                            <li>• 10 projects</li>
                            <li>• Unlimited invoices</li>
                            <li>• Basic reports</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" disabled>
                            {billing.plan === 'Basic' ? 'Current Plan' : 'Available After Beta'}
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className={`border-2 ${billing.plan === 'Business' ? 'border-primary' : ''} opacity-60`}>
                        <CardHeader>
                          <CardTitle>Business</CardTitle>
                          <div className="text-2xl font-bold">$29.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">For small to medium businesses</p>
                          <ul className="text-sm space-y-1">
                            <li>• 50 projects</li>
                            <li>• Unlimited invoices</li>
                            <li>• Advanced reports</li>
                            <li>• Team collaboration</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" disabled>
                            {billing.plan === 'Business' ? 'Current Plan' : 'Available After Beta'}
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className={`border-2 ${billing.plan === 'Enterprise' ? 'border-primary' : ''} opacity-60`}>
                        <CardHeader>
                          <CardTitle>Enterprise</CardTitle>
                          <div className="text-2xl font-bold">$99.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">For large organizations</p>
                          <ul className="text-sm space-y-1">
                            <li>• Unlimited projects</li>
                            <li>• Unlimited invoices</li>
                            <li>• Custom reports</li>
                            <li>• Advanced team management</li>
                            <li>• Priority support</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" disabled>
                            {billing.plan === 'Enterprise' ? 'Current Plan' : 'Available After Beta'}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col md:flex-row gap-4 justify-end">
                    <Button variant="outline" disabled>Update Payment Method</Button>
                    <Button variant="outline" disabled>View Billing History</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
