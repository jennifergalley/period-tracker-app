import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SYMPTOMS } from '@/features/SymptomUtils';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { DateRange } from '@/features/DateRange';
import { DateRangeList } from '@/features/DateRangeList';
import { CycleUtils } from '@/features/CycleUtils';

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
  periodRanges: DateRangeList;
  setPeriodRanges: React.Dispatch<React.SetStateAction<DateRangeList>>;
  symptomLogs: { [date: string]: string[] };
  setSymptomLogs: React.Dispatch<React.SetStateAction<{ [date: string]: string[] }>>;
  allSymptoms: { name: string; icon: string }[];
  setAllSymptoms: React.Dispatch<React.SetStateAction<Symptom[]>>;
  autoAddPeriodDays: boolean;
  setAutoAddPeriodDays: React.Dispatch<React.SetStateAction<boolean>>;
  typicalPeriodLength: number;
  setTypicalPeriodLength: React.Dispatch<React.SetStateAction<number>>;
  showOvulation: boolean;
  setShowOvulation: React.Dispatch<React.SetStateAction<boolean>>;
  showFertileWindow: boolean;
  setShowFertileWindow: React.Dispatch<React.SetStateAction<boolean>>;
  themeName: string;
  setThemeName: (theme: string) => void;
  accentColor: string;  setAccentColor: (color: string) => void;
  textLogs: { [date: string]: string };
  setTextLogs: React.Dispatch<React.SetStateAction<{ [date: string]: string }>>;
  predictedFertileWindow: DateRange;
  setPredictedFertileWindow: React.Dispatch<React.SetStateAction<DateRange>>;
  predictedOvulationDay: Date | null;
  setPredictedOvulationDay: React.Dispatch<React.SetStateAction<Date | null>>;
  predictedPeriods: DateRangeList;
  setPredictedPeriods: React.Dispatch<React.SetStateAction<DateRangeList>>;
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
    // Convert DateRange/DateRangeList to JSON-friendly format
    const toSave = {
      ...data,
      periodRanges: data.periodRanges?.toJSON ? data.periodRanges.toJSON() : data.periodRanges,
      predictedFertileWindow: data.predictedFertileWindow?.toJSON ? data.predictedFertileWindow.toJSON() : data.predictedFertileWindow,
      predictedPeriods: data.predictedPeriods?.toJSON ? data.predictedPeriods.toJSON() : data.predictedPeriods,
    };
    if (Platform.OS === 'web') {
      window.localStorage.setItem('appState', JSON.stringify(toSave));
    } else {
      await FileSystem.writeAsStringAsync(DATA_FILE, JSON.stringify(toSave));
    }
  }
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {  
  const [weightLogs, setWeightLogs] = useState<{ [date: string]: WeightLog }>({});
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [periodRanges, setPeriodRanges] = useState<DateRangeList>(new DateRangeList());
  const [symptomLogs, setSymptomLogs] = useState<{ [date: string]: string[] }>({});
  const [allSymptoms, setAllSymptoms] = useState(DEFAULT_SYMPTOMS);
  const [autoAddPeriodDays, setAutoAddPeriodDays] = useState<boolean>(true);
  const [typicalPeriodLength, setTypicalPeriodLength] = useState<number>(5);
  const [showOvulation, setShowOvulation] = useState<boolean>(true);
  const [showFertileWindow, setShowFertileWindow] = useState<boolean>(true);  
  const [themeName, setThemeName] = useState<string>('dark');
  const [accentColor, setAccentColor] = useState<string>('#ffd33d');
  const [textLogs, setTextLogs] = useState<{ [date: string]: string }>({});  
  const [predictedFertileWindow, setPredictedFertileWindow] = useState<DateRange>(new DateRange(null, null));
  const [predictedOvulationDay, setPredictedOvulationDay] = useState<Date | null>(null);
  const [predictedPeriods, setPredictedPeriods] = useState<DateRangeList>(new DateRangeList());
  
  // Load state from storage on mount
  useEffect(() => {
    (async () => {
      const data = await storage.load();
      if (!data) return;
      
      if (data.weightLogs) setWeightLogs(data.weightLogs);
      if (data.weightUnit) setWeightUnit(data.weightUnit);      
      if (data.periodRanges) {
        const periodRanges = DateRangeList.fromJSON(data.periodRanges);
        setPeriodRanges(periodRanges);
      }
      if (data.symptomLogs) setSymptomLogs(data.symptomLogs);
      if (data.allSymptoms) setAllSymptoms(data.allSymptoms);
      if (typeof data.autoAddPeriodDays === 'boolean') setAutoAddPeriodDays(data.autoAddPeriodDays);
      if (typeof data.typicalPeriodLength === 'number') setTypicalPeriodLength(data.typicalPeriodLength);
      if (typeof data.showOvulation === 'boolean') setShowOvulation(data.showOvulation);
      if (typeof data.showFertileWindow === 'boolean') setShowFertileWindow(data.showFertileWindow);      
      if (data.themeName) setThemeName(data.themeName);
      if (data.accentColor) setAccentColor(data.accentColor);
      if (data.textLogs) setTextLogs(data.textLogs);
      if (data.predictedFertileWindow) {
        const predictedFertileWindow = DateRange.fromJSON(data.predictedFertileWindow);
        setPredictedFertileWindow(predictedFertileWindow);
      }
      if (data.predictedOvulationDay) setPredictedOvulationDay(data.predictedOvulationDay);
      if (data.predictedPeriods) {
        const predictedPeriods = DateRangeList.fromJSON(data.predictedPeriods);
        setPredictedPeriods(predictedPeriods);
      }
    })();
  }, []);  
  
  // Save state to storage whenever any part changes
  useEffect(() => {
    const data = { 
      weightLogs, 
      weightUnit,
      periodRanges,
      symptomLogs, 
      allSymptoms, 
      autoAddPeriodDays, 
      typicalPeriodLength, 
      showOvulation, 
      showFertileWindow, 
      themeName, 
      accentColor, 
      textLogs,
      predictedFertileWindow, 
      predictedOvulationDay,
      predictedPeriods
    };
    storage.save(data);
  }, [
    weightLogs, 
    weightUnit, 
    periodRanges, 
    symptomLogs, 
    allSymptoms, 
    autoAddPeriodDays, 
    typicalPeriodLength, 
    showOvulation, 
    showFertileWindow, 
    themeName, 
    accentColor,
    textLogs,
    predictedFertileWindow, 
    predictedOvulationDay,
    predictedPeriods
  ]);  
  
  // Compute predictions when a new period is logged
  React.useEffect(() => {    
    // Calculate fertility info based on the predicted period
    const { ovulationDay, fertileWindow } = CycleUtils.calculateFertileWindow(periodRanges);
    setPredictedOvulationDay(ovulationDay);
    setPredictedFertileWindow(fertileWindow);  

    // Compute all predicted periods for the next year
    const predictedPeriodsList = CycleUtils.getAllPredictedPeriods(periodRanges, typicalPeriodLength);
    setPredictedPeriods(predictedPeriodsList);
  }, [periodRanges, typicalPeriodLength]);
  
  return (
    <AppStateContext.Provider value={{
      weightLogs, setWeightLogs,
      weightUnit, setWeightUnit,
      periodRanges, setPeriodRanges,
      symptomLogs, setSymptomLogs,
      allSymptoms, setAllSymptoms,
      autoAddPeriodDays, setAutoAddPeriodDays,
      typicalPeriodLength, setTypicalPeriodLength,
      showOvulation, setShowOvulation,
      showFertileWindow, setShowFertileWindow,
      themeName, setThemeName,
      accentColor, setAccentColor,
      textLogs, setTextLogs,
      predictedFertileWindow, setPredictedFertileWindow,
      predictedOvulationDay, setPredictedOvulationDay,
      predictedPeriods, setPredictedPeriods,
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
