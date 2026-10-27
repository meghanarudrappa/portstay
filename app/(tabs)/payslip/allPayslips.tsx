import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api'; 
import { 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View, 
    ScrollView, 
    StatusBar, 
    ActivityIndicator,
    TextInput,
    SafeAreaView
} from 'react-native';

export default function AllPayslips() {
    const [payslips, setPayslips] = useState<any[]>([]);
    const [filteredPayslips, setFilteredPayslips] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    
    
    const loadSalary = async () => {
        try {
            const payslipResponse = await fetch(`${API_BASE_URL}/employee-Payslip-Details-mobile`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (payslipResponse.ok) {
                const paySlipData = await payslipResponse.json();
                const dataList = paySlipData.payrunData || [];
                setPayslips(dataList);
                
                const approved = dataList.filter((item: any) => 
                    item.approveStatus && item.approveStatus.toLowerCase() !== "pending"
                );
                setFilteredPayslips(approved);
            }
        } catch (error) {
            console.error("Failed to fetch payslips:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSalary();
    }, []);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const approved = payslips.filter((item: any) => 
            item.approveStatus && item.approveStatus.toLowerCase() !== "pending"
        );
        
        if (!text.trim()) {
            setFilteredPayslips(approved);
            return;
        }

        const exactQuery = text.toLowerCase();
        const searchResults = approved.filter((item: any) => {
            const monthMatch = item.payMonth ? item.payMonth.toLowerCase().includes(exactQuery) : false;
            const amountMatch = item.monthCtc ? item.monthCtc.toString().includes(exactQuery) : false;
            return monthMatch || amountMatch;
        });
        setFilteredPayslips(searchResults);
    };

    const formatCurrency = (val: any) => {
        if (!val && val !== 0) return "0.00";
        const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
        return isNaN(num) ? "0.00" : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" translucent={false} />

            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>Payslips</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <View style={styles.searchBackgroundBlock}>
                <View style={styles.searchBarContainer}>
                    <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInputField}
                        placeholder="Search payslips..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <ScrollView bounces={true} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.sectionTitle}>Payslip History</Text>

                {loading ? (
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                ) : filteredPayslips.length > 0 ? (
                    <View style={styles.listWrapper}>
                        {filteredPayslips.map((item: any, index: number) => {
                            const itemKey = item._id || item.id || `payslip-${index}`;
                            const monthStr = item.payMonth ? item.payMonth.trim().substring(0, 3).toUpperCase() : "NOV";
                            const yearStr = item.payMonth ? item.payMonth.split(" ").pop() : "2026";
                            const displayAmount = item.netpay ?? item.netPay ?? item.monthCtc ?? 0;

                            return (
                                <TouchableOpacity
                                    style={styles.payslipListItem}
                                    key={itemKey}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/(tabs)/payslip/payslipTemplate2",
                                            params: { email: item.email, salMonth: item.payMonth },
                                        })
                                    }
                                >
                                    <View style={styles.dateBlockBadge}>
                                        <Text style={styles.dateBlockMonth}>{monthStr}</Text>
                                        <Text style={styles.dateBlockYear}>{yearStr}</Text>
                                    </View>

                                    
                                        <View style={styles.itemMetaDetails}>
                                            <View style={styles.metaTopLine}>
                                                <Text style={styles.payslipMonthTitle}>{item.payMonth}</Text>
                                                    <View style={styles.itemBadgeApproved}>
                                                        <Text style={styles.itemBadgeText}>{item.approveStatus}</Text>
                                                    </View>
                                            </View>
                                                <Text style={styles.generationDateText}>31 {item.payMonth}</Text>
                                        </View>

                                    <View style={styles.itemRightActionBlock}>
                                        <Text style={styles.payslipAmountText}>
                                            ₹{Number(String(item.monthCtc || 0).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                                        </Text>
                                        <Feather name="download" size={16} color="#4F46E5" style={{ marginTop: 4 }} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyContainerFallback}>
                        <Feather name="file-text" size={40} color="#94A3B8" />
                        <Text style={styles.emptyStateMessageText}>No approved records found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#4F46E5' },
    headerIconButton: { padding: 4 },
    headerTitleText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    searchBackgroundBlock: { backgroundColor: '#4F46E5', paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    searchIcon: { marginRight: 10 },
    searchInputField: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
    scrollContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 14 },
    listWrapper: { width: "100%" },
    payslipListItem: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
    dateBlockBadge: { backgroundColor: "#F1F5F9", width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    dateBlockMonth: { fontSize: 11, fontWeight: "800", color: "#475569" },
    dateBlockYear: { fontSize: 9, fontWeight: "600", color: "#94A3B8" },
    itemMetaDetails: { flex: 1, marginLeft: 14 },
    metaTopLine: { flexDirection: "row", alignItems: "center" },
    payslipMonthTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    itemBadgeApproved: { backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 },
    itemBadgeText: { fontSize: 10, fontWeight: "700", color: "#2E7D32" },
    generationDateText: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
    itemRightActionBlock: { justifyContent: "center", alignItems: "flex-end" },
    payslipAmountText: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    centerLoading: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
    emptyContainerFallback: { alignItems: 'center', paddingVertical: 48 },
    emptyStateMessageText: { fontSize: 14, color: '#94A3B8', marginTop: 12 }
});