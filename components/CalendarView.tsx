import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, Dimensions, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { getDaysInMonth, getFirstDayOfWeek, isToday, toDateKey } from '@/features/dateUtils';
import { handleDayPress } from '@/features/Handlers';
import DayView from '@/components/DayView';
import ActivityLog from '@/components/ActivityLog';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_CELL_WIDTH = Math.floor(SCREEN_WIDTH / 7) - 4;

export default function CalendarView() {
  const { theme, themeName } = useTheme();
  const {
    weightLogs, setWeightLogs,
    weightUnit,
    periodRanges, setPeriodRanges,
    symptomLogs, setSymptomLogs,
    allSymptoms, setAllSymptoms,
    autoAddPeriodDays,
    showOvulation,
    showFertileWindow,
    textLogs,
    setTextLogs,
    predictedPeriods,
    predictedFertileWindow,
    predictedOvulationDay
  } = useAppState();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Use predicted values from app state
  const ovulationDayToShow = showOvulation ? predictedOvulationDay : null;
  const fertileStartToShow = showFertileWindow ? predictedFertileWindow.start : null;
  const fertileEndToShow = showFertileWindow ? predictedFertileWindow.end : null;

  function getDayColor(date: Date) {
    const dStr = toDateKey(date);
    if (periodRanges.containsDate(date)) return theme.period;
    if (predictedPeriods && predictedPeriods.containsDate(date)) return 'transparent';
    if (
      ovulationDayToShow &&
      typeof ovulationDayToShow === 'object' &&      
      toDateKey(ovulationDayToShow) === dStr
    ) return theme.ovulation;
    if (fertileStartToShow && fertileEndToShow && date >= fertileStartToShow && date <= fertileEndToShow) return theme.fertile;
    return theme.card;
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
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);

  // PanResponder for swipe gestures on the calendar grid
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -40) {
          nextMonth();
        } else if (gestureState.dx > 40) {
          prevMonth();
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1, backgroundColor: '#181a20' }}>
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
        <View style={[styles.legend, { flexWrap: 'wrap' }]}> 
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.period }]} />
            <Text style={[styles.legendText, { color: theme.legendText }]}>Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: theme.period, borderWidth: 2, backgroundColor: 'transparent' }]} />
            <Text style={[styles.legendText, { color: theme.legendText }]}>Predicted Period</Text>
          </View>
          {showFertileWindow && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.fertile }]} />
              <Text style={[styles.legendText, { color: theme.legendText }]}>Fertile Window</Text>
            </View>
          )}
          {showOvulation && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.ovulation }]} />
              <Text style={[styles.legendText, { color: theme.legendText }]}>Ovulation</Text>
            </View>
          )}
        </View>
        {/* --- Weekday Row --- */}
        <View style={styles.weekRow}>
          {['Sun','Mon','Tues','Wed','Thu','Fri','Sat'].map((d, i) => (
            <View key={i} style={styles.weekDayCell}>
              <Text style={[styles.weekDay, { color: theme.text }]}>{d}</Text>
            </View>
          ))}
        </View>
        {/* --- Calendar Grid (Days) --- */}
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch' }}
          {...panResponder.panHandlers}
        >
          {days.map((item, i) => (
            <TouchableOpacity
              key={i}
              disabled={!item}
              onPress={() => item && handleDayPress(item, setSelectedDay, setDayModalVisible)}
            >
            <View style={[
                styles.dayCell,
                item && periodRanges.containsDate(item)
                  ? { backgroundColor: theme.period, borderColor: theme.period }
                  : item && predictedPeriods && predictedPeriods.containsDate(item)
                    ? { backgroundColor: 'transparent', borderColor: theme.period, borderWidth: 2 }
                    : { backgroundColor: item ? getDayColor(item) : 'transparent', borderColor: theme.border },
                item && isToday(item) && styles.todayCell,
                item && isToday(item) && { borderColor: theme.gold, shadowColor: theme.gold }
              ]}>
                {item && (symptomLogs[toDateKey(item)]?.length > 0) && (
                  <MaterialCommunityIcons name="note-outline" size={16} color={theme.gold} style={{ position: 'absolute', top: 4, right: 4 }} />
                )}
                <Text style={[
                  styles.dayText,
                  { color: theme.text },
                  item && isToday(item) ? [styles.todayText, { color: theme.gold }] : null
                ]}>{item ? item.getDate() : ''}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* --- Activity Log Below Calendar --- */}
        <View style={[styles.activityLog]}>          
          <ActivityLog />
        </View>
        {/* --- Day Modal (DayView) --- */}
        <Modal visible={dayModalVisible} transparent={false} animationType="slide" onRequestClose={() => setDayModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            {selectedDay && (
              <DayView
                date={selectedDay}
                isPeriod={periodRanges.containsDate(selectedDay)}
                isFertile={!!(fertileStartToShow && fertileEndToShow && selectedDay >= fertileStartToShow && selectedDay <= fertileEndToShow)}
                isOvulation={!!(ovulationDayToShow && toDateKey(selectedDay) === toDateKey(ovulationDayToShow))}
              />
            )}
            <Button title="Close" onPress={() => setDayModalVisible(false)} />
          </View>
        </Modal>
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
      </SafeAreaView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'stretch' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'center', marginTop: 0 },
  headerText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, textAlign: 'center' },
  navBtn: { fontSize: 20, padding: 8 },
  calendarGrid: { flexGrow: 1, alignSelf: 'stretch' },
  weekRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'stretch' },
  weekDayCell: { width: DAY_CELL_WIDTH, alignItems: 'center', justifyContent: 'center', margin: 2  },
  weekDay: { fontWeight: 'bold', textAlign: 'center' },
  activityLog: { flexGrow: 0, flexShrink: 1, minHeight: 0 },
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
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8, justifyContent: 'center', flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginRight: 6 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
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
