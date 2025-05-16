import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/components/Theme';
import { useAppState } from '@/components/AppStateContext';
import { DEFAULT_SYMPTOMS } from '@/features/symptomUtils';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/features/dateUtils';
import { toDateKey } from '@/features/dateUtils';

export default function ActivityLog() {
  const { theme } = useTheme();
  const {
    periodRanges,
    predictedOvulationDay,
    predictedFertileWindow,
    symptomLogs,
    weightLogs,
    allSymptoms,
    textLogs
  } = useAppState();

  // Build a list of all days for the activity log (e.g., last 60 days)
  const days: Date[] = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // Set time to midnight
    d.setDate(d.getDate() - i);
    days.push(new Date(d));
  }

  // Create a dictionary of symptoms with their icons as values
  const symptomDict = (allSymptoms || DEFAULT_SYMPTOMS).reduce((acc, s) => {
    acc[s.name] = s.icon;
    return acc;
  }, {} as Record<string, string>);

  // Sort days descending (today first)
  const sortedDays = [...days].sort((a, b) => b.getTime() - a.getTime());

  return (
    // --- Activity Log Scrollable Container ---
    <ScrollView style={[styles.logContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]} contentContainerStyle={{ paddingBottom: 24 }}>
      
      {/* --- Activity Log Heading --- */}
      <Text style={[styles.logHeading, { color: theme.text }]}>Activity Log</Text>

      {/* --- No Data Message --- */}
      {sortedDays.every(date => {
        const dStr = toDateKey(date);
        const isPeriod = periodRanges.containsDate(date);
        const isOvulation = predictedOvulationDay && dStr === toDateKey(predictedOvulationDay);
        const isFertile = predictedFertileWindow && predictedFertileWindow.containsDate(date);
        const symptoms = symptomLogs[dStr] || [];
        return !isPeriod && !isOvulation && !isFertile && symptoms.length === 0;
      }) && (
        <Text style={[styles.noDataText, { color: theme.text }]}>No data entered yet</Text>
      )}

      {/* --- Activity Log Items (One per Day) --- */}
      {sortedDays.map(date => {
        const dStr = toDateKey(date);
        const isPeriod = periodRanges.containsDate(date);
        const isOvulation = predictedOvulationDay && dStr === toDateKey(predictedOvulationDay);
        const isFertile = predictedFertileWindow && predictedFertileWindow.containsDate(date);
        const symptoms = symptomLogs[dStr] || [];
        const weight = weightLogs[dStr];
        const textLog = textLogs ? textLogs[dStr] : undefined;
        if (!isPeriod && !isOvulation && !isFertile && symptoms.length === 0 && !weight && !textLog) return null;
        return (
          <View key={dStr} style={[styles.logItem, { borderColor: theme.card }]}> 
            {/* --- Date --- */}
            <Text style={[styles.logDate, { color: theme.text }]}>{formatDate(date)}</Text>

            {/* --- Badges for Period/Fertile/Ovulation/Predicted Period --- */}
            <View style={styles.logBadges}>
              {isPeriod && <Text style={[styles.periodBadge, { backgroundColor: theme.period, color: theme.text }]}>Period</Text>}
              {isFertile && <Text style={[styles.fertileBadge, { backgroundColor: theme.fertile, color: theme.background }]}>Fertile</Text>}
              {isOvulation && <Text style={[styles.ovulationBadge, { backgroundColor: theme.ovulation, color: theme.background }]}>Ovulation</Text>}
            </View>

            {/* --- Symptom List for the Day --- */}
            {symptoms.length > 0 && (
              <View style={styles.logSymptoms}>
                {symptoms.map(s => {
                  const icon = symptomDict[s] || symptomDict[s.trim()] || '📝';
                  return (
                    <Text key={s} style={[styles.logSymptom, { color: theme.text }]}> {icon} {s}</Text>
                  );
                })}
              </View>
            )}
            
            {/* --- Weight Log for the Day --- */}
            {weight && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name='barbell' color={theme.accent} size={24} style={{ marginRight: 4 }} />
                <Text style={[styles.logWeight, { color: theme.text, marginTop: 0 }]}>{weight.value} {weight.unit}</Text>
              </View>
            )}

            {/* --- Text Log for the Day --- */}
            {textLog && textLog.trim() !== '' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name='document-text-outline' color={theme.accent} size={24} style={{ marginRight: 4 }} />
                <Text style={[styles.logTextLog, { color: theme.text, marginTop: 0 }]}>{textLog}</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logContainer: { marginTop: 8 },
  logHeading: { fontWeight: 'bold', fontSize: 18, marginVertical: 10, marginLeft: 12 },
  logItem: { borderBottomWidth: 1, paddingVertical: 10, paddingHorizontal: 12 },
  logDate: { fontWeight: 'bold', fontSize: 15 },
  logBadges: { flexDirection: 'row', marginTop: 2 },
  periodBadge: { borderRadius: 8, paddingHorizontal: 8, marginRight: 6, fontSize: 12 },
  fertileBadge: { borderRadius: 8, paddingHorizontal: 8, marginRight: 6, fontSize: 12 },
  ovulationBadge: { borderRadius: 8, paddingHorizontal: 8, marginRight: 6, fontSize: 12 },
  logSymptoms: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  logSymptom: { marginRight: 10, fontSize: 14 },
  logWeight: { fontSize: 14, marginTop: 2 },
  logTextLog: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  noDataText: { marginTop: 10, textAlign: 'center' },
});
