import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
  heading: {
    color: '#4db8ff', // fallback, can be overridden inline
    fontSize: 22,
    fontWeight: 'bold',
    // Need to push the heading down to avoid overlap with the status bar
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
