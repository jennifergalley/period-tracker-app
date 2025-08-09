import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { toDateKey } from '@/features/DateUtils';
import { CommonStyles } from '@/components/CommonStyles';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, Platform } from 'react-native';
import { moodEmojis, anxietyEmojis, depressionEmojis } from '@/features/Emojis';

const dateRanges = [
  { label: 'This Month', months: 1 },
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'Last Year', months: 12 },
];

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MoodTracker() {
  const { theme } = useTheme();
  const { moodLogs } = useAppState();
  const today = new Date();

  const [selectedRange, setSelectedRange] = useState(dateRanges[0]);
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);

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

  // Filter and sort mood logs in range
  const logEntries = Object.entries(moodLogs)
    .map(([date, entry]) => ({ date: new Date(date), ...entry }))
    .filter(entry => entry.date >= startDate && entry.date <= endDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Prepare chart data for each metric
  const chartWidth = Dimensions.get('window').width - 32;
  const chartHeight = Math.max(120, Math.round((Dimensions.get('window').height - 400) / 3));
  const getChartData = (field: 'mood' | 'anxiety' | 'depression') => {
    // Only include entries with values 1-5 for the selected field
    const filtered = logEntries.filter(entry => entry[field] && entry[field] >= 1 && entry[field] <= 5);
    return {
      labels: filtered.map((entry, idx) => {
        const d = entry.date;
        if (filtered.length < 6) {
          return `${d.getMonth() + 1}/${d.getDate()}`;
        } else {
          const N = Math.ceil(filtered.length / 5);
          return idx % N === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : '';
        }
      }),
      datasets: [
        {
          data: filtered.map(entry => entry[field]),
          color: () => field === 'mood' ? theme.accent : field === 'anxiety' ? theme.error : theme.period,
          strokeWidth: 2,
        },
      ],
      yLabels: field === 'mood' ? moodEmojis : field === 'anxiety' ? anxietyEmojis : depressionEmojis,
    };
  };

  return (
    <View style={[CommonStyles.container, { backgroundColor: theme.background }]}> 
      <Text style={[CommonStyles.heading, { color: theme.text }]}>Mood Tracker</Text>

      {/* --- Date Range Selection Row --- */}
      <View style={styles.rangeRow}>
        {dateRanges.map(range => (
          <TouchableOpacity key={range.label} onPress={() => { setSelectedRange(range); setCustomRange(null); }}>
            <Text
              style={[
                styles.rangeBtn,
                { color: theme.text },
                selectedRange.label === range.label && [
                  styles.rangeBtnSelected,
                  {
                    backgroundColor: theme.accent,
                    color: theme.fabText,
                  },
                ],
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Mood Line Chart --- */}
      {logEntries.length > 1 && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartLabel, { color: theme.text }]}>Mood</Text>
          <LineChart
            data={getChartData('mood')}
            width={chartWidth}
            height={chartHeight}
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              decimalPlaces: 0,
              color: () => theme.accent,
              labelColor: () => theme.text,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.accent,
              },
              propsForBackgroundLines: {
                stroke: theme.border,
              },
              formatYLabel: (y) => moodEmojis[Number(y)] || '',
            }}
            formatYLabel={(y) => moodEmojis[Number(y)] || ''}
            bezier
            style={{ borderRadius: 12, marginVertical: 8 }}
          />
        </View>
      )}
      {/* --- Anxiety Line Chart --- */}
      {logEntries.length > 1 && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartLabel, { color: theme.text }]}>Anxiety</Text>
          <LineChart
            data={getChartData('anxiety')}
            width={chartWidth}
            height={chartHeight}
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              decimalPlaces: 0,
              color: () => theme.error,
              labelColor: () => theme.text,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.error,
              },
              propsForBackgroundLines: {
                stroke: theme.border,
              },
              formatYLabel: (y) => anxietyEmojis[Number(y)] || '',
            }}
            formatYLabel={(y) => anxietyEmojis[Number(y)] || ''}
            bezier
            style={{ borderRadius: 12, marginVertical: 8 }}
          />
        </View>
      )}
      {/* --- Depression Line Chart --- */}
      {logEntries.length > 1 && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartLabel, { color: theme.text }]}>Depression</Text>
          <LineChart
            data={getChartData('depression')}
            width={chartWidth}
            height={chartHeight}
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              decimalPlaces: 0,
              color: () => theme.period,
              labelColor: () => theme.text,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.period,
              },
              propsForBackgroundLines: {
                stroke: theme.border,
              },
              formatYLabel: (y) => depressionEmojis[Number(y)] || '',
            }}
            formatYLabel={(y) => depressionEmojis[Number(y)] || ''}
            bezier
            style={{ borderRadius: 12, marginVertical: 8 }}
          />
        </View>
      )}
      {/* --- Mood Log List --- */}
      {/* <ScrollView>
        <Text style={[styles.logHeading, { color: theme.text }]}>Mood Log</Text>
        {logEntries.length === 0 && <Text style={[styles.noData, { color: theme.text }]}>No mood logs in this range.</Text>}
        {logEntries.slice().reverse().map(entry => (
          <View key={entry.date.toISOString()} style={styles.logItem}>
            <Text style={[styles.logDate, { color: theme.text }]}>{formatDate(entry.date)}</Text>
              {entry.mood != 0 && <Text style={[styles.logWeightBlue, { color: theme.text }]}>Mood: {moodEmojis[entry.mood] || ''}</Text>}
              {entry.anxiety != 0 && <Text style={[styles.logWeightBlue, { color: theme.text }]}>Anxiety: {anxietyEmojis[entry.anxiety] || ''}</Text>}
              {entry.depression != 0 && <Text style={[styles.logWeightBlue, { color: theme.text }]}>Depression: {depressionEmojis[entry.depression] || ''}</Text>}
          </View>
        ))}
      </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  rangeRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' },
  rangeBtn: { fontSize: 14, marginHorizontal: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  rangeBtnSelected: { fontWeight: 'bold' },
  chartContainer: { marginVertical: 8, alignItems: 'center' },
  chartLabel: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  logHeading: { fontWeight: 'bold', fontSize: 18, marginVertical: 10 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#23242a', paddingVertical: 10, paddingHorizontal: 4 },
  logDate: { fontSize: 15 },
  logWeightBlue: { fontSize: 15, fontWeight: 'bold' },
  noData: { textAlign: 'center', marginTop: 16 },
});
