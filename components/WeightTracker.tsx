import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';
import { format, subMonths } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppState } from './AppStateContext';
import { filterAndSortWeightLogs, prepareWeightChartData, addOrUpdateWeightLog, deleteWeightLog } from '../features/weight/weightUtils';
import { useTheme } from './theme';

const chartConfig = {
  propsForDots: { r: '4', strokeWidth: '2' },
};

const dateRanges = [
  { label: 'This Month', months: 1 },
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'Last Year', months: 12 },
];

const WeightTracker: React.FC = () => {
  const { theme } = useTheme();
  const { weightLogs, setWeightLogs, weightUnit, setWeightUnit } = useAppState();
  const [selectedRange, setSelectedRange] = useState(dateRanges[0]);
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const today = new Date();
  const [weightInput, setWeightInput] = useState('');
  const [logDate, setLogDate] = useState<Date>(today);
  const [originalLogDate, setOriginalLogDate] = useState<Date | null>(null); // Track original date for editing
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const startDate = customRange
    ? customRange.start
    : selectedRange.label === 'This Month'
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : subMonths(today, selectedRange.months - 1);
  const endDate = customRange ? customRange.end : today;

  // Filter and sort weight logs in range
  const logEntries = filterAndSortWeightLogs(weightLogs, startDate, endDate)
    .filter(entry => Number.isFinite(entry.value)); // Filter out invalid values

  // Prepare chart data with fallback if empty
  const chartData = logEntries.length > 0
    ? prepareWeightChartData(logEntries)
    : {
        labels: ['No Data'],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(77, 184, 255, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

  // Remove weight entry row from top, add Log Weight button
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.heading, { color: theme.text }]}>Weight Tracker</Text>
      <Modal visible={showWeightModal} transparent animationType="slide" onRequestClose={() => setShowWeightModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowWeightModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalHeading, { color: theme.text }]}>Log Weight</Text>
            {showDatePicker && (
              <DateTimePicker
                value={logDate}
                mode="date"
                display={Platform.OS === 'android' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setLogDate(date);
                }}
              />
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <TextInput
                style={[
                  styles.weightInput,
                  {
                    width: 90,
                    height: 40,
                    fontSize: 18,
                    fontWeight: 'bold',
                    borderWidth: 2,
                    borderColor: theme.border,
                    color: theme.inputText,
                    backgroundColor: theme.inputBg,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    borderRadius: 10,
                  },
                ]}
                placeholder={weightUnit}
                placeholderTextColor={theme.legendText}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity
                style={[styles.dateBtn, { marginLeft: 12, backgroundColor: theme.accent }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateBtnText, { color: theme.fabText }]}>{format(logDate, 'MMM d, yyyy')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              {weightLogs[logDate.toDateString()] && (
                <TouchableOpacity
                  style={[styles.weightSaveBtn, { backgroundColor: theme.error, marginRight: 12 }]}
                  onPress={() => {
                    // Show confirmation before deleting
                    Alert.alert(
                      'Delete Weight Log',
                      `Are you sure you want to delete the entry for ${format(logDate, 'MMM d, yyyy')}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete', style: 'destructive', onPress: () => {
                            setWeightLogs((prev: any) => deleteWeightLog(prev, logDate));
                            setShowWeightModal(false);
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={[styles.weightSaveBtnText, { color: theme.text }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.weightSaveBtn, { backgroundColor: theme.border, marginRight: 12 }]}
                onPress={() => setShowWeightModal(false)}
              >
                <Text style={[styles.weightSaveBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.weightSaveBtn, { backgroundColor: theme.accent }]}
                onPress={() => {
                  const val = parseFloat(weightInput);
                  if (!isNaN(val)) {
                    setWeightLogs((prev: any) => addOrUpdateWeightLog(prev, logDate, val, weightUnit, originalLogDate));
                    setShowWeightModal(false);
                  }
                }}
              >
                <Text style={[styles.weightSaveBtnText, { color: theme.fabText }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={styles.rangeRow}>
        {dateRanges.map(range => (
          <TouchableOpacity key={range.label} onPress={() => { setSelectedRange(range); setCustomRange(null); }}>
            <Text
              style={[
                styles.rangeBtn,
                selectedRange.label === range.label && [
                  styles.rangeBtnSelected,
                  {
                    backgroundColor: theme.accent,
                    color: theme.background, // Use background color for high contrast
                  },
                ],
                { color: theme.legendText },
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            ...chartConfig,
            backgroundGradientFrom: theme.background,
            backgroundGradientTo: theme.background,
            color: (opacity = 1) => theme.accent,
            labelColor: () => theme.text,
            propsForDots: { r: '4', strokeWidth: '2', stroke: theme.accent },
          }}
          bezier
          style={{ ...styles.chart, borderRadius: 12 }}
        />
        <Text style={[styles.logHeading, { color: theme.text }]}>Weight Log</Text>
        {logEntries.length === 0 && <Text style={[styles.noData, { color: theme.legendText }]}>No weight logs in this range.</Text>}
        {logEntries.slice().reverse().map(entry => (
          <TouchableOpacity
            key={entry.date.toISOString()}
            style={styles.logItem}
            onPress={() => {
              setLogDate(entry.date);
              setOriginalLogDate(entry.date); // Save original date
              setWeightInput(String(entry.value));
              setShowWeightModal(true);
            }}
          >
            <Text style={[styles.logDate, { color: theme.text }]}>{format(entry.date, 'MMM d, yyyy')}</Text>
            <Text style={[styles.logWeightBlue, { color: theme.accent }]}>{entry.value} {entry.unit}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.fabBg, shadowColor: theme.fabBg }]}
        onPress={() => {
          setLogDate(today);
          setOriginalLogDate(null); // New entry
          setWeightInput('');
          setShowWeightModal(true);
        }}
        accessibilityLabel="Add weight log"
      >
        <Text style={[styles.fabText, { color: theme.fabText }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, alignSelf: 'center' },
  rangeRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' },
  rangeBtn: { fontSize: 14, marginHorizontal: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  rangeBtnSelected: { fontWeight: 'bold' },
  chart: { marginVertical: 8 },
  logHeading: { fontWeight: 'bold', fontSize: 18, marginVertical: 10 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#23242a', paddingVertical: 10, paddingHorizontal: 4 },
  logDate: { fontSize: 15 },
  logWeight: { fontSize: 15, fontWeight: 'bold' },
  logWeightBlue: { fontSize: 15, fontWeight: 'bold' },
  noData: { textAlign: 'center', marginTop: 16 },
  weightLogRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  weightInput: { flex: 1, borderRadius: 8, padding: 10, marginRight: 8 },
  weightUnitBtn: { borderRadius: 8, padding: 10, marginRight: 8 },
  weightUnitBtnText: { fontWeight: 'bold' },
  dateBtn: { borderRadius: 8, padding: 10, marginRight: 8 },
  dateBtnText: { fontWeight: 'bold' },
  weightSaveBtn: { borderRadius: 8, padding: 10 },
  weightSaveBtnText: { fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', borderRadius: 8, padding: 16 },
  modalHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  logWeightBtn: { borderRadius: 8, padding: 10, marginBottom: 16 },
  logWeightBtnText: { fontWeight: 'bold', textAlign: 'center' },
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

export default WeightTracker;
