import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StatusBar,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { KanbanStage } from '@/types/contacts';
import { fetchKanbanData } from '@/app/config/crmService';
import CreateContactModal from '@/app/(crm)/contacts/CreateContactModal';
import { Stack, useRouter, useFocusEffect } from 'expo-router';

// Helper for Initials
const getInitials = (name: string): string => {
  if (!name) return 'CT';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper for Avatar Background Colors
const getAvatarBg = (index: number): string => {
  const colors = ['#fce7f3', '#e0e7ff', '#fef3c7', '#dcfce7', '#e0f2fe', '#f3e8ff'];
  return colors[index % colors.length];
};

const getAvatarTextColor = (index: number): string => {
  const colors = ['#be185d', '#3730a3', '#b45309', '#15803d', '#0369a1', '#6b21a8'];
  return colors[index % colors.length];
};

// Helper for Status Badge Styling
const getStatusBadgeStyle = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('not qualified') || s.includes('lost')) return { bg: '#f97316', text: '#ffffff' };
  if (s.includes('contact')) return { bg: '#2dd4bf', text: '#ffffff' };
  if (s.includes('discussion') || s.includes('negotiation')) return { bg: '#818cf8', text: '#ffffff' };
  return { bg: '#2563eb', text: '#ffffff' }; // Default Active status
};

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter State
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchKanbanData('Contacts');
      let parsedContacts: any[] = [];
      if (Array.isArray(response)) {
        if (response.length > 0 && response[0].contacts) {
          parsedContacts = response.flatMap((stage: KanbanStage) =>
            (stage.contacts || []).map((contact) => ({
              ...contact,
              stageLabel: stage.label || contact.status || 'New',
              stageColor: stage.color,
            }))
          );
        } else {
          parsedContacts = response.map((contact: any) => ({
            ...contact,
            stageLabel: contact.status || contact.kanbanName || 'New',
            stageColor: contact.status === 'Negotiation' ? '#f59e0b' : '#3b82f6',
          }));
        }
      }
      setContacts(parsedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
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

  // Filter & Search Logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Status Filter
      const displayStatus = contact.status || contact.stageLabel || 'New';
      if (
        selectedStatusFilter !== 'All' &&
        displayStatus.toLowerCase() !== selectedStatusFilter.toLowerCase()
      ) {
        return false;
      }

      // Search Query Filter
      if (!searchQuery || searchQuery.trim() === '') return true;
      const query = searchQuery.trim().toLowerCase();
      const contactName = (
        contact.contact_Person ||
        contact.contactName ||
        contact.name ||
        contact.title ||
        ''
      ).toLowerCase();
      const company = (contact.company_Name || contact.companyName || '').toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      return contactName.includes(query) || company.includes(query) || phone.includes(query);
    });
  }, [contacts, searchQuery, selectedStatusFilter]);

  // Paginated Data Logic
  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredContacts.slice(startIdx, startIdx + pageSize);
  }, [filteredContacts, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getContactId = (item: any, index: number) => item.crm_Id || item.id || `contact-${index}`;

  const renderContactCard = ({ item, index }: { item: any; index: number }) => {
    const displayName =
      item.contact_Person || item.contactName || item.name || item.title || 'Unnamed Contact';
    const displayCompany = item.company_Name || item.companyName || '--';
    const displayStatus = item.status || item.stageLabel || 'New';
    const follow_Date = item.follow_Date
      ? `Follow-up : ${item.follow_Date}`
      : item.viewedTime
      ? `Viewed : ${item.viewedTime}`
      : `follow date: · ${item.follow_Date || '--'}`;

    const avatarBg = getAvatarBg(index);
    const avatarTextColor = getAvatarTextColor(index);
    const badgeStyle = getStatusBadgeStyle(displayStatus);

    const callsCount = item.scheduleCall || item.callsCount || item.callCount || 0;
    const meetingsCount = item.meeting || item.videoCallsCount || item.meetUpCount || 0;
    const mailsCount = item.mail || item.MailsCount || item.mailUpCount || 0;

    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.cardContainer}>
        {/* Left Avatar */}
        <View style={[styles.avatarBox, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarTextColor }]}>
            {getInitials(displayName)}
          </Text>
        </View>

        {/* Center Content */}
        <View style={styles.cardMain}>
          <Text style={styles.contactName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
           Company Name: {displayCompany}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {follow_Date}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.cardRight}>
          <View style={styles.rightTopRow}>
            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={styles.statusBadgeText}>{displayStatus}</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-vertical" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionChipsRow}>
            <TouchableOpacity style={styles.actionPill}>
              <Feather name="phone" size={11} color="#2563eb" />
              <View style={[styles.badgeCircle, { backgroundColor: '#ef4444' }]}>
                <Text style={styles.badgeCircleText}>{callsCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill}>
              <FontAwesome5 name="handshake" size={11} color="#2563eb" />
              <View style={[styles.badgeCircle, { backgroundColor: '#f97316' }]}>
                <Text style={styles.badgeCircleText}>{meetingsCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill}>
              <Feather name="mail" size={11} color="#2563eb" />
               <View style={[styles.badgeCircle, { backgroundColor: '#f97316' }]}>
                <Text style={styles.badgeCircleText}>{mailsCount}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Contacts</Text>
            <Text style={styles.headerSubtitle}>Manage contacts and communication details</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Filter Toggle */}
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => setShowFilterBar((prev) => !prev)}
          >
            <Feather name="filter" size={18} color="#2563eb" />
            <View style={styles.filterDot} />
          </TouchableOpacity>

          {/* + Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.createBtnText}>+ Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Functional Filter Bar */}
      {showFilterBar && (
        <View style={styles.filterChipBar}>
          {['All', 'New', 'Contacted', 'Not Qualified'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedStatusFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => {
                setSelectedStatusFilter(filter);
                setCurrentPage(1);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatusFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Full-width Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search contacts by name, company, phone..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setCurrentPage(1);
            }}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={15} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pagination & Dynamic Dropdown Bar */}
      <View style={styles.paginationRow}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.showDropdown}
            onPress={() => setShowPageSizeMenu((prev) => !prev)}
          >
            <Text style={styles.showText}>Show : {pageSize}</Text>
            <Feather name="chevron-down" size={12} color="#475569" />
          </TouchableOpacity>

          {/* Page Size Options Menu */}
          {showPageSizeMenu && (
            <View style={styles.dropdownMenu}>
              {[25, 50, 100].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                    setShowPageSizeMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      pageSize === size && styles.dropdownOptionSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Dynamic Page Navigation */}
        <View style={styles.pagePills}>
          <TouchableOpacity
            style={styles.arrowPageBtn}
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Feather
              name="chevron-left"
              size={14}
              color={currentPage === 1 ? '#cbd5e1' : '#475569'}
            />
          </TouchableOpacity>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageNumberBtn,
                currentPage === page && styles.pageNumberActive,
              ]}
              onPress={() => handlePageChange(page)}
            >
              <Text
                style={
                  currentPage === page
                    ? styles.pageNumberActiveText
                    : styles.pageNumberText
                }
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.arrowPageBtn}
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Feather
              name="chevron-right"
              size={14}
              color={currentPage === totalPages ? '#cbd5e1' : '#475569'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>Total : {filteredContacts.length}</Text>
        </View>
      </View>

      {/* Main Contact Card List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={paginatedContacts}
          keyExtractor={(item, index) => getContactId(item, index)}
          renderItem={renderContactCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="file-text" size={32} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Contacts Found</Text>
              <Text style={styles.emptyStateSub}>
                No contacts match your search query or selected filters.
              </Text>
              <TouchableOpacity
                style={styles.addContactBtn}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.addContactBtnText}>+ Add Contact</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <CreateContactModal
          onClose={() => setIsModalVisible(false)}
          onRefresh={loadData}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
     paddingLeft:4,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 6, marginRight: 8, borderRadius: 8, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  headerSubtitle: { fontSize: 11, color: '#64748b', marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { marginRight: 10, position: 'relative', padding: 6 },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  createBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

  /* Filter Chip Bar */
  filterChipBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterChipText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  filterChipTextActive: { color: '#ffffff', fontWeight: '700' },

  /* Search Section */
  searchSection: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#0f172a' },

  /* Pagination Row */
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    zIndex: 10,
  },
  showDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  showText: { fontSize: 11, color: '#1e293b', fontWeight: '600', marginRight: 4 },

  /* Dropdown Menu */
  dropdownMenu: {
    position: 'absolute',
    top: 30,
    left: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    width: 80,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 99,
  },
  dropdownOption: { paddingVertical: 8, paddingHorizontal: 12 },
  dropdownOptionText: { fontSize: 11, color: '#334155' },
  dropdownOptionSelected: { fontWeight: '700', color: '#2563eb' },

  pagePills: { flexDirection: 'row', alignItems: 'center' },
  arrowPageBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  pageNumberBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  pageNumberActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  pageNumberActiveText: { fontSize: 11, fontWeight: '700', color: '#2563eb' },
  pageNumberText: { fontSize: 11, color: '#475569' },
  totalBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#2563eb' },

  /* Card Item */
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { fontSize: 12, fontWeight: '700' },
  cardMain: { flex: 1, marginRight: 6 },
  contactName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  companyName: { fontSize: 11, color: '#475569', marginTop: 1 },
  subtitleText: { fontSize: 10, color: '#2563eb', marginTop: 3 },

  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  rightTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 2,
  },
  statusBadgeText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  moreBtn: { padding: 2 },

  actionChipsRow: { flexDirection: 'row', alignItems: 'center' },
  actionPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  badgeCircle: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCircleText: { color: '#ffffff', fontSize: 8, fontWeight: '700' },

  /* Loader & Empty State */
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyStateTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginTop: 8 },
  emptyStateSub: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginVertical: 4 },
  addContactBtn: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addContactBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
});