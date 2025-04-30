import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { userProfileService } from '@/lib/dbService';

// Define the types for our settings
interface UserSettings {
  country: string;
  timeZone: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  language: string;
}

// Define the context type
interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | Date) => string;
  loading: boolean;
}

// Create the context with a default undefined value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹'
};

// Default settings
const defaultSettings: UserSettings = {
  country: 'United States',
  timeZone: 'America/New_York',
  currency: 'USD',
  currencySymbol: '$',
  dateFormat: 'MM/DD/YYYY',
  language: 'en-US'
};

// Hook for other components to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// The Settings Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from Firebase and localStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
          // Try to get settings from Firebase first
          const userProfile = await userProfileService.getUserProfile(currentUser);
          
          if (userProfile) {
            // Use settings from Firebase
            setSettings({
              country: userProfile.country || defaultSettings.country,
              timeZone: userProfile.timeZone || defaultSettings.timeZone,
              currency: userProfile.currency || defaultSettings.currency,
              currencySymbol: currencySymbols[userProfile.currency] || defaultSettings.currencySymbol,
              dateFormat: userProfile.dateFormat || defaultSettings.dateFormat,
              language: userProfile.language || defaultSettings.language
            });
            return;
          }
        }
        
        // Fallback to localStorage if Firebase doesn't have settings or user is not logged in
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({
            ...parsedSettings,
            // Ensure currencySymbol is set even if it's missing in saved settings
            currencySymbol: currencySymbols[parsedSettings.currency] || '$'
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // If there's an error, fall back to default settings
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

  // Function to update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      // Create updated settings
      const updatedSettings = { ...settings, ...newSettings };
      
      // Make sure currency symbol is updated if currency changes
      if (newSettings.currency && currencySymbols[newSettings.currency]) {
        updatedSettings.currencySymbol = currencySymbols[newSettings.currency];
      }
      
      // Update state
      setSettings(updatedSettings);
      
      // Save to localStorage (as a backup and for non-logged in users)
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
      // Save to Firebase if user is logged in
      if (currentUser) {
        await userProfileService.saveUserProfile(currentUser, {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          company: '', // These will be updated from Settings.tsx
          position: '',
          phone: '',
          country: updatedSettings.country,
          timeZone: updatedSettings.timeZone,
          currency: updatedSettings.currency,
          dateFormat: updatedSettings.dateFormat,
          language: updatedSettings.language,
          notifications: {
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
          }
        });
      }
      
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated."
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      });
    }
  };

  // Format currency based on user's settings
  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat(settings.language, {
        style: 'currency',
        currency: settings.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback to a simple format if Intl fails
      return `${settings.currencySymbol}${amount.toFixed(2)}`;
    }
  };

  // Format date based on user's settings
  const formatDate = (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Use the user's preferred format
      if (settings.dateFormat === 'DD/MM/YYYY') {
        return dateObj.toLocaleDateString(settings.language, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } else if (settings.dateFormat === 'YYYY-MM-DD') {
        return dateObj.toLocaleDateString(settings.language, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-');
      } else {
        // Default: MM/DD/YYYY
        return dateObj.toLocaleDateString(settings.language, {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      // Fallback for any parsing errors
      return typeof date === 'string' ? date : date.toDateString();
    }
  };

  // Context value
  const value = {
    settings,
    updateSettings,
    formatCurrency,
    formatDate,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 