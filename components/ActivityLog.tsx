import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/components/Theme';
import { DEFAULT_SYMPTOMS } from '@/features/symptomUtils';
import { Ionicons } from '@expo/vector-icons';

type ActivityLogProps = {
  days: Date[];
  periodDays: string[];
  ovulationDay: Date | null;
  fertileStart: Date | null;
  fertileEnd: Date | null;
  symptomLogs: { [date: string]: string[] };
  weightLogs: { [date: string]: { value: number; unit: 'kg' | 'lbs' } };
  allSymptoms?: { name: string; icon: string }[];
  textLogs?: { [date: string]: string };
}

export default function ActivityLog (props: ActivityLogProps) {
  const { theme } = useTheme();
  const symptomDict = (props.allSymptoms || DEFAULT_SYMPTOMS).reduce((acc, s) => { acc[s.name] = s.icon; return acc; }, {} as Record<string, string>);
  
  // Sort days descending (today first)
  const sortedDays = [...props.days].sort((a, b) => b.getTime() - a.getTime());
  
  return (
    // --- Activity Log Scrollable Container ---
    <ScrollView style={[styles.logContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* --- Activity Log Heading --- */}
      <Text style={[styles.logHeading, { color: theme.text }]}>Activity Log</Text>

      {/* --- No Data Message --- */}
      {sortedDays.every(date => {
        const dStr = date.toDateString();
        const isPeriod = props.periodDays.includes(dStr);
        const isOvulation = props.ovulationDay && dStr === props.ovulationDay.toDateString();
        const isFertile = props.fertileStart && props.fertileEnd && date >= props.fertileStart && date <= props.fertileEnd;
        const symptoms = props.symptomLogs[dStr] || [];
        return !isPeriod && !isOvulation && !isFertile && symptoms.length === 0;
      }) && (
        <Text style={[styles.noDataText, { color: theme.text }]}>No data entered yet</Text>
      )}

      {/* --- Activity Log Items (One per Day) --- */}
      {sortedDays.map(date => {
        const dStr = date.toDateString();
        const isPeriod = props.periodDays.includes(dStr);
        const isOvulation = props.ovulationDay && dStr === props.ovulationDay.toDateString();
        const isFertile = props.fertileStart && props.fertileEnd && date >= props.fertileStart && date <= props.fertileEnd;
        const symptoms = props.symptomLogs[dStr] || [];
        const weight = props.weightLogs[dStr];
        const textLog = props.textLogs ? props.textLogs[dStr] : undefined;
        // Only show days with data
        if (!isPeriod && !isOvulation && !isFertile && symptoms.length === 0 && !weight && !textLog) return null;
        
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
  logTextLog: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  noDataText: { marginTop: 10, textAlign: 'center' },
});
