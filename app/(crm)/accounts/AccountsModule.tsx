import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AccountItem,
  AccountTemplate,
  AccountStatus,
  fetchAccounts,
  fetchAccountTemplates,
  createCRMItem,
} from '@/app/config/crmService';

const COLUMN_WIDTHS = {
  checkbox: 40,
  accountName: 220,
  phone: 150,
  contactName: 150,
  followDate: 130,
  status: 110,
};

const TOTAL_TABLE_WIDTH = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0);

/**
 * Normalizes dynamic backend responses into a consistent UI object structure.
 * DEBUG NOTE: Check console logs if fields are rendering blank/empty!
 */
function normalizeAccountItem(raw: any, index: number): AccountItem {
  // DEBUGGER: Inspect raw object from server
 console.log(`[DEBUG] Raw Account Item #${index}:`, raw);

  const accountName =
    raw.companyName ||
    raw.company_Name ||
    raw.accountName ||
    raw.account_name ||
    raw.name ||
    raw.comapnyName||
    '--';

  const phone =
    raw.mobileNo ||
    raw.mobile_no ||
    raw.phone ||
    raw.phoneNumber ||
    raw.phone_number ||
    '--';

  const contactName =
    raw.contactPerson ||
    raw.contact_person ||
    raw.contactName ||
    raw.attendedByName ||
    (raw.firstName ? `${raw.firstName} ${raw.lastName || ''}`.trim() : null) ||
    '--';

  const followDate =
    raw.followUpDate ||
    raw.follow_up_date ||
    raw.followDate ||
    raw.follow_date ||
    raw.nextFollowUp ||
    '--';

  const subtitle =
    raw.subtitle ||
    (raw.viewedTime
      ? `Viewed · ${raw.viewedTime}`
      : raw.createDate || raw.created_at || raw.createdAt
      ? `Created · ${raw.createDate || raw.created_at || raw.createdAt}`
      : 'Recently');

  const avatarText =
    raw.avatarText ||
    (accountName !== '--'
      ? accountName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'AC');

  const status: AccountStatus =
    raw.status || raw.accountStatus || raw.stage || 'New';

  return {
    ...raw,
    id: raw.id || raw.crm_Id || raw.crmId || raw._id || String(index),
    name: accountName,
    phone,
    contactName,
    followDate,
    subtitle,
    avatarText,
    avatarBg: raw.avatarBg || '#e0f2fe',
    status,
  };
}

function getStatusStyle(status: AccountStatus) {
  switch (status) {
    case 'Active':
      return { backgroundColor: '#36cfc9' };
    case 'Not Active':
      return { backgroundColor: '#fadb14' };
    case 'New':
    default:
      return { backgroundColor: '#b7eb8f' };
  }
}

function getStatusTextStyle(status: AccountStatus) {
  if (status === 'Active') return { color: '#ffffff' };
  if (status === 'Not Active') return { color: '#333333' };
  return { color: '#278000' };
}

export function CreateAccountModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [accountName, setAccountName] = useState('');
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accountOwner, setAccountOwner] = useState('crm manager');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<AccountTemplate[]>([]);

  useEffect(() => {
    if (visible) {
      fetchAccountTemplates()
        .then((res) => setTemplates(res || []))
        .catch((err) => console.log('[DEBUG] Failed to load account templates:', err));
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!accountName.trim() || !firstName.trim() || !email.trim()) {
      Alert.alert('Required Fields Missing', 'Please fill in Account Name, First Name, and Email.');
      return;
    }

    setSubmitting(true);
    const payload = {
      companyName: accountName,
      title,
      firstName,
      lastName,
      owner: accountOwner,
      annualRevenue,
      email,
      mobileNo: phone,
      description,
      type: 'Accounts',
    };

    // DEBUGGER: Log payload sent to server
    // console.log('[DEBUG] Submitting Create Account Payload:', payload);

    const success = await createCRMItem(payload);
    setSubmitting(false);

    if (success) {
      Alert.alert('Success', 'Account created successfully!');
      onCreated();
    } else {
      Alert.alert('Error', 'Unable to create account. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.blueIconBg}>
                <MaterialCommunityIcons name="file-document-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Create New Account</Text>
                <Text style={styles.modalSubtitle}>Create and organize your business accounts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {templates.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>Recent Templates / Accounts</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sideScroll}>
                  {templates.map((item) => (
                    <View key={item.id} style={styles.accountCard}>
                      <View style={styles.cardAvatar}>
                        <Text style={styles.cardAvatarText}>{item.initials}</Text>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>{item.email}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>{item.sub}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={[styles.sectionHeading, { color: '#2563eb', marginTop: 8 }]}>Account Information</Text>

            {/* Account Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Name *</Text>
              <View style={styles.inputBox}>
                <TextInput placeholder="Enter Account Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={accountName} onChangeText={setAccountName} />
              </View>
            </View>

            {/* Title, First Name, Last Name */}
            <View style={styles.rowGrid}>
              <View style={[styles.fieldGroup, { flex: 0.8 }]}>
                <Text style={styles.label}>Title</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="-- " placeholderTextColor="#9ca3af" style={styles.textInput} value={title} onChangeText={setTitle} />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1.1 }]}>
                <Text style={styles.label}>First Name *</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="Enter First Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1.1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="Enter Last Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>

            {/* Account Owner & Annual Revenue */}
            <View style={styles.rowGrid}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Account Owner</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="crm manager" placeholderTextColor="#9ca3af" style={styles.textInput} value={accountOwner} onChangeText={setAccountOwner} />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Annual Revenue</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="Select annual revenue" placeholderTextColor="#9ca3af" style={styles.textInput} value={annualRevenue} onChangeText={setAnnualRevenue} />
                </View>
              </View>
            </View>

            {/* Email & Phone */}
            <View style={styles.rowGrid}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Email *</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="Enter email address" placeholderTextColor="#9ca3af" keyboardType="email-address" style={styles.textInput} value={email} onChangeText={setEmail} />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Phone</Text>
                <View style={styles.inputBox}>
                  <TextInput placeholder="Enter phone" placeholderTextColor="#9ca3af" keyboardType="phone-pad" style={styles.textInput} value={phone} onChangeText={setPhone} />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputBox, { height: 70, paddingVertical: 6 }]}>
                <TextInput placeholder="Add description about this account" placeholderTextColor="#9ca3af" multiline numberOfLines={3} style={[styles.textInput, { textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.closeModalBtn}>
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.submitModalBtn}>
              {submitting ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.submitModalBtnText}>+ Create Account</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function AccountsScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rawData = await fetchAccounts();
      // DEBUGGER: Verify response from server
      // console.log('[DEBUG] Raw fetchAccounts API output:', rawData);

      const normalized = (rawData || []).map((item: any, idx: number) =>
        normalizeAccountItem(item, idx)
      );

      setAccounts(normalized);
    } catch (err) {
      console.log('[DEBUG] Failed to load Accounts Data:', err);
      Alert.alert('Error', 'Unable to fetch account list from backend.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === accounts.length ? new Set() : new Set(accounts.map((a) => a.id)));
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1a30" translucent={false} />

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.pageHeaderContainer}>
          <View>
            <Text style={styles.pageTitle}>Accounts</Text>
            <Text style={styles.pageSubTitle}>Manage your accounts and customer relationships</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.createBtnText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0052cc" />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={{ width: TOTAL_TABLE_WIDTH }}>
              <View style={styles.tableHeaderRow}>
                <TouchableOpacity style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.checkbox }]} onPress={toggleSelectAll}>
                  <View style={[styles.checkbox, selectedIds.size === accounts.length && selectedIds.size > 0 && styles.checkboxChecked]} />
                </TouchableOpacity>
                <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.accountName }]}>Account Name</Text>
                <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.phone }]}>Phone</Text>
                <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.contactName }]}>Contact Name</Text>
                <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.followDate }]}>Follow Date</Text>
                <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.status }]}>Status</Text>
              </View>

              {accounts.map((item) => (
                <View key={item.id} style={styles.tableBodyRow}>
                  <TouchableOpacity style={[styles.tableCell, { width: COLUMN_WIDTHS.checkbox }]} onPress={() => toggleSelectRow(item.id)}>
                    <View style={[styles.checkbox, selectedIds.has(item.id) && styles.checkboxChecked]} />
                  </TouchableOpacity>
                  
                  <View style={[styles.tableCell, { width: COLUMN_WIDTHS.accountName, flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[styles.avatarBadge, { backgroundColor: item.avatarBg }]}>
                      <Text style={styles.avatarText}>{item.avatarText}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.accountNameText} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.accountSubtitleText} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                  </View>

                  <Text style={[styles.tableCell, styles.cellText, { width: COLUMN_WIDTHS.phone }]}>{item.phone}</Text>
                  <Text style={[styles.tableCell, styles.cellText, { width: COLUMN_WIDTHS.contactName }]}>{item.contactName}</Text>
                  <Text style={[styles.tableCell, styles.cellText, { width: COLUMN_WIDTHS.followDate }]}>{item.followDate}</Text>
                  
                  <View style={[styles.tableCell, { width: COLUMN_WIDTHS.status }]}>
                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                      <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>

      <CreateAccountModal visible={isModalVisible} onClose={() => setModalVisible(false)} onCreated={() => { setModalVisible(false); loadData(); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  pageHeaderContainer: { backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  pageSubTitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
  createBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  createBtnText: { color: '#ffffff', fontWeight: '600' },
  loaderContainer: { padding: 40, alignItems: 'center' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#eef2f6', paddingVertical: 10 },
  tableHeaderCell: { justifyContent: 'center', alignItems: 'center' },
  tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#334155', paddingHorizontal: 8 },
  tableBodyRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center', minHeight: 52 },
  tableCell: { paddingHorizontal: 8, justifyContent: 'center' },
  cellText: { fontSize: 12, color: '#334155' },
  checkbox: { width: 16, height: 16, borderWidth: 1, borderColor: '#94a3b8', borderRadius: 3 },
  checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  avatarBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { fontSize: 11, fontWeight: 'bold', color: '#0284c7' },
  accountNameText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  accountSubtitleText: { fontSize: 10, color: '#0284c7' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  blueIconBg: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 11, color: '#64748b' },
  modalBody: { padding: 16 },
  sectionHeading: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  sideScroll: { marginBottom: 12 },
  accountCard: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginRight: 8, width: 130, borderWidth: 1, borderColor: '#e2e8f0' },
  cardAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  cardAvatarText: { fontSize: 12, fontWeight: 'bold' },
  cardTitle: { fontSize: 12, fontWeight: '600' },
  cardSub: { fontSize: 10, color: '#64748b' },
  fieldGroup: { marginBottom: 12 },
  rowGrid: { flexDirection: 'row', gap: 8 },
  label: { fontSize: 12, fontWeight: '500', color: '#374151', marginBottom: 4 },
  inputBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 8, height: 38, justifyContent: 'center' },
  textInput: { fontSize: 13, color: '#111827' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  closeModalBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' },
  closeModalBtnText: { color: '#374151', fontSize: 13 },
  submitModalBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  submitModalBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
});