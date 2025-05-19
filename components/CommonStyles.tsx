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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingTop: 0,
    padding: 16,
    backgroundColor: '#25292e', // fallback, should be overridden inline with theme.background
  },
});
