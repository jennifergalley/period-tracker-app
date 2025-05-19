import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DayView from '@/components/DayView';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { toDateKey } from '@/features/DateUtils';
import CalendarView from '@/components/CalendarView';
import { Modal, Button, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import ActivityLog from '@/components/ActivityLog';
import { CommonStyles } from '@/components/CommonStyles';

export default function Calendar() {
  const { theme } = useTheme();
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
  const [activityLogModalVisible, setActivityLogModalVisible] = useState(false);

  // Track where DayView was opened from
  const [openedFrom, setOpenedFrom] = useState<'ActivityLogModal' | 'CalendarView'>('CalendarView');

  // Use predicted values from app state
  const ovulationDayToShow = showOvulation ? predictedOvulationDay : null;
  const fertileStartToShow = showFertileWindow ? predictedFertileWindow.start : null;
  const fertileEndToShow = showFertileWindow ? predictedFertileWindow.end : null;

  return (
    <View style={[CommonStyles.container, { backgroundColor: theme.background }]}> 
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['left', 'right', 'bottom']}>
        
      {/* --- Calendar View --- */}
      <CalendarView
        setSelectedDay={setSelectedDay}
        setDayModalVisible={setDayModalVisible}
      />

      {/* --- Activity Log Below Calendar --- */}
      <View style={[styles.activityLog]}>
        <ActivityLog 
          onDayPress={date => {
            setSelectedDay(date);
            setDayModalVisible(true);
            setOpenedFrom('CalendarView');
          }}
          onHeadingPress={() => setActivityLogModalVisible(true)}
        />
      </View>
      
      {/* --- Day Modal --- */}
      <Modal visible={dayModalVisible} transparent={false} animationType="none" onRequestClose={() => {
        setDayModalVisible(false);
        if (openedFrom === 'ActivityLogModal') setActivityLogModalVisible(true);
      }}>
        <View style={{ flex: 1, backgroundColor: theme.card }}>
          {selectedDay && (
            <DayView
              date={selectedDay}
              isPeriod={periodRanges.containsDate(selectedDay)}
              isFertile={!!(fertileStartToShow && fertileEndToShow && selectedDay >= fertileStartToShow && selectedDay <= fertileEndToShow)}
              isOvulation={!!(ovulationDayToShow && toDateKey(selectedDay) === toDateKey(ovulationDayToShow))}
            />
          )}
          <TouchableOpacity
            style={{ backgroundColor: theme.card, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 16, alignSelf: 'stretch', marginHorizontal: 24 }}
            onPress={() => {
              setDayModalVisible(false);
              if (openedFrom === 'ActivityLogModal') setActivityLogModalVisible(true);
            }}
          >
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>      

      {/* --- Activity Log Modal --- */}
      <Modal visible={activityLogModalVisible} transparent={false} animationType="none" onRequestClose={() => {
        setActivityLogModalVisible(false);
        setOpenedFrom('CalendarView');
      }}>
        <View style={{ flex: 1, backgroundColor: theme.card }}>
          <ActivityLog 
            onDayPress={date => {
              setSelectedDay(date);
              setDayModalVisible(true);
              setActivityLogModalVisible(false);
              setOpenedFrom('ActivityLogModal');
            }}
            onHeadingPress={() => {}}
          />
          <TouchableOpacity
            style={{ backgroundColor: theme.card, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 16, alignSelf: 'stretch', marginHorizontal: 24 }}
            onPress={() => {
              setActivityLogModalVisible(false);
              setOpenedFrom('CalendarView');
            }}
          >
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>

      {/* --- Floating Action Button for Today --- */}
      <TouchableOpacity
        style={[CommonStyles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
        onPress={() => {
          setSelectedDay(today);
          setDayModalVisible(true);
        }}
        accessibilityLabel="Open today in Day View"
      >
        <Text style={[CommonStyles.fabText, { color: theme.fabText }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  activityLog: { flexGrow: 0, flexShrink: 1, minHeight: 0, marginTop: 0, paddingTop: 0 },
});
