import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SYMPTOMS } from '@/features/symptomUtils';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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
  showOvulation: boolean;
  setShowOvulation: React.Dispatch<React.SetStateAction<boolean>>;
  showFertileWindow: boolean;
  setShowFertileWindow: React.Dispatch<React.SetStateAction<boolean>>;
  themeName: string;
  setThemeName: (theme: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const DATA_FILE = FileSystem.documentDirectory + 'appState.json';

// Cross-platform storage helpers
const storage = {
  async load() {
    if (Platform.OS === 'web') {
      const data = window.localStorage.getItem('appState');
      return data ? JSON.parse(data) : null;
    } else {
      try {
        const file = await FileSystem.readAsStringAsync(DATA_FILE);
        return JSON.parse(file);
      } catch {
        return null;
      }
    }
  },
  
  async save(data: any) {
    if (Platform.OS === 'web') {
      window.localStorage.setItem('appState', JSON.stringify(data));
    } else {
      await FileSystem.writeAsStringAsync(DATA_FILE, JSON.stringify(data));
    }
  }
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weightLogs, setWeightLogs] = useState<{ [date: string]: WeightLog }>({});
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<{ [date: string]: string[] }>({});
  const [allSymptoms, setAllSymptoms] = useState(DEFAULT_SYMPTOMS);
  const [autoAddPeriodDays, setAutoAddPeriodDays] = useState<boolean>(true);
  const [periodAutoLogLength, setPeriodAutoLogLength] = useState<number>(5);
  const [showOvulation, setShowOvulation] = useState<boolean>(true);
  const [showFertileWindow, setShowFertileWindow] = useState<boolean>(true);
  const [themeName, setThemeName] = useState<string>('dark');
  const [accentColor, setAccentColor] = useState<string>('#ffd33d');

  // Load state from storage on mount
  useEffect(() => {
    (async () => {
      const data = await storage.load();
      if (!data) return;
      if (data.weightLogs) setWeightLogs(data.weightLogs);
      if (data.weightUnit) setWeightUnit(data.weightUnit);
      if (data.periodDays) setPeriodDays(data.periodDays);
      if (data.symptomLogs) setSymptomLogs(data.symptomLogs);
      if (data.allSymptoms) setAllSymptoms(data.allSymptoms);
      if (typeof data.autoAddPeriodDays === 'boolean') setAutoAddPeriodDays(data.autoAddPeriodDays);
      if (typeof data.periodAutoLogLength === 'number') setPeriodAutoLogLength(data.periodAutoLogLength);
      if (typeof data.showOvulation === 'boolean') setShowOvulation(data.showOvulation);
      if (typeof data.showFertileWindow === 'boolean') setShowFertileWindow(data.showFertileWindow);
      if (data.themeName) setThemeName(data.themeName);
      if (data.accentColor) setAccentColor(data.accentColor);
    })();
  }, []);

  // Save state to storage whenever any part changes
  useEffect(() => {
    const data = { weightLogs, weightUnit, periodDays, symptomLogs, allSymptoms, autoAddPeriodDays, periodAutoLogLength, showOvulation, showFertileWindow, themeName, accentColor };
    storage.save(data);
  }, [weightLogs, weightUnit, periodDays, symptomLogs, allSymptoms, autoAddPeriodDays, periodAutoLogLength, showOvulation, showFertileWindow, themeName, accentColor]);

  return (
    <AppStateContext.Provider value={{
      weightLogs, setWeightLogs,
      weightUnit, setWeightUnit,
      periodDays, setPeriodDays,
      symptomLogs, setSymptomLogs,
      allSymptoms, setAllSymptoms,
      autoAddPeriodDays, setAutoAddPeriodDays,
      periodAutoLogLength, setPeriodAutoLogLength,
      showOvulation, setShowOvulation,
      showFertileWindow, setShowFertileWindow,
      themeName, setThemeName,
      accentColor, setAccentColor,
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
