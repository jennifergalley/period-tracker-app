import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DEFAULT_SYMPTOMS } from '../features/symptoms/symptomUtils';
import * as FileSystem from 'expo-file-system';

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
  autoAddPeriodDays: boolean;
  setAutoAddPeriodDays: React.Dispatch<React.SetStateAction<boolean>>;
  periodAutoLogLength: number;
  setPeriodAutoLogLength: React.Dispatch<React.SetStateAction<number>>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const DATA_FILE = FileSystem.documentDirectory + 'appState.json';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weightLogs, setWeightLogs] = useState<{ [date: string]: WeightLog }>({});
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<{ [date: string]: string[] }>({});
  const [allSymptoms, setAllSymptoms] = useState(DEFAULT_SYMPTOMS);
  const [autoAddPeriodDays, setAutoAddPeriodDays] = useState<boolean>(true);
  const [periodAutoLogLength, setPeriodAutoLogLength] = useState<number>(5);

  // Load state from file on mount
  useEffect(() => {
    (async () => {
      try {
        const file = await FileSystem.readAsStringAsync(DATA_FILE);
        const data = JSON.parse(file);
        if (data.weightLogs) setWeightLogs(data.weightLogs);
        if (data.weightUnit) setWeightUnit(data.weightUnit);
        if (data.periodDays) setPeriodDays(data.periodDays);
        if (data.symptomLogs) setSymptomLogs(data.symptomLogs);
        if (data.allSymptoms) setAllSymptoms(data.allSymptoms);
        if (typeof data.autoAddPeriodDays === 'boolean') setAutoAddPeriodDays(data.autoAddPeriodDays);
        if (typeof data.periodAutoLogLength === 'number') setPeriodAutoLogLength(data.periodAutoLogLength);
      } catch (e) {
        // File may not exist on first run; that's OK
      }
    })();
  }, []);

  // Save state to file whenever any part changes
  useEffect(() => {
    const data = { weightLogs, weightUnit, periodDays, symptomLogs, allSymptoms, autoAddPeriodDays, periodAutoLogLength };
    FileSystem.writeAsStringAsync(DATA_FILE, JSON.stringify(data));
  }, [weightLogs, weightUnit, periodDays, symptomLogs, allSymptoms, autoAddPeriodDays, periodAutoLogLength]);

  return (
    <AppStateContext.Provider value={{
      weightLogs, setWeightLogs,
      weightUnit, setWeightUnit,
      periodDays, setPeriodDays,
      symptomLogs, setSymptomLogs,
      allSymptoms, setAllSymptoms,
      autoAddPeriodDays, setAutoAddPeriodDays,
      periodAutoLogLength, setPeriodAutoLogLength,
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
