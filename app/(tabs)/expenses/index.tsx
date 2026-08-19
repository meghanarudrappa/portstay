import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, ScrollView, Dimensions, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { expenseService } from '@/app/config/expenseApi';
import { Ionicons } from '@expo/vector-icons';

interface TravelExpenseClaim {
  id: string;
  claimDate?: string | number;
  expenseReferenceNo?: string;
  employeeName?: string;
  department?: string;
  expenseCategory?: string;
  grandTotal?: number;
  totalAmount?: number;
  approvalStatus?: string | null;
  projectName?: string;
  company?: {
    name?: string;
    area?: string;
    city?: string;
    state?: string;
    country?: string;
    gstin?: string;
  };
}

interface CompanyMeta {
  name?: string;
  gstRegistered?: string;
}

export default function ExpenseDashboardPage() {
  const router = useRouter();

  // Core Page UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false); 
  const [claimsList, setClaimsList] = useState<TravelExpenseClaim[]>([]);
  const [filteredList, setFilteredList] = useState<TravelExpenseClaim[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyMeta | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All Expenses');

  // Filter Bar Control States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-13');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Dynamic Company Context & KPI Scoreboard Metrics
  const [companyMeta, setCompanyMeta] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    totalExpenses: 0,
    approvedClaims: 0,
    pendingApproval: 0,
    reimbursement: 0
  });

  // Simple static lists for our custom calendar modal engine
  const daysInJuly = Array.from({ length: 31 }, (_, i) => i + 1);

  // 📡 Fetch backend data matching Map<String, Object> format
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("============= [FETCH START] =============");
      console.log("📡 [DEBUG] Target: /mobile-travel-expenses-home");
      
      const response = await expenseService.getTravelExpenseDetailsList();
      console.log("📥 [DEBUG] Raw Response Object Map Received:", JSON.stringify(response));

      if (response && response.success === true) {
        const claims: TravelExpenseClaim[] = response.travelExpenseClaims || [];
        console.log(`✅ [DEBUG] Found ${claims.length} claims inside payload map structure.`);

        setClaimsList(claims);
        setFilteredList(claims);

        if (response.company) {
          setCompanyInfo(response.company);
          setCompanyMeta(response.company);
        }

        // Dynamically compute and store values directly inside the metrics dictionary state profile
        let total = 0, approved = 0, pending = 0;
        claims.forEach((claim) => {
          const claimAmount = claim.grandTotal || claim.totalAmount || 0;
          total += claimAmount;
          
          const status = (claim.approvalStatus || 'Pending').toLowerCase();
          if (status === 'approved') {
            approved += claimAmount;
          } else if (status === 'pending') {
            pending += claimAmount;
          }
        });

        setMetrics({
          totalExpenses: total,
          approvedClaims: approved,
          pendingApproval: pending,
          reimbursement: 0.00
        });

      } else {
        console.warn("⚠️ [DEBUG] Backend returned success: false or invalid map context format.");
      }
    } catch (error) {
      console.error("❌ [DEBUG] Connection failed to Spring Boot context:", error);
    } finally {
      setLoading(false);
      console.log("============= [FETCH END] =============");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Combined Search, Category, and Date Filter Engine
  useEffect(() => {
    let output = [...claimsList];

    // 1. Filter by Tab selection layout context
    if (activeTab !== 'All Expenses') {
      output = output.filter(c => (c.approvalStatus || 'Pending').toLowerCase() === activeTab.toLowerCase());
    }

    // 2. Filter by search text query string context matches
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      output = output.filter(c => 
        (c.expenseReferenceNo || '').toLowerCase().includes(q) ||
        (c.employeeName || '').toLowerCase().includes(q) ||
        (c.expenseCategory || '').toLowerCase().includes(q)
      );
    }

    // 3. Filter by Category Dropdown selector context boundaries
    if (selectedCategory !== 'All Categories') {
      output = output.filter(c => (c.expenseCategory || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // 4. Filter by Date matching context boundaries
    if (selectedDate) {
      output = output.filter(c => {
        if (!c.claimDate) return false;
        const claimDateObj = new Date(Number(c.claimDate) || c.claimDate);
        const targetDateObj = new Date(selectedDate);
        return claimDateObj.toDateString() === targetDateObj.toDateString();
      });
    }

    setFilteredList(output);
  }, [searchQuery, selectedCategory, selectedDate, activeTab, claimsList]);

 const handleClaimRowSelection = async (targetId: string, refNo: string) => {
  try {
    setActionLoading(true);
    console.log(`👆 [DEBUG] Clicked Row Item ID: ${targetId}`);

    // 1. Locate the selected claim item from the current state array list
    const selectedRecord = claimsList.find((c) => c.id === targetId);

    if (selectedRecord) {
      // 2. Safely grab the active company raw object from the record or fallback metadata references
      const rawCompany = selectedRecord.company || companyMeta || companyInfo || {};
      
      // 3. Extract the nested address block fields from the backend response structure
      const nestedAddress = rawCompany.address || {};

      // 4. 🌟 FLATTEN KEYWORDS: Map the nested JSON values to flat properties so details.tsx reads them easily
      const processedCompany = {
        name: rawCompany.name || "N/A",
        gstin: rawCompany.gstin || "N/A",
        // Extract out of the nested sub-object matching your exact backend console layout mapping
        area: nestedAddress.area || rawCompany.area || "",
        city: nestedAddress.city || rawCompany.city || "N/A",
        state: nestedAddress.state || rawCompany.state || "",
        country: nestedAddress.country || rawCompany.country || ""
      };

      // 5. Combine everything together cleanly into your stringified parameters routing payload
      const targetPayload = {
        ...selectedRecord,
        company: processedCompany
      };

      console.log("✅ [DEBUG] Navigating to details with flattened company payload data fields...");
      
      router.push({
        pathname: '/expenses/details',
        params: {
          id: targetId,
          data: JSON.stringify(targetPayload) 
        }
      });
    } else {
      console.warn("⚠️ [DEBUG] Record not found locally in claimsList array.");
    }
  } catch (error) {
    console.error(`❌ [DEBUG] Failed executing selection profile routing process:`, error);
  } finally {
    setActionLoading(false);
  }
};

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAlignment]}>
        <ActivityIndicator size="large" color="#0056FA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      {actionLoading && (
        <View style={styles.fullscreenOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: '#FFF', marginTop: 10, fontWeight: '500' }}>Loading Details...</Text>
        </View>
      )}

      {/* Header Dashboard Profile Branding */}
      <View style={styles.actionAppBar}>
        <View>
          <Text style={styles.corporateBrandTitle}>{'Expenses'}</Text>
          <Text style={styles.corporateBrandSub}>Manage and track your expenses</Text>
        </View>
        <TouchableOpacity style={styles.actionLaunchButton} onPress={() => router.push('/expenses/create')}>
          <Text style={styles.actionLaunchButtonText}>+ New Expense</Text>
        </TouchableOpacity>
      </View>

      <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
        
        {/* Metric Cards Carousel Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsWrapperRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabelText}>TOTAL EXPENSES</Text>
            <Text style={styles.metricValueText}>₹ {metrics.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.metricSubTextMuted}>All submitted claims</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabelText}>APPROVED CLAIMS</Text>
            <Text style={styles.metricValueText}>₹ {metrics.approvedClaims.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <Text style={[styles.metricSubTextMuted, { color: '#16A34A' }]}>Approved amount</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabelText}>PENDING APPROVAL</Text>
            <Text style={styles.metricValueText}>₹ {metrics.pendingApproval.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <Text style={[styles.metricSubTextMuted, { color: '#D97706' }]}>Awaiting review</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabelText}>REIMBURSEMENT</Text>
            <Text style={styles.metricValueText}>₹ {metrics.reimbursement.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <Text style={[styles.metricSubTextMuted, { color: '#2563EB' }]}>Ready for payout</Text>
          </View>
        </ScrollView>

        {/* Tab Filters */}
        <View style={styles.tabBarContainer}>
          {['All Expenses', 'Approved', 'Pending', 'Rejected'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabNavigationButton, activeTab === tab && styles.tabNavigationButtonActive]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔍 FILTER ACTION PANEL ROW */}
        <View style={styles.filterControlRowContainer}>
          <View style={styles.searchBoxFrame}>
            <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchBarInputElement}
              placeholder="Search expenses..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories Popover dropdown selector */}
          <View style={{ zIndex: 1000 }}>
            <TouchableOpacity 
              style={styles.dropdownTriggerActionField} 
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowCalendarModal(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownSelectorValueLabel} numberOfLines={1}>{selectedCategory}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.floatingDropdownMenuPopoverCard}>
                {['All Categories', 'Local Conveyance', 'Lodging', 'Meals', 'Transportation', 'Accommodation', 'Others'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownSelectableItemLine}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemTextLabel, selectedCategory === cat && { color: '#0056FA', fontWeight: '600' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 📅 INTERACTIVE CALENDAR SELECTION TRIGGER */}
          <TouchableOpacity 
            style={styles.calendarInlineInputBoxFrame} 
            onPress={() => {
              setShowCalendarModal(true);
              setShowCategoryDropdown(false);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.calendarDateStringTextDisplay}>{selectedDate}</Text>
          </TouchableOpacity>
        </View>

        {/* 🎚️ Horizontal Sliding Row Component Table Grid Container */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} contentContainerStyle={styles.horizontalTableScrollContainer}>
          <View style={styles.tableInnerBoundaryFrame}>
            
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Claim Date</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>Ref No</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>Employee Name</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>Department</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2.0 }]}>Category</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Project</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'center' }]}>Status</Text>
            </View>

            <FlatList
              data={filteredList}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyContainerFallback}>
                  <Text style={styles.fallbackMutedText}>No matching data available for these filters.</Text>
                  <TouchableOpacity 
                    style={styles.clearFiltersButton} 
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Categories');
                      setSelectedDate('');
                    }}
                  >
                    <Text style={styles.clearFiltersButtonText}>Reset All Filters</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => {
                const displayDate = item.claimDate
                  ? new Date(Number(item.claimDate) || item.claimDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})
                  : 'N/A';

                return (
                  <TouchableOpacity
                    style={styles.tableDataRow}
                    onPress={() => handleClaimRowSelection(item.id, item.expenseReferenceNo || 'N/A')}
                  >
                    <Text style={[styles.tableDataCell, { flex: 1.2, color: '#475569' }]}>{displayDate}</Text>
                    <Text style={[styles.tableDataCell, { flex: 1.8, fontWeight: '600', color: '#0056FA' }]}>{item.expenseReferenceNo || 'N/A'}</Text>
                    <Text style={[styles.tableDataCell, { flex: 2.2, fontWeight: '600', color: '#334155' }]} numberOfLines={1}>{item.employeeName || 'Unknown'}</Text>
                    <Text style={[styles.tableDataCell, { flex: 1.8, color: '#64748B' }]} numberOfLines={1}>{item.department || 'Operations'}</Text>
                    <Text style={[styles.tableDataCell, { flex: 2.0, color: '#334155', fontWeight: '500' }]} numberOfLines={1}>{item.expenseCategory || 'General'}</Text>
                    <Text style={[styles.tableDataCell, { flex: 1.2, color: '#64748B' }]}>{item.projectName || '--'}</Text>
                    <Text style={[styles.tableDataCell, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: '#1E293B' }]}>₹{(item.grandTotal || item.totalAmount || 0).toFixed(2)}</Text>

                    <View style={[styles.badgeContainerCell, { flex: 1.5 }]}>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: (item.approvalStatus?.toLowerCase() === 'approved') ? '#E6F4EA' : '#FFF4E5' }
                      ]}>
                        <Text style={[styles.statusBadgeText, { color: (item.approvalStatus?.toLowerCase() === 'approved') ? '#137333' : '#B25E00' }]}>
                          {item.approvalStatus || 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </ScrollView>
      </ScrollView>

      {/* 🗓️ POPUP CALENDAR MODAL OVERLAY ENGINE */}
      <Modal transparent={true} visible={showCalendarModal} animationType="fade" onRequestClose={() => setShowCalendarModal(false)}>
        <TouchableOpacity style={styles.modalBlurOverlay} activeOpacity={1} onPress={() => setShowCalendarModal(false)}>
          <View style={styles.calendarPickerContainerBox} onStartShouldSetResponder={() => true}>
            <View style={styles.calendarModalHeader}>
              <Text style={styles.calendarModalTitle}>Select Claim Date</Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.monthSublabel}>July 2026</Text>
            
            <View style={styles.daysGridContainer}>
              {daysInJuly.map((day) => {
                const dayString = `2026-07-${day < 10 ? '0' + day : day}`;
                const isSelected = selectedDate === dayString;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayItemCell, isSelected && styles.dayItemCellSelected]}
                    onPress={() => {
                      setSelectedDate(dayString);
                      setShowCalendarModal(false);
                    }}
                  >
                    <Text style={[styles.dayItemText, isSelected && { color: '#FFF', fontWeight: '700' }]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity 
              style={styles.clearDateButton} 
              onPress={() => {
                setSelectedDate('');
                setShowCalendarModal(false);
              }}
            >
              <Text style={styles.clearDateButtonText}>Clear Date Filter</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerAlignment: { justifyContent: 'center', alignItems: 'center' },
  fullscreenOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  actionAppBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  corporateBrandTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' },
  corporateBrandSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  actionLaunchButton: { backgroundColor: '#0056FA', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionLaunchButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  
  metricsWrapperRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  metricCard: { backgroundColor: '#FFF', width: windowWidth * 0.44, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  metricLabelText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  metricValueText: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 4 },
  metricSubTextMuted: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  
  tabBarContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingHorizontal: 16, backgroundColor: '#FFF', marginBottom: 0 },
  tabNavigationButton: { paddingVertical: 12, marginRight: 18, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabNavigationButtonActive: { borderBottomColor: '#0056FA' },
  tabButtonText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  tabButtonTextActive: { color: '#0056FA', fontWeight: '600' },

  filterControlRowContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', gap: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 500 },
  searchBoxFrame: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, paddingHorizontal: 10, height: 38 },
  searchBarInputElement: { flex: 1, fontSize: 13, color: '#1E293B', paddingVertical: 0 },
  dropdownTriggerActionField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, paddingHorizontal: 12, width: 130, height: 38 },
  dropdownSelectorValueLabel: { fontSize: 13, color: '#1E293B' },
  floatingDropdownMenuPopoverCard: { position: 'absolute', top: 42, left: 0, width: 160, backgroundColor: '#FFF', borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3, paddingVertical: 4 },
  dropdownSelectableItemLine: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownItemTextLabel: { fontSize: 12.5, color: '#334155' },
  calendarInlineInputBoxFrame: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, paddingHorizontal: 12, height: 38 },
  calendarDateStringTextDisplay: { fontSize: 13, color: '#1E293B' },

  // Interactive Custom Calendar Modal Styles
  modalBlurOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  calendarPickerContainerBox: { backgroundColor: '#FFF', width: '85%', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  calendarModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarModalTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  monthSublabel: { fontSize: 14, fontWeight: '600', color: '#0056FA', marginBottom: 14 },
  daysGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  dayItemCell: { width: windowWidth * 0.095, height: windowWidth * 0.095, backgroundColor: '#F1F5F9', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  dayItemCellSelected: { backgroundColor: '#0056FA' },
  dayItemText: { fontSize: 13, fontWeight: '500', color: '#334155' },
  clearDateButton: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12, alignItems: 'center' },
  clearDateButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },

  horizontalTableScrollContainer: { paddingVertical: 8 },
  tableInnerBoundaryFrame: { width: 980, backgroundColor: '#FFF' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#EDF2F7', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#CBD5E1', alignItems: 'center' },
  tableHeaderCell: { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableDataRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFF', alignItems: 'center' },
  tableDataCell: { fontSize: 12.5 },
  badgeContainerCell: { alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4, minWidth: 70, alignItems: 'center' },
  statusBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  
  emptyContainerFallback: { padding: 40, alignItems: 'center', width: '100%' },
  fallbackMutedText: { color: '#94A3B8', fontSize: 14, fontWeight: '500', marginBottom: 12 },
  clearFiltersButton: { backgroundColor: '#F1F5F9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  clearFiltersButtonText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  retryButton: { backgroundColor: '#0056FA', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  retryButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' }
});