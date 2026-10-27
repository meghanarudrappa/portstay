import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, Dimensions, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState, useMemo } from "react"
import { API_BASE_URL } from '../../config/api'; 

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
    const router = useRouter();
    const [empSalary, setEmpSalary] = useState<any>({});
    const [payslips, setPayslips] = useState<any>([]);
    
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [selectedMonthDetails, setSelectedMonthDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

    // Helper map to cleanly evaluate backend text values into dates for chronological sorting
    const monthIndexMap: { [key: string]: number } = {
        january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, 
        jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8, 
        oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
    };

    const getFallbackMonths = () => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const fallbackList = [];
        const currentDate = new Date();

        for (let i = 0; i < 4; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            fallbackList.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
        }
        return fallbackList;
    };

    const loadSalary = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/employee-salary-Details-mobile`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                const data = await response.json();
                setEmpSalary(data);
            }
            
            const payslipResponse = await fetch(`${API_BASE_URL}/employee-Payslip-Details-mobile`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (payslipResponse.ok) {
                const paySlipData = await payslipResponse.json();
                setPayslips(paySlipData);
            }
        } catch (error) {
            console.error("Failed to fetch baseline payroll summary layout:", error);
        }
    };

    const loadSpecificMonthDetails = async (targetMonth: string) => {
        const profileEmail = empSalary?.email || payslips?.email || "";
        if (!profileEmail) return;
        
        setIsLoadingDetails(true);
        try {
            const URL = `${API_BASE_URL}/fetching-payslip-mobile?email=${encodeURIComponent(profileEmail)}&month=${encodeURIComponent(targetMonth)}`;
            const response = await fetch(URL, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            
            if (response.ok) {
                const detailedPayload = await response.json();
                setSelectedMonthDetails(detailedPayload);
            }
        } catch (error) {
            console.error("Failed structural month calculation load:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => {
        loadSalary();
    }, []);

    // 1. SORTING LOGIC: Organizes the backend response chronologically (most recent first)
    const approvedPayslips = useMemo(() => {
        const rawList = payslips?.payrunData?.filter((item: any) => item.approveStatus !== "Pending") || [];
        
        return [...rawList].sort((a: any, b: any) => {
            if (!a.payMonth) return 1;
            if (!b.payMonth) return -1;

            const partsA = a.payMonth.trim().split(/\s+/);
            const partsB = b.payMonth.trim().split(/\s+/);

            const yearA = parseInt(partsA[1]) || 2026;
            const yearB = parseInt(partsB[1]) || 2026;

            if (yearA !== yearB) return yearB - yearA; // Higher year ranks first

            const monthNameA = partsA[0]?.toLowerCase() || "";
            const monthNameB = partsB[0]?.toLowerCase() || "";
            
            return (monthIndexMap[monthNameB] ?? 0) - (monthIndexMap[monthNameA] ?? 0);
        });
    }, [payslips]);

    const dropDownOptions = useMemo(() => {
        const backendMonths = approvedPayslips.map((item: any) => item.payMonth);
        return backendMonths.length > 0 ? backendMonths : getFallbackMonths();
    }, [approvedPayslips]);

    // Set the initial default state to the most recent month variant
    useEffect(() => {
        if (dropDownOptions.length > 0 && !selectedPeriod) {
            setSelectedPeriod(dropDownOptions[0]);
        }
    }, [dropDownOptions, selectedPeriod]);

    // Handle background fetching whenever the selected month changes
    useEffect(() => {
        if (selectedPeriod) {
            loadSpecificMonthDetails(selectedPeriod);
        }
    }, [selectedPeriod, empSalary?.email, payslips?.email]); 

    const matchingPayslip = approvedPayslips.find((item: any) => item.payMonth === selectedPeriod);
    const dynamicStatus = matchingPayslip?.approveStatus || (approvedPayslips.length > 0 ? approvedPayslips[0].approveStatus : "Approved");

    // 2. DYNAMIC NET SALARY CALCULATION VALUE
    const displayNetSalary = useMemo(() => {
        // If a specific month is selected and its API response contains salary numbers, prioritize it
        if (selectedMonthDetails?.monthCtc || selectedMonthDetails?.monthlyCTC) {
            return selectedMonthDetails.monthCtc || selectedMonthDetails.monthlyCTC;
        }
        // Fallback to the active matching payslip from the array collection loop
        if (matchingPayslip?.monthCtc) {
            return matchingPayslip.monthCtc;
        }
        // Baseline account level structural config backup
        return empSalary?.monthlyCTC || 0;
    }, [selectedMonthDetails, matchingPayslip, empSalary]);

    return (
        <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor="#373ae4" />
            
            <View style={styles.headerBanner}>
                <Image 
                    source={require(".././../../assets/images/payroll_homepage.png")} 
                    style={styles.headerIllustration}
                    resizeMode="contain"
                />
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Payroll</Text>
                    <Text style={styles.headerSubtitle}>Manage your payments and details</Text>
                </View>
            </View>

            <View style={styles.contentLayer}>
                
                {/* 1. Net Salary Statement Main Card */}
                <View style={[styles.netSalaryCard, { zIndex: 100 }]}> 
                    <View style={styles.netSalaryHeader}>
                        
                        <View style={{ zIndex: 200, position: 'relative' }}>
                            <TouchableOpacity 
                                style={styles.periodDropdown} 
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.periodDropdownText}>{selectedPeriod || "Select Month"}</Text>
                                <Feather name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={14} color="#1E293B" style={{ marginLeft: 4 }} />
                            </TouchableOpacity>

                            {/* DROPDOWN OPTIONS LISTING OVERLAY */}
                            {isDropdownOpen && (
                                <View style={styles.dropdownMenuContainer}>
                                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                                        {dropDownOptions.map((month: string, index: number) => (
                                            <TouchableOpacity 
                                                key={index}
                                                style={styles.dropdownOptionItem}
                                                onPress={() => {
                                                    setSelectedPeriod(month);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownOptionText}>{month}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* DYNAMIC STATUS BADGE */}
                        <View style={styles.approvedBadge}>
                            <Text style={styles.approvedBadgeText}>{dynamicStatus}</Text>
                        </View>
                    </View>

                    <View style={styles.salaryRow}>
                        <View>
                            <Text style={styles.netSalaryLabel}>Net Salary ({selectedPeriod})</Text>
                            {isLoadingDetails ? (
                                <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 8, alignItems: 'flex-start' }} />
                            ) : (
                                <Text style={styles.netSalaryAmount}>
                                    ₹{Number(String(displayNetSalary).replace(/[^0-9.]/g, '') || 0).toLocaleString('en-IN')}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.visibilityButton}>
                            <Feather name="eye" size={18} color="#4F46E5" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.employeeIdText}>
                        Employee ID : {selectedMonthDetails?.empId || matchingPayslip?.empId || empSalary?.empId || "--"}
                    </Text>
                </View>

            
                {/* Recent Payslips List Layout */}
                <View style={styles.listHeaderRow}>
                    <Text style={styles.sectionHeadingMarginless}>Recent Payslips</Text>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/payslip/allPayslips")}>
                        <View style={styles.viewAllAction}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Feather name="chevron-right" size={14} color="#4F46E5" />
                        </View>
                    </TouchableOpacity>
                </View>

                {approvedPayslips.length > 0 ? (
                    approvedPayslips.slice(0, 5).map((item: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.payslipListItem}
                            onPress={() => router.push({
                                pathname: `/(tabs)/payslip/payslips` as any,
                                params: { 
                                    data: JSON.stringify(item),
                                    selectedMonth: item.payMonth || '',
                                    selectedYear: item.payMonth?.split(" ").pop() || '',
                                    templateName: item.templatename || ''
                                },
                            })}
                        >
                            <View style={styles.dateBlockIcon}>
                                <Text style={styles.dateBlockMonth}>
                                    {item.payMonth ? item.payMonth.substring(0, 3).toUpperCase() : "MON"}
                                </Text>
                                <Text style={styles.dateBlockYear}>
                                    {item.payMonth ? item.payMonth.split(" ").pop() : "2026"}
                                </Text>
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
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Feather name="file" size={32} color="#94A3B8" />
                        <Text style={styles.emptyText}>No recent payslips found</Text>
                    </View>
                )}

            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    headerBanner: { backgroundColor: "#373ae4", height: 175, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, position: "relative", overflow: "hidden" },
    headerTextContainer: { position: "absolute", left: 24, top: 60, zIndex: 2, maxWidth: "55%" },
    headerTitle: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
    headerSubtitle: { fontSize: 13, color: "#EFF6FF", marginTop: 6, fontWeight: "500", lineHeight: 18 },
    headerIllustration: { position: "absolute", right: 16, bottom: 35, width: 145, height: 105, zIndex: 1 },
    contentLayer: { paddingHorizontal: 16, marginTop: -30, paddingBottom: 32 },
    netSalaryCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 4, marginBottom: 24 },
    netSalaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    periodDropdown: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    periodDropdownText: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
    dropdownMenuContainer: { position: 'absolute', top: 36, left: 0, backgroundColor: '#FFFFFF', borderRadius: 12, width: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9', paddingVertical: 4 },
    dropdownOptionItem: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    dropdownOptionText: { fontSize: 13, color: '#334155', fontWeight: '500' },
    approvedBadge: { backgroundColor: "#E8F5E9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    approvedBadgeText: { fontSize: 11, fontWeight: "600", color: "#2E7D32" },
    salaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 },
    netSalaryLabel: { fontSize: 13, fontWeight: "500", color: "#64748B" },
    netSalaryAmount: { fontSize: 28, fontWeight: "700", color: "#1E293B", marginTop: 2 },
    visibilityButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center" },
    attendanceSummaryRow: { flexDirection: 'row', gap: 16, marginTop: 10, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
    attendanceSplitText: { fontSize: 12, color: '#475569' },
    employeeIdText: { fontSize: 12, color: "#64748B", marginTop: 12, fontWeight: "500" },
    sectionHeading: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 12, paddingHorizontal: 4 },
    sectionHeadingMarginless: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
    hubGrid: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 24 },
    hubCard: { width: "23.5%", borderRadius: 16, padding: 10, alignItems: "center", justifyContent: "center" },
    hubIconCircle: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 8 },
    hubCardLabel: { fontSize: 11, fontWeight: "600", color: "#334155", textAlign: "center", lineHeight: 14 },
    listHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 4 },
    viewAllAction: { flexDirection: "row", alignItems: "center" },
    viewAllText: { fontSize: 13, fontWeight: "600", color: "#4F46E5", marginRight: 2 },
    payslipListItem: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 8, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    dateBlockIcon: { width: 46, height: 46, backgroundColor: "#EEF2FF", borderRadius: 12, justifyContent: "center", alignItems: "center" },
    dateBlockMonth: { fontSize: 11, fontWeight: "700", color: "#4F46E5" },
    dateBlockYear: { fontSize: 10, fontWeight: "600", color: "#94A3B8" },
    itemMetaDetails: { flex: 1, paddingHorizontal: 12 },
    metaTopLine: { flexDirection: "row", alignItems: "center", gap: 6 },
    payslipMonthTitle: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
    itemBadgeApproved: { backgroundColor: "#E8F5E9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    itemBadgeText: { fontSize: 9, fontWeight: "700", color: "#2E7D32" },
    generationDateText: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
    itemRightActionBlock: { alignItems: "flex-end" },
    payslipAmountText: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#94A3B8', marginTop: 8, fontSize: 13 }
});