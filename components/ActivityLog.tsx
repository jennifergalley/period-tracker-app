import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from './Theme';
import { DEFAULT_SYMPTOMS } from '../features/symptoms/symptomUtils';

interface ActivityLogProps {
  days: Date[];
  periodDays: string[];
  ovulationDay: Date | null;
  fertileStart: Date | null;
  fertileEnd: Date | null;
  symptomLogs: { [date: string]: string[] };
  weightLogs: { [date: string]: { value: number; unit: 'kg' | 'lbs' } };
  allSymptoms?: { name: string; icon: string }[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ days, periodDays, ovulationDay, fertileStart, fertileEnd, symptomLogs, weightLogs, allSymptoms }) => {
  const { theme } = useTheme();
  const symptomDict = (allSymptoms || DEFAULT_SYMPTOMS).reduce((acc, s) => { acc[s.name] = s.icon; return acc; }, {} as Record<string, string>);
  // Sort days descending (today first)
  const sortedDays = [...days].sort((a, b) => b.getTime() - a.getTime());
  return (
    // --- Activity Log Scrollable Container ---
    <ScrollView style={[styles.logContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* --- Activity Log Heading --- */}
      <Text style={[styles.logHeading, { color: theme.text }]}>Activity Log</Text>
      {/* --- No Data Message --- */}
      {sortedDays.every(date => {
        const dStr = date.toDateString();
        const isPeriod = periodDays.includes(dStr);
        const isOvulation = ovulationDay && dStr === ovulationDay.toDateString();
        const isFertile = fertileStart && fertileEnd && date >= fertileStart && date <= fertileEnd;
        const symptoms = symptomLogs[dStr] || [];
        return !isPeriod && !isOvulation && !isFertile && symptoms.length === 0;
      }) && (
        <Text style={[styles.noDataText, { color: theme.text }]}>No data entered yet</Text>
      )}
      {/* --- Activity Log Items (One per Day) --- */}
      {sortedDays.map(date => {
        const dStr = date.toDateString();
        const isPeriod = periodDays.includes(dStr);
        const isOvulation = ovulationDay && dStr === ovulationDay.toDateString();
        const isFertile = fertileStart && fertileEnd && date >= fertileStart && date <= fertileEnd;
        const symptoms = symptomLogs[dStr] || [];
        const weight = weightLogs[dStr];
        // Only show days with data
        if (!isPeriod && !isOvulation && !isFertile && symptoms.length === 0 && !weight) return null;
        return (
          <View key={dStr} style={[styles.logItem, { borderColor: theme.card }]}>
            {/* --- Date --- */}
            <Text style={[styles.logDate, { color: theme.text }]}>{dStr}</Text>
            {/* --- Badges for Period/Fertile/Ovulation --- */}
            <View style={styles.logBadges}>
              {isPeriod && <Text style={[styles.periodBadge, { backgroundColor: theme.period, color: theme.text }]}>Period</Text>}
              {isFertile && <Text style={[styles.fertileBadge, { backgroundColor: theme.fertile, color: theme.background }]}>Fertile</Text>}
              {isOvulation && <Text style={[styles.ovulationBadge, { backgroundColor: theme.ovulation, color: theme.background }]}>Ovulation</Text>}
            </View>
            {/* --- Symptom List for the Day --- */}
            {symptoms.length > 0 && (
              <View style={styles.logSymptoms}>
                {symptoms.map(s => (
                  <Text key={s} style={[styles.logSymptom, { color: theme.text }]}> {symptomDict[s] || '📝'} {s}</Text>
                ))}
              </View>
            )}
            {/* --- Weight Log for the Day --- */}
            {weight && (
              <Text style={[styles.logWeight, { color: theme.text }]}>Weight: {weight.value} {weight.unit}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logContainer: { maxHeight: 300, marginTop: 8 },
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
  noDataText: { marginTop: 10, textAlign: 'center' },
});

export default ActivityLog;
