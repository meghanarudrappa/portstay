import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api'; 

export default function LeaveCard() {
    const router = useRouter();
    const [leaveData, setLeaveData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

    const loadLeaveData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/my-time-off-request-list-mobile`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                setLeaveData(data.offRequests || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaveData();
    }, []);

    const totalCount = leaveData.length;
    const approvedCount = leaveData.filter(item => item.status?.toLowerCase() === 'approved').length;
    const pendingCount = leaveData.filter(item => item.status?.toLowerCase() === 'pending').length;
    const rejectedCount = leaveData.filter(item => item.status?.toLowerCase() === 'rejected').length;

    const filteredLeaveData = leaveData.filter(item => {
        if (activeTab === 'All') return true;
        return item.status?.toLowerCase() === activeTab.toLowerCase();
    });

    const getLeaveIconConfig = (type: string) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('sick')) {
            return { name: 'bed-outline' as const, bg: '#fef3c7', color: '#d97706' };
        } else if (lowerType.includes('casual')) {
            return { name: 'umbrella-outline' as const, bg: '#dcfce7', color: '#15803d' };
        } else if (lowerType.includes('privilege')) {
            return { name: 'calendar-outline' as const, bg: '#ffe4e6', color: '#e11d48' };
        } else {
            return { name: 'desktop-outline' as const, bg: '#e0e7ff', color: '#4f46e5' };
        }
    };

    const getStatusStyles = (status: string) => {
        const currentStatus = status?.toLowerCase() || 'pending';
        switch (currentStatus) {
            case 'approved':
                return { container: styles.statusApproved, text: styles.textApproved, label: 'Approved' };
            case 'rejected':
                return { container: styles.statusRejected, text: styles.textRejected, label: 'Rejected' };
            default:
                return { container: styles.statusPending, text: styles.textPending, label: 'Pending' };
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />
                  
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color="#5e35b1" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Leave Requests</Text>
                <TouchableOpacity style={styles.headerButtonRight}>
                    <Ionicons name="options-outline" size={20} color="#5e35b1" />
                </TouchableOpacity>
            </View>

    {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>Leave Summary</Text>
                            <Text style={styles.summaryYear}>This Year (2026)</Text>
                        </View>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{totalCount}</Text>
                                <Ionicons name="apps-outline" size={14} color="rgba(255,255,255,0.7)" style={styles.statIcon} />
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{approvedCount}</Text>
                                <Ionicons name="checkmark-circle-outline" size={14} color="#4ade80" style={styles.statIcon} />
                                <Text style={styles.statLabel}>Approved</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{pendingCount}</Text>
                                <Ionicons name="time-outline" size={14} color="#fbbf24" style={styles.statIcon} />
                                <Text style={styles.statLabel}>Pending</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{rejectedCount}</Text>
                                <Ionicons name="close-circle-outline" size={14} color="#f87171" style={styles.statIcon} />
                                <Text style={styles.statLabel}>Rejected</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tabContainer}>
                        {(['All', 'Approved', 'Pending', 'Rejected'] as const).map((tab) => (
                            <TouchableOpacity 
                                key={tab} 
                                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {filteredLeaveData.length === 0 ? (
                        <Text style={styles.noData}>No leave requests found.</Text>
                    ) : (
                        filteredLeaveData.map((leave, index) => {
                            const iconConfig = getLeaveIconConfig(leave.taskName);
                            const statusConfig = getStatusStyles(leave.status);
                            
                            // FIXED: Clear plural handling based on task metrics
                            const daysCount = leave.noOfDays ? parseInt(leave.noOfDays, 10) : 1;
                            const daysDisplay = daysCount === 1 ? "1 Day" : `${daysCount} Days`;

                            return (
                                <View key={index} style={styles.cardContainer}>
                                    <View style={styles.cardMain}>
                                        <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                                            <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
                                        </View>

                                        <View style={styles.cardDetails}>
                                            <View style={styles.cardHeaderRow}>
                                                <Text style={styles.leaveTypeTitle} numberOfLines={1}>
                                                    {leave.taskName || "Leave Request"}
                                                </Text>
                                                <View style={[styles.statusBadge, statusConfig.container]}>
                                                    <Text style={[styles.statusText, statusConfig.text]}>
                                                        {statusConfig.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.infoMetaRow}>
                                                <Ionicons name="calendar-clear-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.infoMetaText}>{leave.follow_Date}</Text>
                                            </View>

                                            <View style={styles.infoMetaRow}>
                                                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.infoMetaText}>{daysDisplay}</Text>
                                            </View>
                                        </View>

                                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" style={styles.arrowRight} />
                                    </View>
                                    
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.appliedTimestamp}>
                                            Applied on {leave.date || "N/A"}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', minHeight: '100%' },
    header: {
      flexDirection: 'row',
      alignItems: 'center', 
      paddingHorizontal: 16, 
      paddingTop: Platform.OS === 'ios' ? 48 : 16, 
      paddingBottom: 12, 
      backgroundColor: '#f8fafc',
      // --- ADD THESE LINES TO OVERRIDE THE NATIVE BORDER/SHADOW ---
      borderBottomWidth: 0,      // Removes any layout border lines
      shadowOpacity: 0,          // Removes iOS shadow artifacts
      elevation: 0, },
    headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    headerButtonRight: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#0f172a', marginLeft: 4 },
    scrollContent: { 
    flexGrow: 1,       // <-- Add this to force it to expand full height
    paddingHorizontal: 16, 
    paddingBottom: 32,
    backgroundColor: '#f8fafc' // <-- Re-enforce the background color here
    },
    loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Ensures background matches during fetch
    minHeight: 200, 
    },
    summaryCard: { backgroundColor: '#6366f1', borderRadius: 20, padding: 16, marginVertical: 12, ...Platform.select({ ios: { shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 }, android: { elevation: 6 } }) },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    summaryTitle: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
    summaryYear: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
    statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statBox: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
    statIcon: { marginVertical: 2 },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginVertical: 12 },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabButtonActive: { backgroundColor: '#ffffff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    tabTextActive: { color: '#6366f1' },
    noData: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
    cardContainer: { backgroundColor: '#ffffff', borderRadius: 18, marginBottom: 12, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
    cardMain: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    iconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardDetails: { flex: 1, marginLeft: 12 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    leaveTypeTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    statusApproved: { backgroundColor: '#dcfce7' },
    statusPending: { backgroundColor: '#fef3c7' },
    statusRejected: { backgroundColor: '#ffe4e6' },
    statusText: { fontSize: 11, fontWeight: '700' },
    textApproved: { color: '#15803d' },
    textPending: { color: '#b45309' },
    textRejected: { color: '#b91c1c' },
    infoMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    infoMetaText: { fontSize: 12, color: '#64748b', marginLeft: 6, fontWeight: '500' },
    arrowRight: { marginLeft: 4 },
    cardFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fafafa' },
    appliedTimestamp: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
});