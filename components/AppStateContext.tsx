import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_SYMPTOMS } from '../features/symptoms/symptomUtils';

// Types
export type WeightUnit = 'kg' | 'lbs';
export interface WeightLog { value: number; unit: WeightUnit; }
export interface Symptom {
  name: string;
  icon: string;
}

export interface AppState {
  weightLogs: { [date: string]: WeightLog };
  setWeightLogs: React.Dispatch<React.SetStateAction<{ [date: string]: WeightLog }>>;
  weightUnit: WeightUnit;
  setWeightUnit: (u: WeightUnit) => void;
  periodDays: string[];
  setPeriodDays: React.Dispatch<React.SetStateAction<string[]>>;
  symptomLogs: { [date: string]: string[] };
  setSymptomLogs: React.Dispatch<React.SetStateAction<{ [date: string]: string[] }>>;
  allSymptoms: { name: string; icon: string }[];
  setAllSymptoms: React.Dispatch<React.SetStateAction<Symptom[]>>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weightLogs, setWeightLogs] = useState<{ [date: string]: WeightLog }>({});
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<{ [date: string]: string[] }>({});
  const [allSymptoms, setAllSymptoms] = useState(DEFAULT_SYMPTOMS);

  return (
    <AppStateContext.Provider value={{
      weightLogs, setWeightLogs,
      weightUnit, setWeightUnit,
      periodDays, setPeriodDays,
      symptomLogs, setSymptomLogs,
      allSymptoms, setAllSymptoms,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};
