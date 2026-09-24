// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
// } from 'react-native';
// import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import {
//   AccountItem,
//   AccountStatus,
//   fetchAccounts,
//   createCRMItem,
// } from '@/app/config/crmService';

// const COLUMN_WIDTHS = {
//   checkbox: 40,
//   accountName: 220,
//   phone: 150,
//   contactName: 150,
//   followDate: 130,
//   status: 110,
// };

// const TOTAL_TABLE_WIDTH = Object.values(COLUMN_WIDTHS).reduce((a, b) => a + b, 0);

// function getStatusStyle(status: AccountStatus) {
//   switch (status) {
//     case 'Active':
//       return { backgroundColor: '#36cfc9' };
//     case 'Not Active':
//       return { backgroundColor: '#fadb14' };
//     case 'Prospect':
//       return { backgroundColor: '#cabce4' };
//     case 'New':
//     default:
//       return { backgroundColor: '#b7eb8f' };
//   }
// }

// function getStatusTextStyle(status: AccountStatus) {
//   if (status === 'Active') return { color: '#ffffff' };
//   if (status === 'Not Active') return { color: '#333333' };
//   return { color: '#278000' };
// }

// export function CreateAccountModal({
//   visible,
//   onClose,
//   onCreated,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onCreated: (newItem?: any) => void;
// }) {
//   const [accountName, setAccountName] = useState('');
//   const [title, setTitle] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [accountOwner, setAccountOwner] = useState('crm manager');
//   const [annualRevenue, setAnnualRevenue] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [summary, setDescription] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const resetForm = () => {
//     setAccountName('');
//     setTitle('');
//     setFirstName('');
//     setLastName('');
//     setEmail('');
//     setPhone('');
//     setDescription('');
//     setAnnualRevenue('');
//   };

//   const handleSubmit = async () => {
//     if (!accountName.trim() || !firstName.trim() || !email.trim()) {
//       Alert.alert('Required Fields Missing', 'Please fill in Account Name, First Name, and Email.');
//       return;
//     }
//     setSubmitting(true);

//     const now = new Date();
//     const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()} ${now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

//     const payload = {
//       company_Name: accountName.trim(),
//       title: title.trim(),
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       contact_Person: `${firstName.trim()} ${lastName.trim()}`.trim(),
//       owner: accountOwner,
//       annualRevenue: annualRevenue ? Number(annualRevenue) : 0,
//       email: email.trim(),
//       phone: phone.trim(),
//       mobileNo: phone.trim(),
//       summary: summary.trim(),
//       type: 'accounts',
//       date: formattedDate,
//     };

//     console.log('[DEBUG] Outgoing Payload:', JSON.stringify(payload, null, 2));

//     try {
//       const result = await createCRMItem(payload);
//       console.log('[DEBUG] Server Raw Response:', result);

//       if (result) {
//         Alert.alert('Success', 'Account created successfully!');
//         resetForm();
//         onCreated(typeof result === 'object' ? result : undefined);
//       } else {
//         Alert.alert('Backend Error', 'Server returned falsy response. Check database logs.');
//       }
//     } catch (err: any) {
//       console.error('[DEBUG Critical Exception]:', err?.response?.data || err.message || err);
//       Alert.alert('Error', `Save failed: ${err?.response?.data?.message || err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
//         <View style={styles.modalCard}>
//           <View style={styles.modalHeader}>
//             <View style={styles.headerTitleRow}>
//               <View style={styles.blueIconBg}>
//                 <MaterialCommunityIcons name="file-document-outline" size={20} color="#2563eb" />
//               </View>
//               <View>
//                 <Text style={styles.modalTitle}>Create New Account</Text>
//                 <Text style={styles.modalSubtitle}>Create and organize your business accounts</Text>
//               </View>
//             </View>
//             <TouchableOpacity onPress={onClose}>
//               <Ionicons name="close" size={20} color="#6b7280" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
//             <Text style={[styles.sectionHeading, { color: '#2563eb', marginTop: 8 }]}>Account Information</Text>

//             <View style={styles.fieldGroup}>
//               <Text style={styles.label}>Account Name *</Text>
//               <View style={styles.inputBox}>
//                 <TextInput placeholder="Enter Account Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={accountName} onChangeText={setAccountName} />
//               </View>
//             </View>

//             <View style={styles.rowGrid}>
//               <View style={[styles.fieldGroup, { flex: 0.8 }]}>
//                 <Text style={styles.label}>Title</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="-- " placeholderTextColor="#9ca3af" style={styles.textInput} value={title} onChangeText={setTitle} />
//                 </View>
//               </View>
//               <View style={[styles.fieldGroup, { flex: 1.1 }]}>
//                 <Text style={styles.label}>First Name *</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="Enter First Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={firstName} onChangeText={setFirstName} />
//                 </View>
//               </View>
//               <View style={[styles.fieldGroup, { flex: 1.1 }]}>
//                 <Text style={styles.label}>Last Name</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="Enter Last Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={lastName} onChangeText={setLastName} />
//                 </View>
//               </View>
//             </View>

//             <View style={styles.rowGrid}>
//               <View style={[styles.fieldGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Account Owner</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="crm manager" placeholderTextColor="#9ca3af" style={styles.textInput} value={accountOwner} onChangeText={setAccountOwner} />
//                 </View>
//               </View>
//               <View style={[styles.fieldGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Annual Revenue</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="Select annual revenue" placeholderTextColor="#9ca3af" keyboardType="numeric" style={styles.textInput} value={annualRevenue} onChangeText={setAnnualRevenue} />
//                 </View>
//               </View>
//             </View>

//             <View style={styles.rowGrid}>
//               <View style={[styles.fieldGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Email *</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="Enter email address" placeholderTextColor="#9ca3af" keyboardType="email-address" style={styles.textInput} value={email} onChangeText={setEmail} />
//                 </View>
//               </View>
//               <View style={[styles.fieldGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Phone</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput placeholder="Enter phone" placeholderTextColor="#9ca3af" keyboardType="phone-pad" style={styles.textInput} value={phone} onChangeText={setPhone} />
//                 </View>
//               </View>
//             </View>

//             <View style={styles.fieldGroup}>
//               <Text style={styles.label}>Description</Text>
//               <View style={[styles.inputBox, { height: 70, paddingVertical: 6 }]}>
//                 <TextInput placeholder="Add description about this account" placeholderTextColor="#9ca3af" multiline numberOfLines={3} style={[styles.textInput, { textAlignVertical: 'top' }]} value={summary} onChangeText={setDescription} />
//               </View>
//             </View>
//           </ScrollView>

//           <View style={styles.modalFooter}>
//             <TouchableOpacity onPress={onClose} style={styles.closeModalBtn}>
//               <Text style={styles.closeModalBtnText}>Close</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.submitModalBtn}>
//               {submitting ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.submitModalBtnText}>+ Create Account</Text>}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }

// export default function AccountsScreen() {
//   const [loading, setLoading] = useState<boolean>(true);
//   const [accounts, setAccounts] = useState<AccountItem[]>([]);
//   const [isModalVisible, setModalVisible] = useState<boolean>(false);
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const [quickPhone, setQuickPhone] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchAccounts();
//       console.log('[DEBUG] Refetched Accounts Count:', data.length);
//       console.log('[DEBUG] Refetched Accounts Data:', data);
//       console.log('Sample item:', data[0] || 'ARRAY IS EMPTY');
//       setAccounts(data);
//     } catch (err) {
//       console.log('[DEBUG] Failed to load Accounts Data:', err);
//       Alert.alert('Error', 'Unable to fetch account list from backend.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSelectAll = () => {
//     setSelectedIds(selectedIds.size === filteredAccounts.length ? new Set() : new Set(filteredAccounts.map((a) => a.id)));
//   };

//   const toggleSelectRow = (id: string) => {
//     const next = new Set(selectedIds);
//     if (next.has(id)) next.delete(id);
//     else next.add(id);
//     setSelectedIds(next);
//   };

//   const filteredAccounts = accounts.filter((item) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       item.name.toLowerCase().includes(q) ||
//       item.contactName.toLowerCase().includes(q) ||
//       item.phone.includes(q)
//     );
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0b1a30" translucent={false} />

//       <ScrollView style={{ flex: 1 }}>
//         <View style={styles.pageHeaderContainer}>
//           <View>
//             <Text style={styles.pageTitle}>Accounts</Text>
//             <Text style={styles.pageSubTitle}>Manage your accounts and customer relationships</Text>
//           </View>
//           <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
//             <Text style={styles.createBtnText}>+ Create</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.filterSection}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
//             <TouchableOpacity style={styles.filterPill}>
//               <Feather name="filter" size={12} color="#475569" />
//               <Text style={styles.filterText}>Filter</Text>
//               <Feather name="chevron-down" size={12} color="#475569" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.filterPill}>
//               <Feather name="calendar" size={12} color="#475569" />
//               <Text style={styles.filterText}>All</Text>
//             </TouchableOpacity>
//             <View style={styles.quickDialContainer}>
//               <Text style={styles.countryCode}>IN +91</Text>
//               <TextInput
//                 placeholder="Enter num"
//                 value={quickPhone}
//                 onChangeText={setQuickPhone}
//                 keyboardType="phone-pad"
//                 style={styles.quickDialInput}
//               />
//             </View>
//           </ScrollView>
//         </View>

//         <View style={styles.searchSection}>
//           <View style={styles.searchBar}>
//             <Feather name="search" size={15} color="#94a3b8" style={{ marginRight: 6 }} />
//             <TextInput
//               placeholder="Search accounts by name, contact, phone..."
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               style={styles.searchInput}
//               placeholderTextColor="#94a3b8"
//             />
//           </View>
//           <View style={styles.totalBadge}>
//             <Text style={styles.totalBadgeText}>Total : {filteredAccounts.length}</Text>
//           </View>
//         </View>

//         {loading ? (
//           <View style={styles.loaderContainer}>
//             <ActivityIndicator size="large" color="#0052cc" />
//           </View>
//         ) : (
//           <ScrollView horizontal showsHorizontalScrollIndicator>
//             <View style={{ width: TOTAL_TABLE_WIDTH }}>
//               <View style={styles.tableHeaderRow}>
//                 <TouchableOpacity style={[styles.tableHeaderCell, { width: COLUMN_WIDTHS.checkbox }]} onPress={toggleSelectAll}>
//                   <View style={[styles.checkbox, selectedIds.size === filteredAccounts.length && filteredAccounts.length > 0 && styles.checkboxChecked]} />
//                 </TouchableOpacity>
//                 <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.accountName }]}>Account Name</Text>
//                 <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.phone }]}>Phone</Text>
//                 <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.contactName }]}>Contact Name</Text>
//                 <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.followDate }]}>Follow Date</Text>
//                 <Text style={[styles.tableHeaderText, { width: COLUMN_WIDTHS.status }]}>Status</Text>
//               </View>

//               {filteredAccounts.map((item) => (
//                 <View key={item.id} style={styles.tableBodyRow}>
//                   <TouchableOpacity style={[styles.tableCell, { width: COLUMN_WIDTHS.checkbox }]} onPress={() => toggleSelectRow(item.id)}>
//                     <View style={[styles.checkbox, selectedIds.has(item.id) && styles.checkboxChecked]} />
//                   </TouchableOpacity>

//                   <View style={[styles.tableCell, { width: COLUMN_WIDTHS.accountName, flexDirection: 'row', alignItems: 'center' }]}>
//                     <View style={[styles.avatarBadge, { backgroundColor: item.avatarBg }]}>
//                       <Text style={styles.avatarText}>{item.avatarText}</Text>
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.accountNameText} numberOfLines={1}>{item.name}</Text>
//                       <Text style={styles.accountSubtitleText} numberOfLines={1}>{item.subtitle}</Text>
//                     </View>
//                   </View>

//                   <Text style={[styles.tableCell, styles.cellText, { width: COLUMN_WIDTHS.phone }]}>{item.phone}</Text>
//                   <Text style={[styles.tableCell, styles.cellText, { width: COLUMN_WIDTHS.contactName }]}>{item.contactName}</Text>
//                   <Text style={[styles.tableCell, styles.cellText, { width: COLUMN_WIDTHS.followDate }]}>{item.follow_Date}</Text>

//                   <View style={[styles.tableCell, { width: COLUMN_WIDTHS.status }]}>
//                     <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
//                       <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>{item.status}</Text>
//                     </View>
//                   </View>
//                 </View>
//               ))}
//             </View>
//           </ScrollView>
//         )}
//       </ScrollView>

//       <CreateAccountModal
//         visible={isModalVisible}
//         onClose={() => setModalVisible(false)}
//         onCreated={(newItem: any) => {
//           setModalVisible(false);

//           if (newItem) {
//             const companyName = newItem.company_Name || newItem.name || 'Unnamed Account';
//             const initials = companyName
//               .trim()
//               .split(' ')
//               .map((word: string) => word[0])
//               .join('')
//               .substring(0, 2)
//               .toUpperCase() || 'AC';

//             const displayDate = newItem.date 
//               ? `Created · ${newItem.date}`
//               : newItem.crmNumber 
//                 ? `Created · ${newItem.crmNumber}` 
//                 : 'Just now';

//             const formattedItem: AccountItem = {
//               id: newItem.id || newItem.crm_Id || String(Date.now()),
//               name: companyName,
//               subtitle: displayDate,
//               phone: newItem.phone || newItem.mobileNo || '--',
//               contactName: newItem.contact_Person || `${newItem.firstName || ''} ${newItem.lastName || ''}`.trim() || '--',
//               follow_Date: newItem.follow_Date || '--',
//               status: newItem.status || 'New',
//               avatarBg: '#e6f7ff',
//               avatarText: initials,
//             };

//             setAccounts((prev) => [formattedItem, ...prev]);
//           } else {
//             loadData();
//           }
//         }}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f4f6f9' },
//   pageHeaderContainer: { backgroundColor: '#ffffff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
//   pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
//   pageSubTitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
//   createBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
//   createBtnText: { color: '#ffffff', fontWeight: '600' },
//   loaderContainer: { padding: 40, alignItems: 'center' },
//   tableHeaderRow: { flexDirection: 'row', backgroundColor: '#eef2f6', paddingVertical: 10 },
//   tableHeaderCell: { justifyContent: 'center', alignItems: 'center' },
//   tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#334155', paddingHorizontal: 8 },
//   tableBodyRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center', minHeight: 52 },
//   tableCell: { paddingHorizontal: 8, justifyContent: 'center' },
//   cellText: { fontSize: 12, color: '#334155' },
//   checkbox: { width: 16, height: 16, borderWidth: 1, borderColor: '#94a3b8', borderRadius: 3 },
//   checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
//   avatarBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
//   avatarText: { fontSize: 11, fontWeight: 'bold', color: '#0284c7' },
//   accountNameText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
//   accountSubtitleText: { fontSize: 10, color: '#0284c7' },
//   statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
//   statusText: { fontSize: 11, fontWeight: '600' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
//   modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%' },
//   modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//   headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   blueIconBg: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
//   modalTitle: { fontSize: 16, fontWeight: 'bold' },
//   modalSubtitle: { fontSize: 11, color: '#64748b' },
//   modalBody: { padding: 16 },
//   sectionHeading: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
//   fieldGroup: { marginBottom: 12 },
//   rowGrid: { flexDirection: 'row', gap: 8 },
//   label: { fontSize: 12, fontWeight: '500', color: '#374151', marginBottom: 4 },
//   inputBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 8, height: 38, justifyContent: 'center' },
//   textInput: { fontSize: 13, color: '#111827' },
//   modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
//   closeModalBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db' },
//   closeModalBtnText: { color: '#374151', fontSize: 13 },
//   submitModalBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
//   submitModalBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
//   filterSection: { marginVertical: 8, paddingHorizontal: 12 },
//   filterRow: { flexDirection: 'row', alignItems: 'center' },
//   filterPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     marginRight: 8,
//   },
//   filterText: { fontSize: 11, color: '#475569', marginHorizontal: 4, fontWeight: '500' },
//   quickDialContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     height: 30,
//   },
//   countryCode: { fontSize: 11, color: '#64748b', marginRight: 4, fontWeight: '600' },
//   quickDialInput: { fontSize: 11, minWidth: 80, color: '#0f172a' },
//   searchSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     marginBottom: 8,
//     justifyContent: 'space-between',
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//     borderRadius: 6,
//     paddingHorizontal: 10,
//     flex: 1,
//     height: 36,
//     marginRight: 8,
//   },
//   searchInput: { flex: 1, fontSize: 12, color: '#0f172a' },
//   totalBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
//   totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#0284c7' },
// });

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {
  AccountItem,
  AccountStatus,
  fetchAccounts,
  createCRMItem,
} from '@/app/config/crmService';
import { Stack, useRouter, useFocusEffect } from 'expo-router';

// Helper for Initials
const getInitials = (name: string): string => {
  if (!name) return 'AC';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper for Avatar Background Colors
const getAvatarBg = (index: number): string => {
  const colors = ['#e0f2fe', '#fce7f3', '#e0e7ff', '#fef3c7', '#dcfce7', '#f3e8ff'];
  return colors[index % colors.length];
};

const getAvatarTextColor = (index: number): string => {
  const colors = ['#0369a1', '#be185d', '#3730a3', '#b45309', '#15803d', '#6b21a8'];
  return colors[index % colors.length];
};

// Helper for Status Badge Styling
const getStatusBadgeStyle = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('not active') || s.includes('lost')) return { bg: '#f97316', text: '#ffffff' };
  if (s.includes('prospect')) return { bg: '#818cf8', text: '#ffffff' };
  if (s.includes('active')) return { bg: '#20b2aa', text: '#ffffff' };
  return { bg: '#2563eb', text: '#ffffff' }; // Default Active / New
};

export function CreateAccountModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (newItem?: any) => void;
}) {
  const [accountName, setAccountName] = useState('');
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accountOwner, setAccountOwner] = useState('crm manager');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setAccountName('');
    setTitle('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDescription('');
    setAnnualRevenue('');
  };

  const handleSubmit = async () => {
    if (!accountName.trim() || !firstName.trim() || !email.trim()) {
      Alert.alert('Required Fields Missing', 'Please fill in Account Name, First Name, and Email.');
      return;
    }
    setSubmitting(true);

    const now = new Date();
    const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()} ${now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

    const payload = {
      company_Name: accountName.trim(),
      title: title.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contact_Person: `${firstName.trim()} ${lastName.trim()}`.trim(),
      owner: accountOwner,
      annualRevenue: annualRevenue ? Number(annualRevenue) : 0,
      email: email.trim(),
      phone: phone.trim(),
      mobileNo: phone.trim(),
      summary: summary.trim(),
      type: 'accounts',
      date: formattedDate,
    };

    try {
      const result = await createCRMItem(payload);
      if (result) {
        Alert.alert('Success', 'Account created successfully!');
        resetForm();
        onCreated(typeof result === 'object' ? result : undefined);
      } else {
        Alert.alert('Backend Error', 'Server returned falsy response. Check database logs.');
      }
    } catch (err: any) {
      Alert.alert('Error', `Save failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
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
            <Text style={[styles.sectionHeading, { color: '#2563eb', marginTop: 8 }]}>Account Information</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Name *</Text>
              <View style={styles.inputBox}>
                <TextInput placeholder="Enter Account Name" placeholderTextColor="#9ca3af" style={styles.textInput} value={accountName} onChangeText={setAccountName} />
              </View>
            </View>

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
                  <TextInput placeholder="Select annual revenue" placeholderTextColor="#9ca3af" keyboardType="numeric" style={styles.textInput} value={annualRevenue} onChangeText={setAnnualRevenue} />
                </View>
              </View>
            </View>

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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputBox, { height: 70, paddingVertical: 6 }]}>
                <TextInput placeholder="Add description about this account" placeholderTextColor="#9ca3af" multiline numberOfLines={3} style={[styles.textInput, { textAlignVertical: 'top' }]} value={summary} onChangeText={setDescription} />
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
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err) {
      console.log('Error fetching accounts:', err);
      Alert.alert('Error', 'Unable to fetch account list from backend.');
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
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Status Filter
      if (
        selectedStatusFilter !== 'All' &&
        (account.status || '').toLowerCase() !== selectedStatusFilter.toLowerCase()
      ) {
        return false;
      }

      // Search Query Filter
      if (!searchQuery || searchQuery.trim() === '') return true;
      const query = searchQuery.trim().toLowerCase();
      const accountName = (account.name || '').toLowerCase();
      const contactName = (account.contactName || '').toLowerCase();
      const companyName = (account.company_Name || '').toLowerCase();
      const phone = (account.phone || '').toLowerCase();
      return accountName.includes(query) || contactName.includes(query) || phone.includes(query);
    });
  }, [accounts, searchQuery, selectedStatusFilter]);

  // Paginated Data Logic
  const totalPages = Math.ceil(filteredAccounts.length / pageSize) || 1;
  const paginatedAccounts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(startIdx, startIdx + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getAccountId = (item: any, index: number) => item.id || `account-${index}`;

  const renderAccountCard = ({ item, index }: { item: AccountItem; index: number }) => {
    const displayName = item.name || 'Unnamed Account';
    const displayContact = item.contactName || '--';
    const displayStatus = item.status || 'Active';
    const follow_Date =  (item.follow_Date ? `follow date : ${item.follow_Date}` : 'Recent');

    const avatarBg = getAvatarBg(index);
    const avatarTextColor = getAvatarTextColor(index);
    const badgeStyle = getStatusBadgeStyle(displayStatus);

    const callsCount = (item as any).scheduleCall || (item as any).callsCount || 0;
    const meetingsCount = (item as any).meeting || (item as any).videoCallsCount || 0;
    const mailsCount = (item as any).mail || (item as any).mailsCount || 0;

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
          <Text style={styles.accountName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.contactName} numberOfLines={1}>
            Contact Name: {displayContact}
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
            <Text style={styles.headerTitle}>Accounts</Text>
            <Text style={styles.headerSubtitle}>Manage accounts and customer relationships</Text>
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
          <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.createBtnText}>+ Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Functional Filter Bar */}
      {showFilterBar && (
        <View style={styles.filterChipBar}>
          {['All', 'Active', 'Prospect', 'Not Active'].map((filter) => (
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
            placeholder="Search accounts by name, contact, phone..."
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
          <Text style={styles.totalBadgeText}>Total : {filteredAccounts.length}</Text>
        </View>
      </View>

      {/* Main Account Card List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={paginatedAccounts}
          keyExtractor={(item, index) => getAccountId(item, index)}
          renderItem={renderAccountCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="briefcase" size={32} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Accounts Found</Text>
              <Text style={styles.emptyStateSub}>
                No accounts match your search query or selected filters.
              </Text>
              <TouchableOpacity
                style={styles.addAccountBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addAccountBtnText}>+ Add Account</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal */}
      <CreateAccountModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={(newItem: any) => {
          setModalVisible(false);

          if (newItem) {
            const companyName = newItem.company_Name || newItem.name || 'Unnamed Account';
            const initials = getInitials(companyName);

            const displayDate = newItem.date
              ? `Created · ${newItem.date}`
              : newItem.crmNumber
              ? `Created · ${newItem.crmNumber}`
              : 'Just now';

            const formattedItem: AccountItem = {
              id: newItem.id || newItem.crm_Id || String(Date.now()),
              name: companyName,
              subtitle: displayDate,
              phone: newItem.phone || newItem.mobileNo || '--',
              company_Name:newItem.company_Name,
              contactName:
                newItem.contact_Person ||
                `${newItem.firstName || ''} ${newItem.lastName || ''}`.trim() ||
                '--',
              follow_Date: newItem.follow_Date || '--',
              status: newItem.status || 'Active',
              avatarBg: '#e0f2fe',
              avatarText: initials,
            };

            setAccounts((prev) => [formattedItem, ...prev]);
          } else {
            loadData();
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal:12,
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
  accountName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  contactName: { fontSize: 11, color: '#475569', marginTop: 1 },
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
  addAccountBtn: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addAccountBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  blueIconBg: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 11, color: '#64748b' },
  modalBody: { padding: 16 },
  sectionHeading: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
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