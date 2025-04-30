import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Button, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DayView from './DayView';
import ActivityLog from './ActivityLog';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAppState } from './AppStateContext';
import { startOfDay } from 'date-fns';
import { useTheme } from './Theme';
import { calculateCycleInfo } from '../features/period/cycleUtils';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of week (0=Sunday)
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_CELL_WIDTH = Math.floor(SCREEN_WIDTH / 7) - 4; // 4 for margin
const TODAY = startOfDay(new Date());

export const Calendar: React.FC = () => {
  const { theme, themeName } = useTheme();
  const {
    weightLogs, setWeightLogs,
    weightUnit, setWeightUnit,
    periodDays, setPeriodDays,
    symptomLogs, setSymptomLogs,
    allSymptoms, setAllSymptoms,
    autoAddPeriodDays, periodAutoLogLength,
    showOvulation, showFertileWindow,
  } = useAppState(); // allSymptoms: Symptom[]

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Use utility function for cycle info
  const { ovulationDay, fertileStart, fertileEnd, periodStart } = calculateCycleInfo(periodDays);
  // Conditionally use ovulation/fertile window based on settings
  const ovulationDayToShow = showOvulation ? ovulationDay : null;
  const fertileStartToShow = showFertileWindow ? fertileStart : null;
  const fertileEndToShow = showFertileWindow ? fertileEnd : null;

  function getDayColor(date: Date) {
    const dStr = date.toDateString();
    if (periodDays.includes(dStr)) return theme.period;
    if (ovulationDayToShow && dStr === ovulationDayToShow.toDateString()) return theme.ovulation;
    if (fertileStartToShow && fertileEndToShow && date >= fertileStartToShow && date <= fertileEndToShow) return theme.fertile;
    return theme.card;
  }

  // Toggle period day
  function togglePeriodDay(date: Date) {
    const dStr = date.toDateString();
    const month = date.getMonth();
    const year = date.getFullYear();
    const periodDaysThisMonth = periodDays.filter(d => {
      const dObj = new Date(d);
      return dObj.getMonth() === month && dObj.getFullYear() === year;
    });
    if (!periodDays.includes(dStr)) {
      if (autoAddPeriodDays && periodDaysThisMonth.length === 0) {
        const newDays = Array.from({ length: periodAutoLogLength }, (_, i) => {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + i);
          return newDate.toDateString();
        });
        setPeriodDays(prev => [...prev, ...newDays]
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        );
      } else {
        setPeriodDays(prev => [...prev, dStr]
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        );
      }
    } else {
      setPeriodDays(prev => prev.filter(d => d !== dStr));
    }
  }

  // Navigation
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Build calendar grid
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  // Build all days for log (e.g., last 60 days)
  const logDays: Date[] = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    logDays.push(new Date(d));
  }

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);

  function handleDayPress(date: Date) {
    setSelectedDay(date);
    setDayModalVisible(true);
  }

  // Toggle symptom for a day
  function toggleSymptom(date: Date, symptom: string) {
    const dStr = date.toDateString();
    setSymptomLogs(prev => {
      const current = prev[dStr] || [];
      if (current.includes(symptom)) {
        // Remove symptom
        return { ...prev, [dStr]: current.filter(s => s !== symptom) };
      } else {
        // Add symptom
        return { ...prev, [dStr]: [...current, symptom] };
      }
    });
  }

  // Helper to get period days in the same month as a given date
  function getPeriodDaysThisMonth(periodDays: string[], date: Date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    return periodDays.filter(d => {
      const dObj = new Date(d);
      return dObj.getMonth() === month && dObj.getFullYear() === year;
    });
  }

  // When adding a symptom, add {name, icon} to allSymptoms if not present
  // When removing, remove from allSymptoms and all symptomLogs
  function handleAddSymptom(symptomName: string) {
    setAllSymptoms((prev: { name: string; icon: string }[]) => prev.some((s: { name: string; icon: string }) => s.name === symptomName)
      ? prev
      : [...prev, { name: symptomName, icon: '📝' }]);
  }
  function handleRemoveSymptom(symptomName: string) {
    setAllSymptoms((prev: { name: string; icon: string }[]) => prev.filter((s: { name: string; icon: string }) => s.name !== symptomName));
    setSymptomLogs((prev: { [date: string]: string[] }) => {
      const updated: { [date: string]: string[] } = {};
      for (const date in prev) {
        const filtered = prev[date].filter((s: string) => s !== symptomName);
        if (filtered.length > 0) {
          updated[date] = filtered;
        }
      }
      return updated;
    });
  }

  // Helper to check if a date is today
  function isToday(date: Date) {
    const d = startOfDay(date);
    return d.getTime() === TODAY.getTime();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#181a20' }}>
      {/* --- Calendar Month View UI --- */}
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right', 'bottom']}>
        {/* --- Calendar Header (Month/Year, Navigation) --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth}><Text style={[styles.navBtn, { color: theme.text }]}>{'<'}</Text></TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>
            {new Date(year, month, 1).toLocaleString('default', { month: 'long' })} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth}><Text style={[styles.navBtn, { color: theme.text }]}>{'>'}</Text></TouchableOpacity>
        </View>
        {/* --- Calendar Legend --- */}
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: theme.period }]} />
          <Text style={[styles.legendText, { color: theme.legendText }]}>Period</Text>
          {showFertileWindow && (
            <>
              <View style={[styles.legendDot, { backgroundColor: theme.fertile }]} />
              <Text style={[styles.legendText, { color: theme.legendText }]}>Fertile Window</Text>
            </>
          )}
          {showOvulation && (
            <>
              <View style={[styles.legendDot, { backgroundColor: theme.ovulation }]} />
              <Text style={[styles.legendText, { color: theme.legendText }]}>Ovulation</Text>
            </>
          )}
        </View>
        {/* --- Weekday Row --- */}
        <View style={styles.weekRow}>
          {['S','M','T','W','T','F','S'].map((d, i) => <Text key={i} style={[styles.weekDay, { color: theme.text }]}>{d}</Text>)}
        </View>
        {/* --- Calendar Grid (Days) --- */}
        <FlatList
          style={{ flex: 1, alignSelf: 'stretch' }}
          contentContainerStyle={{ flexGrow: 1, alignSelf: 'stretch' }}
          data={days}
          numColumns={7}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={!item}
              onPress={() => item && handleDayPress(item)}
            >
              <View style={[
                styles.dayCell,
                { backgroundColor: item ? getDayColor(item) : 'transparent', borderColor: theme.border },
                item && isToday(item) ? [styles.todayCell, { borderColor: theme.gold, backgroundColor: theme.card, shadowColor: theme.gold }] : null
              ]}>
                {item && (symptomLogs[item.toDateString()]?.length > 0) && (
                  <MaterialCommunityIcons name="note-outline" size={16} color={theme.gold} style={{ position: 'absolute', top: 4, right: 4 }} />
                )}
                <Text style={[
                  styles.dayText,
                  { color: theme.text },
                  item && isToday(item) ? [styles.todayText, { color: theme.gold }] : null
                ]}>{item ? item.getDate() : ''}</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
        {/* --- Day Modal (DayView) --- */}
        <Modal visible={dayModalVisible} transparent={false} animationType="slide" onRequestClose={() => setDayModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            {selectedDay && (
              <DayView
                date={selectedDay}
                isPeriod={periodDays.includes(selectedDay.toDateString())}
                isFertile={!!(fertileStartToShow && fertileEndToShow && selectedDay >= fertileStartToShow && selectedDay <= fertileEndToShow)}
                isOvulation={!!(ovulationDayToShow && selectedDay.toDateString() === ovulationDayToShow.toDateString())}
                onTogglePeriod={togglePeriodDay}
                symptoms={symptomLogs[selectedDay.toDateString()] || []}
                onToggleSymptom={toggleSymptom}
                symptomList={allSymptoms}
                onAddSymptom={handleAddSymptom}
                onRemoveSymptom={handleRemoveSymptom}
                periodDaysThisMonth={getPeriodDaysThisMonth(periodDays, selectedDay)}
                weightLog={weightLogs[selectedDay.toDateString()]}
                onLogWeight={(value: number, unit: 'kg' | 'lbs') => {
                  setWeightLogs(prev => ({ ...prev, [selectedDay.toDateString()]: { value, unit } }));
                }}
                weightUnit={weightUnit}
                onToggleWeightUnit={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
              />
            )}
            <Button title="Close" onPress={() => setDayModalVisible(false)} />
          </View>
        </Modal>
      </SafeAreaView>
      {/* --- Activity Log Below Calendar --- */}
      <ActivityLog
        days={logDays}
        periodDays={periodDays}
        ovulationDay={ovulationDayToShow}
        fertileStart={fertileStartToShow}
        fertileEnd={fertileEndToShow}
        symptomLogs={symptomLogs}
        weightLogs={weightLogs}
      />
      {/* --- Floating Action Button for Today --- */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
        onPress={() => {
          setSelectedDay(today);
          setDayModalVisible(true);
        }}
        accessibilityLabel="Open today in Day View"
      >
        <Text style={[styles.fabText, { color: theme.fabText }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'stretch' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center', marginTop: 0 },
  headerText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, textAlign: 'center' },
  navBtn: { fontSize: 20, padding: 8 },
  weekRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'stretch' },
  weekDay: { width: DAY_CELL_WIDTH, textAlign: 'center', fontWeight: 'bold' },
  dayCell: { width: DAY_CELL_WIDTH, height: DAY_CELL_WIDTH, margin: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1 },
  dayText: { fontWeight: 'bold' },
  todayCell: {
    borderWidth: 2,
    backgroundColor: undefined,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  todayText: {
    fontWeight: 'bold',
  },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8, justifyContent: 'center' },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginHorizontal: 6 },
  legendText: { marginRight: 16, fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 20, borderRadius: 10, width: 300, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 5, padding: 8, marginTop: 8, width: 200, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
  },
});

export default Calendar;
