import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StatusBar
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { KanbanStage } from '@/types/leads';
import { fetchKanbanData } from '@/app/config/crmService';
import CreateLeadModal from '@/app/(crm)/leads/CreateLeadModal';
import { Stack, useRouter, useFocusEffect } from 'expo-router';

export default function LeadsScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchKanbanData('Leads');
      let parsedLeads: any[] = [];
      if (Array.isArray(response)) {
        if (response.length > 0 && response[0].leads) {
          parsedLeads = response.flatMap((stage: KanbanStage) =>
            (stage.leads || []).map((lead) => ({
              ...lead,
              stageLabel: stage.label || lead.status,
              stageColor: stage.color,
            }))
          );
        } else {
          parsedLeads = response.map((lead: any) => ({
            ...lead,
            stageLabel: lead.status || lead.kanbanName || 'New',
            stageColor: lead.status === 'Negotiation' ? '#f59e0b' : '#3b82f6',
          }));
        }
      }
      setLeads(parsedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery || searchQuery.trim() === '') return true;
    const query = searchQuery.trim().toLowerCase();
    const leadName = (lead.contact_Person || lead.contactName || lead.name || lead.title || '').toLowerCase();
    const company = (lead.company_Name || lead.companyName || '').toLowerCase();
    const phone = (lead.phone || '').toLowerCase();
    return leadName.includes(query) || company.includes(query) || phone.includes(query);
  });

  // Unique ID Helper
  const getLeadId = (item: any, index: number) => item.crm_Id || item.id || `lead-${index}`;

  // Selection Logic
  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every((item, idx) => selectedRows[getLeadId(item, idx)]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows({});
    } else {
      const allSelected: { [key: string]: boolean } = {};
      filteredLeads.forEach((item, idx) => {
        allSelected[getLeadId(item, idx)] = true;
      });
      setSelectedRows(allSelected);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderTableRow = ({ item, index }: { item: any; index: number }) => {
    const leadId = getLeadId(item, index);
    const isSelected = !!selectedRows[leadId];
    const displayName = item.contact_Person || item.contactName || item.name || item.title || 'Unnamed Lead';
    const displayCompany = item.company_Name || item.companyName || '--';
    const displayPhone = item.phone || '--';
    const displayDate = item.follow_Date || item.followUpDate || '--';

    return (
      <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
        <TouchableOpacity style={styles.checkboxCell} onPress={() => toggleSelectRow(leadId)}>
          <View style={[styles.checkboxBox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Feather name="check" size={12} color="#ffffff" />}
          </View>
        </TouchableOpacity>

        <View style={[styles.cell, styles.colName]}>
          <Text style={styles.cellTextBold} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View style={[styles.cell, styles.colCompany]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {displayCompany}
          </Text>
        </View>

        <View style={[styles.cell, styles.colPhone]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {displayPhone}
          </Text>
        </View>

        <View style={[styles.cell, styles.colFollowDate]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {displayDate}
          </Text>
        </View>

        <View style={[styles.cell, styles.colStatus]}>
          {item.status ? (
            <View style={[styles.statusTagPill, item.status === 'Not Qualified' ? styles.tagUpdated : styles.tagViewed]}>
              <Text style={[styles.statusTagText, item.status === 'Not Qualified' ? styles.tagUpdatedText : styles.tagViewedText]} numberOfLines={1}>
                ● {item.status}
              </Text>
            </View>
          ) : (
            <Text style={styles.cellText}>--</Text>
          )}
        </View>

        <View style={[styles.cell, styles.colActivity]}>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <Feather name="phone-call" size={11} color="#0284c7" />
              <Text style={styles.activityCount}>{item.call || item.callsCount || 0}</Text>
            </View>
            <View style={styles.activityItem}>
              <Feather name="video" size={11} color="#7c3aed" />
              <Text style={styles.activityCount}>{item.meeting || item.videoCallsCount || 0}</Text>
            </View>
            <View style={styles.activityItem}>
              <Feather name="mail" size={11} color="#ea580c" />
              <Text style={styles.activityCount}>{item.mail || item.mailsCount || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Leads</Text>
            <Text style={styles.headerSubtitle}>Manage your leads & track progress</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.whatsAppBtn}>
            <FontAwesome name="whatsapp" size={16} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callHeaderBtn}>
            <Feather name="phone" size={13} color="#fff" />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.createBtnText}>+ Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity style={styles.filterPill}>
            <Feather name="filter" size={12} color="#475569" />
            <Text style={styles.filterText}>Filter</Text>
            <Feather name="chevron-down" size={12} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Feather name="calendar" size={12} color="#475569" />
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <View style={styles.quickDialContainer}>
            <Text style={styles.countryCode}>IN +91</Text>
            <TextInput
              placeholder="Enter num"
              value={quickPhone}
              onChangeText={setQuickPhone}
              keyboardType="phone-pad"
              style={styles.quickDialInput}
            />
          </View>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={15} color="#94a3b8" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search leads by name, company, phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>Total : {filteredLeads.length}</Text>
        </View>
      </View>

      {/* Main Table */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableHorizontalScrollView}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <TouchableOpacity style={styles.checkboxCell} onPress={toggleSelectAll}>
                <View style={[styles.checkboxBox, isAllSelected && styles.checkboxChecked]}>
                  {isAllSelected && <Feather name="check" size={12} color="#ffffff" />}
                </View>
              </TouchableOpacity>
              <View style={[styles.headerCell, styles.colName]}>
                <Text style={styles.headerCellText}>Lead Name</Text>
              </View>
              <View style={[styles.headerCell, styles.colCompany]}>
                <Text style={styles.headerCellText}>Company Name</Text>
              </View>
              <View style={[styles.headerCell, styles.colPhone]}>
                <Text style={styles.headerCellText}>Phone</Text>
              </View>
              <View style={[styles.headerCell, styles.colFollowDate]}>
                <Text style={styles.headerCellText}>Follow Date</Text>
              </View>
              <View style={[styles.headerCell, styles.colStatus]}>
                <Text style={styles.headerCellText}>Status</Text>
              </View>
              <View style={[styles.headerCell, styles.colActivity]}>
                <Text style={styles.headerCellText}>Activity</Text>
              </View>
            </View>

            <FlatList
              data={filteredLeads}
              keyExtractor={(item, index) => getLeadId(item, index)}
              renderItem={renderTableRow}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="file-text" size={32} color="#cbd5e1" />
                  <Text style={styles.emptyStateTitle}>No Leads Found</Text>
                  <Text style={styles.emptyStateSub}>No leads match your current parameters or search term.</Text>
                  <TouchableOpacity style={styles.addLeadBtn} onPress={() => setIsModalVisible(true)}>
                    <Text style={styles.addLeadBtnText}>+ Add Lead</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <CreateLeadModal onClose={() => setIsModalVisible(false)} onRefresh={loadData} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 6, marginRight: 8, borderRadius: 8, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  headerSubtitle: { fontSize: 11, color: '#64748b' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  whatsAppBtn: { padding: 7, marginRight: 6, backgroundColor: '#e8f5e9', borderRadius: 6 },
  callHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  callBtnText: { color: '#fff', fontSize: 12, marginLeft: 4, fontWeight: '600' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  filterSection: { marginVertical: 8, paddingHorizontal: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
  },
  filterText: { fontSize: 11, color: '#475569', marginHorizontal: 4, fontWeight: '500' },
  quickDialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 30,
  },
  countryCode: { fontSize: 11, color: '#64748b', marginRight: 4, fontWeight: '600' },
  quickDialInput: { fontSize: 11, minWidth: 80, color: '#0f172a' },
  checkboxCell: { width: 32, alignItems: 'center', justifyContent: 'center' },
  checkboxBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    flex: 1,
    height: 36,
    marginRight: 8,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#0f172a' },
  totalBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#0284c7' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  tableHorizontalScrollView: { flex: 1 },
  tableContainer: { flex: 1, minWidth: 850 },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerCell: { justifyContent: 'center' },
  headerCellText: { fontSize: 12, fontWeight: '700', color: '#475569', textTransform: 'uppercase' },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  evenRow: { backgroundColor: '#ffffff' },
  oddRow: { backgroundColor: '#f8fafc' },
  cell: { justifyContent: 'center' },
  cellText: { fontSize: 12, color: '#334155' },
  cellTextBold: { fontSize: 12, fontWeight: '600', color: '#0f172a' },

  colName: { width: 180 },
  colCompany: { width: 200 },
  colPhone: { width: 130 },
  colFollowDate: { width: 160 },
  colStatus: { width: 130 },
  colActivity: { width: 120 },

  activityContainer: { flexDirection: 'row', alignItems: 'center' },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  activityCount: { fontSize: 10, color: '#64748b', marginLeft: 2 },

  statusTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tagViewed: { backgroundColor: '#eff6ff' },
  tagViewedText: { color: '#2563eb' },
  tagUpdated: { backgroundColor: '#fff7ed' },
  tagUpdatedText: { color: '#ea580c' },
  statusTagText: { fontSize: 10, fontWeight: '600' },

  listContent: { paddingBottom: 24 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyStateTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginTop: 8 },
  emptyStateSub: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginVertical: 4 },
  addLeadBtn: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addLeadBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});