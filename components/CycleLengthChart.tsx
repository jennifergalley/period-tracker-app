/**
 * CycleLengthChart component displays a horizontal scrollable bar chart
 * showing the length of each past cycle with clear day labels.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/components/Theme';
import { useAppState } from '@/components/AppStateContext';
import { DateRangeList } from '@/features/DateRangeList';

interface CycleData {
  cycleNumber: number;
  length: number;
  startDate: Date | null;
}

/**
 * Extracts cycle data from period ranges and cycle lengths.
 * Returns an array of cycle data with cycle number, length, and start date.
 */
function getCycleDataFromRanges(
  periodRanges: DateRangeList,
  cycleLengths: number[]
): CycleData[] {
  // Sort ranges by start date
  const sortedRanges = (periodRanges.ranges || []).slice().sort((a, b) => {
    if (!a.start || !b.start) return 0;
    return a.start.getTime() - b.start.getTime();
  });

  // Each cycle length corresponds to the gap between period i and period i+1
  // So cycle 1 starts at period 0, cycle 2 starts at period 1, etc.
  const cycleData: CycleData[] = [];
  
  for (let i = 0; i < cycleLengths.length; i++) {
    cycleData.push({
      cycleNumber: i + 1,
      length: cycleLengths[i],
      startDate: sortedRanges[i]?.start || null,
    });
  }

  return cycleData;
}

/**
 * Formats a date as a short month/year label (e.g., "Jan '24")
 */
function formatShortDate(date: Date | null): string {
  if (!date) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${month} '${year}`;
}

interface CycleLengthChartProps {
  maxBarHeight?: number;
}

export default function CycleLengthChart({ maxBarHeight = 120 }: CycleLengthChartProps) {
  const { theme } = useTheme();
  const { userStats, periodRanges } = useAppState();
  const { cycleLengths, averageCycleLength } = userStats;

  // Get cycle data with dates
  const cycleData = getCycleDataFromRanges(periodRanges, cycleLengths);

  if (cycleData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          Log at least two periods to see your cycle history.
        </Text>
      </View>
    );
  }

  // Calculate bar heights relative to max cycle length
  const maxLength = Math.max(...cycleLengths, averageCycleLength);
  const minLength = Math.min(...cycleLengths);

  return (
    <View style={styles.container}>
      {/* Average line indicator */}
      <View style={styles.averageContainer}>
        <Text style={[styles.averageLabel, { color: theme.legendText }]}>
          Average: {averageCycleLength} days
        </Text>
      </View>

      {/* Scrollable chart area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Average line that spans the full width */}
        <View
          style={[
            styles.averageLine,
            {
              bottom: (averageCycleLength / maxLength) * maxBarHeight + 30,
              backgroundColor: theme.accent,
            },
          ]}
        />

        {cycleData.map((cycle, index) => {
          const barHeight = (cycle.length / maxLength) * maxBarHeight;
          const isAboveAverage = cycle.length > averageCycleLength;
          const isBelowAverage = cycle.length < averageCycleLength;

          return (
            <View key={cycle.cycleNumber} style={styles.barContainer}>
              {/* Day count label above bar */}
              <Text
                style={[
                  styles.dayLabel,
                  { color: theme.text },
                  isAboveAverage && { color: theme.error },
                  isBelowAverage && { color: theme.accent },
                ]}
              >
                {cycle.length}
              </Text>

              {/* The bar */}
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isAboveAverage
                      ? theme.error
                      : isBelowAverage
                      ? theme.accent
                      : theme.period,
                  },
                ]}
              />

              {/* Cycle number and date label below bar */}
              <Text style={[styles.cycleLabel, { color: theme.legendText }]}>
                #{cycle.cycleNumber}
              </Text>
              <Text style={[styles.dateLabel, { color: theme.legendText }]}>
                {formatShortDate(cycle.startDate)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.legendText, { color: theme.legendText }]}>
            Below avg
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.period }]} />
          <Text style={[styles.legendText, { color: theme.legendText }]}>
            Average
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.error }]} />
          <Text style={[styles.legendText, { color: theme.legendText }]}>
            Above avg
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  averageContainer: {
    marginBottom: 8,
  },
  averageLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    maxHeight: 200,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
    minWidth: '100%',
  },
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    minWidth: 44,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bar: {
    width: 32,
    borderRadius: 4,
    minHeight: 8,
  },
  cycleLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  dateLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
