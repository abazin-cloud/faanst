'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ShowroomModeContextType {
  isShowroomMode: boolean;
  toggleShowroomMode: () => void;
}

const ShowroomModeContext = createContext<ShowroomModeContextType | undefined>(undefined);

export function ShowroomModeProvider({ children }: { children: React.ReactNode }) {
  const [isShowroomMode, setIsShowroomMode] = useState(false);

  // Persist showroom mode in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('showroom-mode');
    if (stored === 'true') {
      setIsShowroomMode(true);
    }
  }, []);

  const toggleShowroomMode = () => {
    setIsShowroomMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('showroom-mode', String(newValue));
      return newValue;
    });
  };

  return (
    <ShowroomModeContext.Provider value={{ isShowroomMode, toggleShowroomMode }}>
      {children}
    </ShowroomModeContext.Provider>
  );
}

export function useShowroomMode() {
  const context = useContext(ShowroomModeContext);
  if (context === undefined) {
    throw new Error('useShowroomMode must be used within a ShowroomModeProvider');
  }
  return context;
}














