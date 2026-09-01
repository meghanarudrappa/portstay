import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function CrmDashboardScreen() {
  const router = useRouter();

const crmModules = [
  { id: '1', title: 'Leads', icon: 'people-outline', color: '#4f46e5', route: '/leads/home' },
  { id: '2', title: 'Accounts', icon: 'briefcase', color: '#dc2626', route: '/accounts/AccountsModule' },
  { id: '3', title: 'Contacts', icon: 'people', color: '#d97706', route: '/customers' },
  { id: '4', title: 'Deals', icon: 'briefcase-outline', color: '#059669', route: '/deals' },
];
  
return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>CRM Portal 👋</Text>
          <Text style={styles.subtitleText}>Manage your pipeline and sales activity</Text>
        </View>

        {/* Quick Access Modules Grid */}
        <View style={styles.gridContainer}>
          {crmModules.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={[styles.iconBadge, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Performance Metric Overview */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active Leads</Text>
              <Text style={styles.summaryValue}>--</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Deals Value</Text>
              <Text style={styles.summaryValue}>--</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3efff' },
  container: { padding: 20 },
  header: { marginTop: 10, marginBottom: 24 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  subtitleText: { fontSize: 14, color: '#64748b', marginTop: 4 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  summarySection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, elevation: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  summaryLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
});