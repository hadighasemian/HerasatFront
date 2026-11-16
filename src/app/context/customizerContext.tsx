"use client"
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import config from './config'


const MODE_KEY = "flowbite-theme-mode";

// Define the shape of the context state
interface CustomizerContextState {
  selectedIconId: number;
  setSelectedIconId: (id: number) => void;
  activeDir: string;
  setActiveDir: (dir: string) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
}

// Create the context with an initial value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}
// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [activeDir, setActiveDir] = useState<string>(config.activeDir);
  const [activeMode, setActiveModeState] = useState<string>(config.activeMode);
  const [modeLoaded, setModeLoaded] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayout] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadow] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayout] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadius] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguage] = useState<string>(config.isLanguage);

  // Restore the saved light/dark choice (same key flowbite's ThemeModeScript applies before paint),
  // so the mode survives full page loads instead of falling back to light on every navigation.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "dark" || saved === "light") setActiveModeState(saved);
    } catch {
      /* storage blocked: keep the default */
    }
    setModeLoaded(true);
  }, []);

  const setActiveMode = (mode: string) => {
    setActiveModeState(mode);
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  // Set attributes immediately
  useEffect(() => {
    if (modeLoaded) {
      // toggle only our classes; replacing the whole class attribute wiped other classes
      document.documentElement.classList.toggle("dark", activeMode === "dark");
      document.documentElement.classList.toggle("light", activeMode !== "dark");
    }
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);

  }, [modeLoaded, activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        selectedIconId,
        setSelectedIconId,
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
        activeLayout,
        setActiveLayout,
        isCardShadow,
        setIsCardShadow,
        isLayout,
        setIsLayout,
        isBorderRadius,
        setIsBorderRadius,
        isCollapse,
        setIsCollapse,
        isLanguage,
        setIsLanguage
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};


