import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    Image,
    ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SalaryOverviewScreen() {
    // 👇 RECEIVE EVERYTHING SENT FROM THE ROUTER HERE 👇
    const { data, selectedMonth, selectedYear } = useLocalSearchParams<{
        data?: string;
        selectedMonth?: string;
        selectedYear?: string;
    }>();

    const [empSalary, setEmpSalary] = useState<any>(null);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const router = useRouter();

    const formatCurrency = (val: any) => {
        if (val === undefined || val === null) return '0.00';
        let cleanVal = String(val).trim().replace(/,/g, '');
        const num = Number(cleanVal);
        return isNaN(num) ? '0.00' : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
  useEffect(() => {
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            console.log("🟢 PARSED SALARY DATA OBJECT:", parsed);

            // 1. Safe extraction of numeric base numbers
            const monthlyTotal = Number(String(parsed.monthlyCTC || parsed.monthCtc || 0).replace(/[^0-9.]/g, ''));
            const annualTotal = Number(String(parsed.annualCTC || parsed.annualCtc || 0).replace(/[^0-9.]/g, ''));

            // 2. Resolve field items or dynamically fallback to calculated ratios if keys are missing
            const basicSalResolved = parsed.basicSal !== undefined && parsed.basicSal !== null 
                ? parsed.basicSal 
                : (monthlyTotal > 0 ? (monthlyTotal * 0.50).toFixed(2) : 0);

            const hraResolved = parsed.hra !== undefined && parsed.hra !== null 
                ? parsed.hra 
                : (monthlyTotal > 0 ? (monthlyTotal * 0.25).toFixed(2) : 0);

            const fixedAllowResolved = parsed.fixedAllow !== undefined && parsed.fixedAllow !== null 
                ? parsed.fixedAllow 
                : (monthlyTotal > 0 ? (monthlyTotal * 0.25).toFixed(2) : 0);

            // 3. Construct a fully normalized data structure
            const normalizedSalary = {
                ...parsed,
                annualCTC: annualTotal > 0 ? annualTotal : (monthlyTotal * 12),
                monthlyCTC: monthlyTotal,
                basicSal: basicSalResolved,
                hra: hraResolved,
                fixedAllow: fixedAllowResolved,
                grossPay: parsed.grossPay || monthlyTotal,
                deductionAmt: parsed.deductionAmt || parsed.detuctMonthsal || 0,
            };
            
            setEmpSalary(normalizedSalary);

            // 4. Determine Month and Year Context safely
            if (selectedMonth) {
                const cleanMonth = String(selectedMonth).trim();
                const parts = cleanMonth.split(/\s+/);
                if (parts.length > 1) {
                    setMonth(parts[0]);
                    setYear(parts[1]);
                } else {
                    setMonth(cleanMonth);
                    setYear(selectedYear || '2026');
                }
                return;
            }

            // Fallback parsing if no router params were passed over
            const rawPeriodText = parsed.payMonth || parsed.payPeriod || '';
            if (rawPeriodText) {
                const parts = rawPeriodText.trim().split(/\s+/);
                if (parts.length > 1) {
                    setMonth(parts[0]);
                    setYear(parts[1]);
                } else {
                    setMonth(rawPeriodText);
                    setYear('2026');
                }
            } else {
                setMonth('Salary');
                setYear('Details');
            }

        } catch (err) {
            console.error("Failed to parse salary payload data:", err);
        }
    }
}, [data]);// Keeps dependencies isolated to avoid triggering rapid infinite state re-renders

    if (!empSalary) {
        return (
            <View style={[styles.container, styles.centerComponents]}>
                <ActivityIndicator size="large" color="#2A26D9" />
                <Text style={styles.loadingText}>Fetching Salary Dashboard details...</Text>
            </View>
        );
    }

    // UPDATED: Dynamically falls back to payPeriod directly if the split state is still setting
    const displayMonthText = month ? `${month} ${year}` : (empSalary?.payPeriod || empSalary?.payMonth || '');

   const grossVal = Number(String(empSalary?.grossPay || 0).replace(/[^0-9.]/g, ''));
    const ctcVal = Number(String(empSalary?.annualCTC || 0).replace(/[^0-9.]/g, ''));
    
    // Explicitly check for both valid numbers and non-zero denominators to completely bypass NaN risks
    const grossPercentage = (!isNaN(grossVal) && !isNaN(ctcVal) && ctcVal > 0) 
        ? ((grossVal * 12) / ctcVal * 100).toFixed(2) 
        : '0.00';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false}/>
            
            {/* Top Navigation Header with centered text and absolute left arrow */}
            <View style={styles.headerBackground}>
                <View style={styles.backButtonRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.leftIconAbsoluteHitbox}>
                        <Feather name="arrow-left" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.backButtonText}>Salary Details</Text>
                </View>
            </View>

            <ScrollView style={styles.dashboardContainer} showsVerticalScrollIndicator={false} bounces={false}>
                
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitleText}>Salary</Text>
                    <Text style={styles.subTitleText}>Manage and track your salary</Text>
                </View>

                {/* Main Summary Hero Card (Top Card Badge) */}
                <View style={styles.gradientCardWrapper}>
                    <LinearGradient
                        colors={['#1E3A8A', '#155bf2']} 
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroLeftColumn}>
                        {/* Dynamic lookup checking your active backend responses first */}
                        {displayMonthText ? (
                            <View style={styles.calendarBadge}>
                                <Feather name="calendar" size={12} color="#2563EB" style={{ marginRight: 4 }} />
                                <Text style={styles.calendarBadgeText}>
                                    {displayMonthText}
                                </Text>
                            </View>
                        ) : null}
                        
                        <Text style={styles.heroLabel}>Monthly Salary</Text>
                        <Text style={styles.heroValue}>₹{formatCurrency(empSalary?.monthlyCTC)}</Text>
                        
                        <Text style={styles.heroSubLabel}>Annual CTC</Text>
                        <Text style={styles.heroSubValue}>₹{formatCurrency(empSalary?.annualCTC)}</Text>
                    </View>

                        <View style={styles.heroRightColumn}>
                            <Image 
                                source={require('../../../assets/images/Salaryslip.png')} 
                                style={styles.walletAssetImage}
                                resizeMode="contain"
                            />
                        </View>
                    </LinearGradient>
                </View>

                {/* Metrics Overview Grid */}
                <Text style={styles.sectionDividerTitle}>Metrics Overview</Text>
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                            <Feather name="credit-card" size={16} color="#2563EB" />
                        </View>
                        <Text style={styles.metricLabel}>Gross Pay</Text>
                        <Text style={styles.metricValue}>₹{formatCurrency(empSalary?.grossPay)}</Text>
                        <Text style={styles.metricPercentage}>{grossPercentage}% of CTC</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                            <Feather name="alert-circle" size={16} color="#DC2626" />
                        </View>
                        <Text style={styles.metricLabel}>Deductions</Text>
                        <Text style={styles.metricValue}>₹{formatCurrency(empSalary?.deductionAmt)}</Text>
                        <Text style={styles.metricPercentage}>0% of CTC</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                            <Feather name="check-square" size={16} color="#059669" />
                        </View>
                        <Text style={styles.metricLabel}>Net Pay</Text>
                        <Text style={styles.metricValue}>₹{formatCurrency(empSalary?.monthlyCTC)}</Text>
                        <Text style={styles.metricPercentage}>{grossPercentage}% of CTC</Text>
                    </View>
                </View>

                {/* Breakdown Summary Box */}
                <Text style={styles.sectionDividerTitle}>Breakdown Summary</Text>
                <View style={styles.horizontalBreakdownCard}>
                    <View style={styles.breakdownRow}>
                        <View style={[styles.rowIconBox, { backgroundColor: '#EFF6FF' }]}>
                            <Feather name="archive" size={16} color="#2563EB" />
                        </View>
                        <View style={styles.rowMiddleContent}>
                            <Text style={styles.rowValueText}>₹{formatCurrency(empSalary?.grossPay)}</Text>
                            <Text style={styles.rowLabelText}>Total Earnings</Text>
                        </View>
                    </View>

                    <View style={styles.breakdownRow}>
                        <View style={[styles.rowIconBox, { backgroundColor: '#FFFBEB' }]}>
                            <Feather name="gift" size={16} color="#D97706" />
                        </View>
                        <View style={styles.rowMiddleContent}>
                            <Text style={styles.rowValueText}>₹{formatCurrency(empSalary?.otherAllow)}</Text>
                            <Text style={styles.rowLabelText}>Other Allowances</Text>
                        </View>
                    </View>

                    <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
                        <View style={[styles.rowIconBox, { backgroundColor: '#F9FAFB' }]}>
                            <Feather name="shield" size={16} color="#4B5563" />
                        </View>
                        <View style={styles.rowMiddleContent}>
                            <Text style={styles.rowValueText}>₹{formatCurrency(empSalary?.deductionAmt)}</Text>
                            <Text style={styles.rowLabelText}>Total Deductions</Text>
                        </View>
                    </View>
                </View>

                {/* Earnings Breakdown Section Header with Fixed Month Badge */}
                <View style={styles.breakdownHeaderRowContainer}>
                    <Text style={styles.sectionDividerTitleInline}>Earnings Breakdown</Text>
                    {displayMonthText ? (
                        <View style={styles.tableMonthBadge}>
                            <Text style={styles.tableMonthBadgeText}>{displayMonthText}</Text>
                        </View>
                    ) : null}
                </View>
                
                {/* Complete Itemized List Table */}
                <View style={styles.breakdownDetailsCard}>
                    <View style={styles.breakdownTableHeaderRow}>
                        <Text style={styles.tableHeaderLabel}>Earnings</Text>
                        <Text style={styles.tableHeaderValue}>Amount (₹)</Text>
                    </View>

                    <View style={styles.tableItemRow}>
                        <Text style={styles.tableItemLabel}>Basic Salary</Text>
                        <Text style={styles.tableItemValue}>₹{formatCurrency(empSalary?.basicSal)}</Text>
                    </View>

                    <View style={styles.tableItemRow}>
                        <Text style={styles.tableItemLabel}>House Rent Allowance</Text>
                        <Text style={styles.tableItemValue}>₹{formatCurrency(empSalary?.hra)}</Text>
                    </View>

                    <View style={styles.tableItemRow}>
                        <Text style={styles.tableItemLabel}>Fixed Allowance</Text>
                        <Text style={styles.tableItemValue}>₹{formatCurrency(empSalary?.fixedAllow)}</Text>
                    </View>

                    {empSalary?.customizeEarn && Object.entries(empSalary.customizeEarn).map(([key, value]) => (
                        <View key={key} style={styles.tableItemRow}>
                            <Text style={styles.tableItemLabel}>{String(key)}</Text>
                            <Text style={styles.tableItemValue}>₹{formatCurrency(value)}</Text>
                        </View>
                    ))}

                    {/* Gross Pay Highlight Row */}
                    <View style={[styles.tableItemRow, styles.grossHighlightRow]}>
                        <Text style={[styles.tableItemLabel, styles.grossHighlightText]}>Gross Pay</Text>
                        <Text style={[styles.tableItemValue, styles.grossHighlightText]}>₹{formatCurrency(empSalary?.grossPay)}</Text>
                    </View>

                    {/* Net Pay Highlight Row */}
                    <View style={[styles.tableItemRow, styles.netHighlightRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.tableItemLabel, styles.netHighlightText]}>Net Pay</Text>
                        <Text style={[styles.tableItemValue, styles.netHighlightText]}>₹{formatCurrency(empSalary?.monthlyCTC)}</Text>
                    </View>
                </View>

                <View style={styles.footerSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centerComponents: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' },
    
    // Centered Navigation Header Layout Styles
    headerBackground: { paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    backButtonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, position: 'relative' },
    leftIconAbsoluteHitbox: { position: 'absolute', left: 0, padding: 8, zIndex: 10 },
    backButtonText: { fontSize: 18, fontWeight: '700', color: '#0F172A', textAlign: 'center' },

    dashboardContainer: { flex: 1, padding: 16 },
    titleSection: { marginBottom: 20 },
    mainTitleText: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
    subTitleText: { fontSize: 13, color: '#64748B', marginTop: 2 },
    gradientCardWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
    heroCard: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroLeftColumn: { flex: 1 },
    calendarBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 12 },
    calendarBadgeText: { color: '#2563EB', fontSize: 11, fontWeight: '700' },
    heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500' },
    heroValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 12 },
    heroSubLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500' },
    heroSubValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    heroRightColumn: { justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    walletAssetImage: { borderRadius:25, width: 160, height: 135 },
    sectionDividerTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    
    // Inline Month Badge Styles matching image_cd4092.png
    breakdownHeaderRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
    sectionDividerTitleInline: { fontSize: 14, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
    tableMonthBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' },
    tableMonthBadgeText: { color: '#2563EB', fontSize: 11, fontWeight: '700' },

    metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
    metricCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    metricLabel: { fontSize: 11, fontWeight: '500', color: '#64748B', marginBottom: 4 },
    metricValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    metricPercentage: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
    horizontalBreakdownCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16 },
    breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    rowIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowMiddleContent: { flex: 1 },
    rowValueText: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
    rowLabelText: { fontSize: 12, color: '#64748B' },
    
    breakdownDetailsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    breakdownTableHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeaderLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    tableHeaderValue: { fontSize: 12, fontWeight: '700', color: '#64748B', textAlign: 'right' },
    tableItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
    tableItemLabel: { fontSize: 13, color: '#334155', fontWeight: '500' },
    tableItemValue: { fontSize: 13, fontWeight: '600', color: '#0F172A', textAlign: 'right' },
    
    grossHighlightRow: { backgroundColor: '#EFF6FF', borderBottomWidth: 1, borderBottomColor: '#DBEAFE' },
    grossHighlightText: { color: '#2563EB', fontWeight: '700', fontSize: 14 },
    netHighlightRow: { backgroundColor: '#ECFDF5' },
    netHighlightText: { color: '#059669', fontWeight: '700', fontSize: 14 },
    
    footerSpacer: { height: 40 }
});