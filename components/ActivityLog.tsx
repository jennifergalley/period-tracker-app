import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SYMPTOM_EMOJIS: { [symptom: string]: string } = {
  'Cramps': '💢',
  'Headache': '🤕',
  'Hunger': '🍔',
  'Fatigue': '😴',
  'Bloating': '💨',
  'Brain Fog': '🧠',
  'Back Pain': '💥',
  'Mood Swings': '😡',
  'Acne': '🧴',
  'Tender Breasts': '🤲',
};

interface ActivityLogProps {
  days: Date[];
  periodDays: string[];
  ovulationDay: Date | null;
  fertileStart: Date | null;
  fertileEnd: Date | null;
  symptomLogs: { [date: string]: string[] };
  weightLogs: { [date: string]: { value: number; unit: 'kg' | 'lbs' } };
}

const ActivityLog: React.FC<ActivityLogProps> = ({ days, periodDays, ovulationDay, fertileStart, fertileEnd, symptomLogs, weightLogs }) => {
  // Sort days descending (today first)
  const sortedDays = [...days].sort((a, b) => b.getTime() - a.getTime());
  return (
    <ScrollView style={styles.logContainer} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.logHeading}>Activity Log</Text>
      {sortedDays.every(date => {
        const dStr = date.toDateString();
        const isPeriod = periodDays.includes(dStr);
        const isOvulation = ovulationDay && dStr === ovulationDay.toDateString();
        const isFertile = fertileStart && fertileEnd && date >= fertileStart && date <= fertileEnd;
        const symptoms = symptomLogs[dStr] || [];
        return !isPeriod && !isOvulation && !isFertile && symptoms.length === 0;
      }) && (
        <Text style={styles.noDataText}>No data entered yet</Text>
      )}
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
          <View key={dStr} style={styles.logItem}>
            <Text style={styles.logDate}>{dStr}</Text>
            <View style={styles.logBadges}>
              {isPeriod && <Text style={styles.periodBadge}>Period</Text>}
              {isFertile && <Text style={styles.fertileBadge}>Fertile</Text>}
              {isOvulation && <Text style={styles.ovulationBadge}>Ovulation</Text>}
            </View>
            {symptoms.length > 0 && (
              <View style={styles.logSymptoms}>
                {symptoms.map(s => (
                  <Text key={s} style={styles.logSymptom}>{SYMPTOM_EMOJIS[s] || '📝'} {s}</Text>
                ))}
              </View>
            )}
            {weight && (
              <Text style={styles.logWeight}>Weight: {weight.value} {weight.unit}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logContainer: { maxHeight: 300, marginTop: 8, backgroundColor: '#181a20', borderTopWidth: 1, borderColor: '#333' },
  logHeading: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginVertical: 10, marginLeft: 12 },
  logItem: { borderBottomWidth: 1, borderColor: '#23242a', paddingVertical: 10, paddingHorizontal: 12 },
  logDate: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logBadges: { flexDirection: 'row', marginTop: 2 },
  periodBadge: { backgroundColor: '#ff5c8a', color: '#fff', borderRadius: 8, paddingHorizontal: 8, marginRight: 6, fontSize: 12 },
  fertileBadge: { backgroundColor: '#4db8ff', color: '#181a20', borderRadius: 8, paddingHorizontal: 8, marginRight: 6, fontSize: 12 },
  ovulationBadge: { backgroundColor: '#ffb6c1', color: '#181a20', borderRadius: 8, paddingHorizontal: 8, marginRight: 6, fontSize: 12 },
  logSymptoms: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  logSymptom: { color: '#fff', marginRight: 10, fontSize: 14 },
  logWeight: { color: '#fff', fontSize: 14, marginTop: 2 },
  noDataText: { color: '#fff', marginTop: 10, textAlign: 'center' },
});

export default ActivityLog;
