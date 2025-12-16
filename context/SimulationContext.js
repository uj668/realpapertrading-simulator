'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [simulationDate, setSimulationDateState] = useState(null); // null = today/live mode
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);

  // Load simulation date from localStorage on mount
  useEffect(() => {
    const savedDate = localStorage.getItem('simulationDate');
    if (savedDate && savedDate !== 'null') {
      setSimulationDateState(savedDate);
      setIsHistoricalMode(true);
    }
  }, []);

  // Set simulation date and save to localStorage
  const setSimulationDate = (date) => {
    if (date === null || date === 'today') {
      // Live mode
      setSimulationDateState(null);
      setIsHistoricalMode(false);
      localStorage.setItem('simulationDate', 'null');
    } else {
      // Historical mode
      setSimulationDateState(date);
      setIsHistoricalMode(true);
      localStorage.setItem('simulationDate', date);
    }
  };

  // Jump to today (live mode)
  const jumpToToday = () => {
    setSimulationDate(null);
  };

  // Move date by days
  const moveDate = (days) => {
    const currentDate = simulationDate ? new Date(simulationDate) : new Date();
    currentDate.setDate(currentDate.getDate() + days);
    
    // Don't allow future dates
    const today = new Date();
    if (currentDate > today) {
      setSimulationDate(null); // Go to live mode
    } else {
      setSimulationDate(currentDate.toISOString().split('T')[0]);
    }
  };

  // Quick date jumps
  const jumpToDate = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    
    if (targetDate > today) {
      setSimulationDate(null); // Can't go to future
    } else {
      setSimulationDate(targetDate.toISOString().split('T')[0]);
    }
  };

  // Get display date
  const getDisplayDate = () => {
    if (!simulationDate || !isHistoricalMode) {
      return new Date().toISOString().split('T')[0];
    }
    return simulationDate;
  };

  const value = {
    simulationDate,
    isHistoricalMode,
    setSimulationDate,
    jumpToToday,
    moveDate,
    jumpToDate,
    getDisplayDate,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

