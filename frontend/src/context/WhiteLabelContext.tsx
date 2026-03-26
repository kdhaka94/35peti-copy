import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { whiteLabelService } from '../services/white-label.service';

interface WhiteLabelData {
  userId: string;
  domain: string;
  companyName: string;
  logoUrl: string;
  logoImage: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customCSS: string;
  customJS: string;
  headerHTML: string;
  footerHTML: string;
  whatsappNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mode: string;
}

interface WhiteLabelContextType {
  whiteLabel: WhiteLabelData | null;
  loading: boolean;
  loadWhiteLabel: () => Promise<void>;
  applyTheme: () => void;
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

export const WhiteLabelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWhiteLabel = async () => {
    try {
      setLoading(true);
      // Get white-label by current domain
      const hostname = window.location.hostname;
      const response = await whiteLabelService.getWhiteLabelByDomain(hostname);
      const data = response.data.data;
      
      if (data && data.isActive) {
        setWhiteLabel(data);
        applyTheme(data);
      } else {
        // Load default theme
        await loadDefaultTheme();
      }
    } catch (error) {
      console.log('No custom white-label found for this domain, using default theme');
      await loadDefaultTheme();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultTheme = async () => {
    try {
      const response = await whiteLabelService.getMyWhiteLabel();
      const data = response?.data?.data?.whiteLabel;
      console.log(response.data,"resshd")
      if (data) {
        setWhiteLabel(data);
        applyTheme(data);
      }
    } catch (error) {
      console.log('Using default application theme');
    }
  };

  const applyTheme = (data?: WhiteLabelData) => {
    const themeData = data || whiteLabel;
    console.log(themeData,"themedata")
   
    if (!themeData) return;

    // Set theme-1 background color dynamically
  document.documentElement.style.setProperty(
    "--theme1-bg",
    themeData.primaryColor
  );

  // document.documentElement.style.setProperty(
  //   "--theme2-bg",
  //   themeData.primaryColor
  // );

  // document.documentElement.style.setProperty(
  //   "--primary-color",
  //   themeData.textColor
  // );

    // Apply favicon
    if (themeData.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('href', themeData.faviconUrl);
      document.head.appendChild(favicon);
    }

    // Apply custom CSS
    const existingStyle = document.getElementById('white-label-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'white-label-css';
    style.innerHTML = `
     
      
      body {
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: var(--font-family);
      }
      
      .btn-primary {
        background-color: var(--theme1-bg);
        border-color: var(--primary-color);
      }
      
      .btn-primary:hover {
        background-color: var(--theme1-bg);
        border-color: var(--primary-color);
      }

      
     
      ${themeData.customCSS || ''}
    `;
    document.head.appendChild(style);

    // Apply custom JavaScript
    if (themeData.customJS) {
      const existingScript = document.getElementById('white-label-js');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = 'white-label-js';
      script.innerHTML = themeData.customJS;
      document.body.appendChild(script);
    }

    // Apply header HTML
    const headerContainer = document.getElementById('white-label-header');
    if (headerContainer) {
      headerContainer.innerHTML = themeData.headerHTML || '';
    }

    // Apply footer HTML
    const footerContainer = document.getElementById('white-label-footer');
    if (footerContainer) {
      footerContainer.innerHTML = themeData.footerHTML || '';
    }
  };

  useEffect(() => {
    loadWhiteLabel();
  }, []);

  useEffect(() => {
    if (whiteLabel) {
      applyTheme();
    }
  }, [whiteLabel]);

  return (
    <WhiteLabelContext.Provider value={{ whiteLabel, loading, loadWhiteLabel, applyTheme }}>
      {children}
    </WhiteLabelContext.Provider>
  );
};

export const useWhiteLabel = (): WhiteLabelContextType => {
  const context = useContext(WhiteLabelContext);
  if (context === undefined) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }
  return context;
};