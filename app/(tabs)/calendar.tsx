import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DayView from '@/components/DayView';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { toDateKey } from '@/features/dateUtils';
import CalendarView from '@/components/CalendarView';
import { Modal, Button, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ActivityLog from '@/components/ActivityLog';

export default function Calendar() {
  const { theme, themeName } = useTheme();
  const {
    periodRanges,
    showOvulation,
    showFertileWindow,
    predictedFertileWindow,
    predictedOvulationDay
  } = useAppState();

  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);

  // Use predicted values from app state
  const ovulationDayToShow = showOvulation ? predictedOvulationDay : null;
  const fertileStartToShow = showFertileWindow ? predictedFertileWindow.start : null;
  const fertileEndToShow = showFertileWindow ? predictedFertileWindow.end : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#181a20' }}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
    
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['left', 'right', 'bottom']}>
        
      {/* --- Calendar View --- */}
      <CalendarView
        setSelectedDay={setSelectedDay}
        setDayModalVisible={setDayModalVisible}
      />

      {/* --- Activity Log Below Calendar --- */}
      <View style={[styles.activityLog]}>
        <ActivityLog />
      </View>
      
      {/* --- Day Modal --- */}
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
  activityLog: { flexGrow: 0, flexShrink: 1, minHeight: 0, marginTop: 0, paddingTop: 0 },
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
