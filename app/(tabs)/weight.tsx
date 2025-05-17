import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useAppState } from '@/components/AppStateContext';
import { filterAndSortWeightLogs, addOrUpdateWeightLog, deleteWeightLog } from '@/features/weightUtils';
import { useTheme } from '@/components/Theme';
import { toDateKey } from '@/features/dateUtils';
import { CommonStyles } from '@/components/CommonStyles';

const dateRanges = [
  { label: 'This Month', months: 1 },
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'Last Year', months: 12 },
];

// Native date formatting utility
function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function WeightTracker() {
  const { theme } = useTheme();
  const { weightLogs, setWeightLogs, weightUnit } = useAppState();
  const [selectedRange, setSelectedRange] = useState(dateRanges[0]);
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const today = new Date();
  const [weightInput, setWeightInput] = useState('');
  const [logDate, setLogDate] = useState<Date>(today);
  const [originalLogDate, setOriginalLogDate] = useState<Date | null>(null); // Track original date for editing
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Calculate startDate and endDate for filtering logs
  const startDate = customRange
    ? customRange.start
    : selectedRange.label === 'This Month'
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : (() => {
          const d = new Date(today);
          d.setMonth(d.getMonth() - (selectedRange.months - 1));
          d.setDate(1);
          return d;
        })();
  const endDate = customRange ? customRange.end : today;

  // Filter and sort weight logs in range
  const logEntries = filterAndSortWeightLogs(weightLogs, startDate, endDate)
    .filter(entry => Number.isFinite(entry.value)); // Filter out invalid values

  // Remove weight entry row from top, add Log Weight button
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[CommonStyles.heading, { color: theme.text }]}>Weight Tracker</Text>

      {/* --- Log Weight Modal --- */}
      <Modal visible={showWeightModal} transparent animationType="slide" onRequestClose={() => setShowWeightModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowWeightModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalHeading, { color: theme.text }]}>Log Weight</Text>
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
                onPress={() => {/* Date picker removed for web/native simplicity */}}
                disabled
              >
                <Text style={[styles.dateBtnText, { color: theme.fabText }]}>{formatDate(logDate)}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              {weightLogs[toDateKey(logDate)] && (
                <TouchableOpacity
                  style={[styles.weightSaveBtn, { backgroundColor: theme.error, marginRight: 12 }]}
                  onPress={() => {
                    // Show confirmation before deleting
                    Alert.alert(
                      'Delete Weight Log',
                      `Are you sure you want to delete the entry for ${formatDate(logDate)}?`,
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
      {/* --- Date Range Selection Row --- */}
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
                    color: theme.text,
                  },
                ],
                { color: theme.text },
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* --- Weight Log List --- */}
      <ScrollView>
        <Text style={[styles.logHeading, { color: theme.text }]}>Weight Log</Text>
        {logEntries.length === 0 && <Text style={[styles.noData, { color: theme.text }]}>No weight logs in this range.</Text>}
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
            <Text style={[styles.logDate, { color: theme.text }]}>{formatDate(entry.date)}</Text>
            <Text style={[styles.logWeightBlue, { color: theme.accent }]}>{entry.value} {entry.unit}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* --- Floating Action Button to Add Weight Log --- */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
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
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
