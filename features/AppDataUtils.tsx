/**
 * AppDataUtils.tsx
 * 
 * Utilities for importing, exporting, and merging app data.
 * Handles JSON serialization, file I/O, and data validation for backup/restore functionality.
 */

import { Platform, Alert, ToastAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { DateRangeList } from './DateRangeList';

/**
 * AppDataUtils class
 * Static utility methods for managing app data import, export, and merging operations
 */
export class AppDataUtils {
  /**
   * Export app data to a JSON file
   * @param appState - The complete app state to export
   */
  static async exportData(appState: any): Promise<void> {
    try {
        // Prepare data for export
        const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        data: {
            weightLogs: appState.weightLogs,
            weightUnit: appState.weightUnit,
            periodRanges: appState.periodRanges,
            symptomLogs: appState.symptomLogs,
            allSymptoms: appState.allSymptoms,
            textLogs: appState.textLogs,
            sexLogs: appState.sexLogs,
            moodLogs: appState.moodLogs,
            autoAddPeriodDays: appState.autoAddPeriodDays,
            typicalPeriodLength: appState.typicalPeriodLength,
            showOvulation: appState.showOvulation,
            showFertileWindow: appState.showFertileWindow,
            showSymptomsLog: appState.showSymptomsLog,
            showWeightLog: appState.showWeightLog,
            showSexLog: appState.showSexLog,
            showMoodLog: appState.showMoodLog,
            showNotesLog: appState.showNotesLog,
        }
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `period-tracker-data-${timestamp}.json`;

        if (Platform.OS === 'web') {
        // Web: Create download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        window.alert('Success: Your data has been exported!');
        } else {
        // Mobile: Save and share file
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Period Tracker Data',
            UTI: 'public.json'
            });
        } else {
            Alert.alert('Export Complete', `Data saved to: ${fileUri}`);
        }
        }
    } catch (error) {
        console.error('Export error:', error);
        if (Platform.OS === 'web') {
        window.alert('Export Failed: There was an error exporting your data. Please try again.');
        } else {
        Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
        }
    }
}

  /**
   * Merge imported data with existing app state
   * @param importedData - The imported data object
   * @param appState - The current app state with setter functions
   */
  static mergeImportedData(importedData: any, appState: any): void {
    const data = importedData.data;

    // Merge weight logs
    if (data.weightLogs) {
      appState.setWeightLogs((prev: any) => ({ ...prev, ...data.weightLogs }));
    }

    // Merge symptom logs
    if (data.symptomLogs) {
      appState.setSymptomLogs((prev: any) => ({ ...prev, ...data.symptomLogs }));
    }

    // Merge text logs
    if (data.textLogs) {
      appState.setTextLogs((prev: any) => ({ ...prev, ...data.textLogs }));
    }

    // Merge sex logs
    if (data.sexLogs) {
      appState.setSexLogs((prev: any) => ({ ...prev, ...data.sexLogs }));
    }

    // Merge mood logs
    if (data.moodLogs) {
      appState.setMoodLogs((prev: any) => ({ ...prev, ...data.moodLogs }));
    }

    // Merge period ranges
    if (data.periodRanges) {
      const importedRanges = new DateRangeList();
      importedRanges.loadFromObject(data.periodRanges);
      
      const mergedRanges = new DateRangeList();
      mergedRanges.loadFromObject(appState.periodRanges);
      
      // Add imported ranges only if they don't already exist
      importedRanges.ranges.forEach(range => {
        if (range.start && range.end) {
          // Check if this exact range already exists
          const isDuplicate = mergedRanges.ranges.some(existingRange => {
            return existingRange.start?.getTime() === range.start?.getTime() &&
                   existingRange.end?.getTime() === range.end?.getTime();
          });
          
          if (!isDuplicate) {
            mergedRanges.addRange(range);
          }
        }
      });
      
      appState.setPeriodRanges(mergedRanges);
    }

    // Merge symptoms (avoid duplicates)
    if (data.allSymptoms) {
      appState.setAllSymptoms((prev: any) => {
        const existingNames = new Set(prev.map((s: any) => s.name));
        const newSymptoms = data.allSymptoms.filter((s: any) => !existingNames.has(s.name));
        return [...prev, ...newSymptoms];
      });
    }

    // Update settings if not already customized (optional)
    if (data.weightUnit && (!appState.weightLogs || Object.keys(appState.weightLogs).length === 0)) {
      appState.setWeightUnit(data.weightUnit);
    }

    // Show success message
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        'Data imported successfully!',
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
    } else if (Platform.OS === 'ios') {
      Alert.alert('Import Successful', 'Your data has been imported and merged!');
    } else {
      // Web
      window.alert('Import Successful: Your data has been imported and merged!');
    }
  }

  /**
   * Import data from a JSON file
   * @param appState - The current app state with setter functions
   */
  static async importData(appState: any): Promise<void> {
    try {
      let jsonString: string | null = null;

      if (Platform.OS === 'web') {
        // Web: Use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        
        await new Promise<void>((resolve, reject) => {
          input.onchange = async (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) {
              reject(new Error('No file selected'));
              return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
              jsonString = event.target?.result as string;
              resolve();
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          };
          input.oncancel = () => reject(new Error('File selection cancelled'));
          input.click();
        });
      } else {
        // Mobile: Use DocumentPicker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          return;
        }

        const fileUri = result.assets[0].uri;
        jsonString = await FileSystem.readAsStringAsync(fileUri);
      }

      if (!jsonString) {
        if (Platform.OS === 'web') {
          window.alert('Import Failed: No file content found.');
        } else {
          Alert.alert('Import Failed', 'No file content found.');
        }
        return;
      }

      // Parse and validate the imported data
      const importedData = JSON.parse(jsonString);
      
      if (!importedData.data) {
        if (Platform.OS === 'web') {
          window.alert('Invalid Format: The selected file does not contain valid period tracker data.');
        } else {
          Alert.alert('Invalid Format', 'The selected file does not contain valid period tracker data.');
        }
        return;
      }

      // Confirm before merging
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          'Import and merge this data with your existing data? This will combine both datasets.'
        );
        if (confirmed) {
          AppDataUtils.mergeImportedData(importedData, appState);
        }
      } else {
        Alert.alert(
          'Import Data',
          'Import and merge this data with your existing data? This will combine both datasets.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Import', onPress: () => AppDataUtils.mergeImportedData(importedData, appState) }
          ]
        );
      }
    } catch (error: any) {
      console.error('Import error:', error);
      if (error.message !== 'File selection cancelled') {
        const errorMessage = error.message === 'Unexpected token' || error.name === 'SyntaxError'
          ? 'The selected file is not valid JSON. Please select a valid export file.'
          : 'There was an error importing your data. Please make sure you selected a valid export file.';
        
        if (Platform.OS === 'web') {
          window.alert('Import Failed: ' + errorMessage);
        } else {
          Alert.alert('Import Failed', errorMessage);
        }
      }
    }
  }

  /**
   * Delete all app data and reset to defaults
   * @param appState - The current app state with setter functions
   * @param defaultSymptoms - The default symptoms array to reset to
   */
  static async deleteAllData(appState: any, defaultSymptoms: any[]): Promise<void> {
    const resetData = async () => {
      try {
        // Try to delete the persisted file on mobile
        if (Platform.OS !== 'web') {
          await FileSystem.deleteAsync(FileSystem.documentDirectory + 'appState.json', { idempotent: true });
        }
      } catch (error) {
        console.error('Error deleting app state file:', error);
      }

      // Reset all state to defaults
      appState.setWeightLogs({});
      appState.setWeightUnit('lbs');
      appState.setPeriodRanges(new DateRangeList());
      appState.setSymptomLogs({});
      appState.setAllSymptoms(defaultSymptoms);
      appState.setAutoAddPeriodDays(true);
      appState.setTypicalPeriodLength(5);
      appState.setShowOvulation(true);
      appState.setShowFertileWindow(true);
      appState.setTextLogs({});
      appState.setSexLogs({});
      appState.setMoodLogs({});
    };

    // Confirm before deleting
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete all your logged data? This action is NOT reversible.');
      if (confirmed) {
        await resetData();
      }
    } else {
      Alert.alert(
        'Delete All Logs',
        'Are you sure you want to delete all your logged data? This action is NOT reversible.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: resetData }
        ]
      );
    }
  }
}
