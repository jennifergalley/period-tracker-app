import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/components/Theme';
import { useAppState } from '@/components/AppStateContext';
import { SymptomUtils } from '@/features/SymptomUtils';
import { CycleUtils } from '@/features/CycleUtils';
import { toDateKey } from '@/features/DateUtils';

// Color palette for different symptoms
const SYMPTOM_COLORS = [
  '#C7CEEA', // Lavender
  '#FF8B94', // Pink
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#FFDAC1', // Peach
];

type SymptomHeatmapProps = {
  maxCycleDays?: number;
};

export default function SymptomHeatmap({ maxCycleDays = 35 }: SymptomHeatmapProps) {
  const { theme } = useTheme();
  const { 
    symptomLogs, 
    allSymptoms, 
    periodRanges,
    showOvulation,
    showFertileWindow,
    predictedOvulationDay,
    predictedFertileWindow,
  } = useAppState();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get all symptoms sorted by frequency for the dropdown
  const sortedSymptoms = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, allSymptoms, allSymptoms.length);

  // Toggle symptom selection
  const toggleSymptom = (symptomName: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomName)) {
        return prev.filter(s => s !== symptomName);
      } else if (prev.length < 5) { // Limit to 5 symptoms for readability
        return [...prev, symptomName];
      }
      return prev;
    });
  };

  // Compute heatmap data
  const heatmapData = selectedSymptoms.length > 0
    ? SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, selectedSymptoms, maxCycleDays)
    : {};

  // Calculate max frequency for normalization
  const maxFrequency = Math.max(
    1,
    ...Object.values(heatmapData).flatMap(counts => counts)
  );

  // Get color for a symptom
  const getSymptomColor = (symptomName: string, index: number) => {
    return SYMPTOM_COLORS[index % SYMPTOM_COLORS.length];
  };

  // Get opacity based on frequency (for heat effect)
  const getOpacity = (frequency: number) => {
    if (frequency === 0) return 0;
    return 0.3 + (frequency / maxFrequency) * 0.7; // Range from 0.3 to 1.0
  };

  // Get cycle phase color for border outline
  const getCyclePhaseColor = (cycleDay: number) => {
    if (!periodRanges || periodRanges.isEmpty()) return null;
    
    const lastPeriod = periodRanges.getLastRange();
    if (!lastPeriod || !lastPeriod.start) return null;
    
    // Calculate the actual date for this cycle day
    const date = new Date(lastPeriod.start);
    date.setDate(date.getDate() + cycleDay - 1);
    
    // Check if it's a period day
    if (periodRanges.containsDate(date)) return theme.period;
    
    // Check if it's ovulation day
    if (showOvulation && predictedOvulationDay) {
      const ovulationCycleDay = CycleUtils.getCycleDay(periodRanges, predictedOvulationDay);
      if (cycleDay === ovulationCycleDay) return theme.ovulation;
    }
    
    // Check if it's in fertile window
    if (showFertileWindow && predictedFertileWindow.start && predictedFertileWindow.end) {
      const fertileStartDay = CycleUtils.getCycleDay(periodRanges, predictedFertileWindow.start);
      const fertileEndDay = CycleUtils.getCycleDay(periodRanges, predictedFertileWindow.end);
      if (cycleDay >= fertileStartDay && cycleDay <= fertileEndDay) return theme.fertile;
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Symptom Selector */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectorButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={[styles.selectorText, { color: theme.text }]}>
          {selectedSymptoms.length === 0
            ? 'Select symptoms to visualize'
            : `${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} selected`}
        </Text>
        <Text style={{ color: theme.accent, fontSize: 18 }}>{showDropdown ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      
      {selectedSymptoms.length > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: theme.accent }]}
          onPress={() => setSelectedSymptoms([])}
        >
          <Text style={[styles.clearButtonText, { color: theme.background }]}>Clear All</Text>
        </TouchableOpacity>
      )}
      </View>

      {/* Dropdown List */}
      {showDropdown && (
        <ScrollView style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]} nestedScrollEnabled>
          {sortedSymptoms.map(symptom => (
            <TouchableOpacity
              key={symptom.name}
              style={[
                styles.dropdownItem,
                selectedSymptoms.includes(symptom.name) && { backgroundColor: theme.accent + '20' }
              ]}
              onPress={() => toggleSymptom(symptom.name)}
            >
              <Text style={styles.symptomIcon}>{symptom.icon}</Text>
              <Text style={[styles.symptomName, { color: theme.text }]}>{symptom.name}</Text>
              {selectedSymptoms.includes(symptom.name) && (
                <Text style={{ color: theme.accent, marginLeft: 'auto' }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          {selectedSymptoms.length >= 5 && (
            <Text style={[styles.limitText, { color: theme.legendText }]}>
              Maximum 5 symptoms selected
            </Text>
          )}
        </ScrollView>
      )}

      {/* Selected Symptoms Legend */}
      {selectedSymptoms.length > 0 && (
        <View style={styles.legend}>
          {selectedSymptoms.map((symptomName, index) => {
            const symptom = allSymptoms.find(s => s.name === symptomName);
            const color = getSymptomColor(symptomName, index);
            return (
              <View key={symptomName} style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: color }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  {symptom?.icon} {symptomName}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Unified Heatmap Calendar */}
      {selectedSymptoms.length > 0 && (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarGrid}>
            {/* Build calendar rows (weeks) */}
            {Array.from({ length: Math.ceil(maxCycleDays / 7) }).map((_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {Array.from({ length: 7 }).map((_, dayInWeek) => {
                  const cycleDay = weekIndex * 7 + dayInWeek + 1;
                  
                  // Don't render days beyond maxCycleDays
                  if (cycleDay > maxCycleDays) {
                    return <View key={dayInWeek} style={[styles.calendarCell, { opacity: 0 }]} />;
                  }
                  
                  // Get all symptoms for this cycle day
                  const symptomsForDay = selectedSymptoms
                    .map((symptomName, index) => ({
                      name: symptomName,
                      count: heatmapData[symptomName]?.[cycleDay - 1] || 0,
                      color: getSymptomColor(symptomName, index),
                      icon: allSymptoms.find(s => s.name === symptomName)?.icon || '',
                    }))
                    .filter(s => s.count > 0);
                  
                  const hasSymptoms = symptomsForDay.length > 0;
                  const totalCount = symptomsForDay.reduce((sum, s) => sum + s.count, 0);
                  const cyclePhaseColor = getCyclePhaseColor(cycleDay);
                  
                  return (
                    <View
                      key={dayInWeek}
                      style={[
                        styles.calendarCell,
                        {
                          backgroundColor: theme.card,
                          borderColor: cyclePhaseColor || theme.border,
                          borderWidth: cyclePhaseColor ? 3 : 1,
                        }
                      ]}
                    >
                      <Text style={[styles.cycleDayLabel, { color: theme.text }]}>{cycleDay}</Text>
                      
                      {/* Show symptom counts as colored labels */}
                      {hasSymptoms && (
                        <View style={styles.symptomCounts}>
                          {symptomsForDay.map((symptom, idx) => (
                            <View
                              key={idx}
                              style={[
                                styles.symptomCountLabel,
                                {
                                  backgroundColor: symptom.color,
                                  opacity: getOpacity(symptom.count),
                                }
                              ]}
                            >
                              <Text style={styles.symptomCountText}>{symptom.count}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {selectedSymptoms.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.legendText }]}>
            Select one or more symptoms to see when they typically occur in your cycle
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdown: {
    maxHeight: 250,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  symptomIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  symptomName: {
    fontSize: 16,
  },
  limitText: {
    textAlign: 'center',
    padding: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
  },
  calendarContainer: {
    marginTop: 8,
  },
  calendarGrid: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calendarCell: {
    width: '13.5%',
    aspectRatio: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    position: 'relative',
    padding: 2,
    paddingTop: 16,
  },
  cycleDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    position: 'absolute',
    top: 2,
    left: 3,
  },
  symptomCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  symptomCountLabel: {
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomCountText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
