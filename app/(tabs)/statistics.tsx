import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { CommonStyles } from '@/components/CommonStyles';
import { SymptomUtils } from '@/features/SymptomUtils';

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.text }]}> 
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function StatisticsScreen() {
  const { userStats, symptomLogs, allSymptoms } = useAppState();
  const { theme } = useTheme();

  // Helper for colored min/max
  const highlight = (type: 'min' | 'max') => ({
    color: type === 'min' ? theme.accent : '#ff5c5c',
  });

  const mostFrequentSymptoms = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, allSymptoms, 10);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16, backgroundColor: theme.background }}>  
      <Text style={[CommonStyles.heading, { color: theme.text }]}>Your Cycle Statistics</Text>
      <StatCard title="Cycle Length">
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.text }]}>Average</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{userStats.averageCycleLength} days</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.text }]}>Min</Text>
          <Text style={[styles.statValue, highlight('min'), { color: theme.text }]}>{userStats.minCycleLength} days</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.text }]}>Max</Text>
          <Text style={[styles.statValue, highlight('max'), { color: theme.text }]}>{userStats.maxCycleLength} days</Text>
        </View>
      </StatCard>
      <StatCard title="Period Length">
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.text }]}>Average</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{userStats.averagePeriodLength} days</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.text }]}>Min</Text>
          <Text style={[styles.statValue, highlight('min'), { color: theme.text }]}>{userStats.minPeriodLength} days</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: theme.text }]}>Max</Text>
          <Text style={[styles.statValue, highlight('max'), { color: theme.text }]}>{userStats.maxPeriodLength} days</Text>
        </View>
      </StatCard>
      <StatCard title="Most Frequent Symptoms">
        {mostFrequentSymptoms.length === 0 ? (
          <Text style={{ color: theme.text, textAlign: 'center' }}>No symptoms logged yet.</Text>
        ) : (
          <View>
            {mostFrequentSymptoms.map(item => (
              <View style={styles.symptomRow} key={item.name}>
                <Text style={styles.symptomIcon}>{item.icon}</Text>
                <Text style={[styles.symptomName, { color: theme.text }]}>{item.name}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: Math.min(100, item.count * 20), backgroundColor: theme.accent }]} />
                </View>
                <Text style={[styles.symptomCount, { color: theme.text }]}>{item.count}</Text>
              </View>
            ))}
          </View>
        )}
      </StatCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 16,
    color: '#aaa',
  },
  statValue: {
    fontSize: 16,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  symptomIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  symptomName: {
    flex: 1,
    fontSize: 16,
  },
  barBg: {
    height: 10,
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  symptomCount: {
    fontSize: 14,
    marginLeft: 4,
    minWidth: 24,
    textAlign: 'right',
  },
});
