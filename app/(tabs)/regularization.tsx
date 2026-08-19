// // app/(tabs)/regularization.tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from 'react-native';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import {
//   regularizationService,
//   RegularizationItem,
//   SummaryMetrics,
// } from '@/app/config/regularizationService';

// export default function RegularizationScreen() {
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);

//   // API State
//   const [metrics, setMetrics] = useState<SummaryMetrics>({
//     total: 0,
//     approved: 0,
//     pending: 0,
//     rejected: 0,
//     cancelled: 0,
//   });
//   const [requests, setRequests] = useState<RegularizationItem[]>([]);

//   // Filter & Search State
//   const [searchQuery, setSearchQuery] = useState<string>('');

//   // Modals
//   const [showAddModal, setShowAddModal] = useState<boolean>(false);
//   const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
//   const [selectedItem, setSelectedItem] = useState<RegularizationItem | null>(null);

//   // Form Fields
//   const [checkInDate, setCheckInDate] = useState<string>('2026-08-07');
//   const [checkInTime, setCheckInTime] = useState<string>('09:30 AM');
//   const [checkOutDate, setCheckOutDate] = useState<string>('2026-08-07');
//   const [checkOutTime, setCheckOutTime] = useState<string>('06:30 PM');
//   const [reason, setReason] = useState<string>('');
//   const [submitting, setSubmitting] = useState<boolean>(false);

//   // Fetch List Data
//   const fetchData = useCallback(async () => {
//     try {
//       const data = await regularizationService.getRegularizationList();
//       if (data) {
//         setMetrics(data.metrics || { total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 });
//         setRequests(data.requests || []);
//       }
//     } catch (error) {
//       console.error('Error fetching regularization data:', error);
//       Alert.alert('Error', 'Failed to fetch regularization details from server.');
//     }
//   }, []);

//   useEffect(() => {
//     const init = async () => {
//       setLoading(true);
//       await fetchData();
//       setLoading(false);
//     };
//     init();
//   }, [fetchData]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchData();
//     setRefreshing(false);
//   };

//   // Fetch Form Options when opening Add Modal
//   const handleOpenAddModal = async () => {
//     try {
//       await regularizationService.getFormInitData();
//     } catch (err) {
//       console.log('Form init metadata fetch error:', err);
//     }
//     setShowAddModal(true);
//   };

//   // Submit Form
//   const handleSubmitForm = async () => {
//     if (!reason.trim()) {
//       Alert.alert('Validation Error', 'Please enter a reason for regularization.');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await regularizationService.addRegularization({
//         checkInDate,
//         checkInTime,
//         checkOutDate,
//         checkOutTime,
//         reason,
//       });
//       Alert.alert('Success', 'Regularization request submitted successfully.');
//       setShowAddModal(false);
//       setReason('');
//       fetchData();
//     } catch (error) {
//       Alert.alert('Error', 'Failed to submit regularization request.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getStatusBadge = (status?: string) => {
//     switch (status?.toLowerCase()) {
//       case 'approved':
//         return { bg: '#E8F5E9', text: '#2E7D32' };
//       case 'pending':
//         return { bg: '#FFF3E0', text: '#EF6C00' };
//       case 'rejected':
//         return { bg: '#FFEBEE', text: '#C62828' };
//       case 'cancelled':
//         return { bg: '#F3E5F5', text: '#7B1FA2' };
//       default:
//         return { bg: '#ECEFF1', text: '#455A64' };
//     }
//   };

//   const filteredRequests = requests.filter((item) =>
//     item.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

//       {/* TOP HEADER */}
//       <View style={styles.topHeader}>
//         <TouchableOpacity style={styles.iconBtn}>
//           <Feather name="arrow-left" size={20} color="#101828" />
//         </TouchableOpacity>
//         <View style={styles.headerTextCenter}>
//           <Text style={styles.headerTitle}>Regularization</Text>
//           <Text style={styles.headerSubtitle}>Manage and track employee regularization requests</Text>
//         </View>
//         <TouchableOpacity style={styles.iconBtn}>
//           <Feather name="filter" size={18} color="#101828" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        
//         {/* SEARCH BAR & TODAY BUTTON */}
//         <View style={styles.searchRow}>
//           <View style={styles.searchBox}>
//             <Feather name="search" size={16} color="#9E9E9E" />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search by employee"
//               placeholderTextColor="#9E9E9E"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
//           <TouchableOpacity style={styles.todayBtn}>
//             <Feather name="calendar" size={14} color="#101828" />
//             <Text style={styles.todayBtnText}>Today</Text>
//           </TouchableOpacity>
//         </View>

//         {/* METRICS CARDS */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
//           <View style={styles.metricCard}>
//             <View style={[styles.metricIcon, { backgroundColor: '#E0F2FE' }]}>
//               <Feather name="file-text" size={16} color="#0284C7" />
//             </View>
//             <Text style={styles.metricVal}>{metrics.total}</Text>
//             <Text style={styles.metricLbl}>Total</Text>
//           </View>

//           <View style={styles.metricCard}>
//             <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
//               <Feather name="check-circle" size={16} color="#16A34A" />
//             </View>
//             <Text style={styles.metricVal}>{metrics.approved}</Text>
//             <Text style={styles.metricLbl}>Approved</Text>
//           </View>

//           <View style={styles.metricCard}>
//             <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
//               <Feather name="clock" size={16} color="#D97706" />
//             </View>
//             <Text style={styles.metricVal}>{metrics.pending}</Text>
//             <Text style={styles.metricLbl}>Pending</Text>
//           </View>

//           <View style={styles.metricCard}>
//             <View style={[styles.metricIcon, { backgroundColor: '#FEE2E2' }]}>
//               <Feather name="x-circle" size={16} color="#DC2626" />
//             </View>
//             <Text style={styles.metricVal}>{metrics.rejected}</Text>
//             <Text style={styles.metricLbl}>Rejected</Text>
//           </View>

//           <View style={styles.metricCard}>
//             <View style={[styles.metricIcon, { backgroundColor: '#F3E8FF' }]}>
//               <Feather name="calendar" size={16} color="#9333EA" />
//             </View>
//             <Text style={styles.metricVal}>{metrics.cancelled}</Text>
//             <Text style={styles.metricLbl}>Cancelled</Text>
//           </View>
//         </ScrollView>

//         {/* TOTAL COUNTER ROW */}
//         <View style={styles.countRow}>
//           <View style={styles.showDropdown}>
//             <Text style={styles.showText}>Show</Text>
//             <Text style={styles.showVal}>25</Text>
//             <Feather name="chevron-down" size={14} color="#666" />
//           </View>
//           <Text style={styles.totalCountText}>Total : {filteredRequests.length}</Text>
//         </View>

//         {/* REQUESTS LIST */}
//         {loading ? (
//           <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 30 }} />
//         ) : (
//           <View style={styles.listContainer}>
//             {filteredRequests.map((item) => {
//               const badge = getStatusBadge(item.status);
//               return (
//                 <View key={String(item.id)} style={styles.requestCard}>
//                   <View style={styles.cardHeader}>
//                     <View style={styles.userInfo}>
//                       <View style={styles.avatar}>
//                         <Text style={styles.avatarText}>{item.avatarText || 'DB'}</Text>
//                       </View>
//                       <View>
//                         <Text style={styles.userName}>{item.employeeName}</Text>
//                         <Text style={styles.dateSubtext}>
//                           {item.date} <Text style={{ color: '#2563EB' }}>{item.dayOfWeek}</Text>
//                         </Text>
//                       </View>
//                     </View>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSelectedItem(item);
//                         setShowDetailsModal(true);
//                       }}>
//                       <Feather name="more-horizontal" size={20} color="#666" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.timeDetailsGrid}>
//                     <View style={styles.timeCol}>
//                       <View style={styles.iconCircleGreen}>
//                         <Feather name="arrow-down-left" size={12} color="#16A34A" />
//                       </View>
//                       <View>
//                         <Text style={styles.timeVal}>{item.checkIn}</Text>
//                         <Text style={styles.timeLbl}>Check-In</Text>
//                       </View>
//                     </View>

//                     <View style={styles.timeCol}>
//                       <View style={styles.iconCircleRed}>
//                         <Feather name="arrow-up-right" size={12} color="#DC2626" />
//                       </View>
//                       <View>
//                         <Text style={styles.timeVal}>{item.checkOut}</Text>
//                         <Text style={styles.timeLbl}>Check-Out</Text>
//                       </View>
//                     </View>

//                     <View style={styles.timeCol}>
//                       <View style={styles.iconCircleBlue}>
//                         <Feather name="clock" size={12} color="#2563EB" />
//                       </View>
//                       <View>
//                         <Text style={styles.timeVal}>{item.workHours}</Text>
//                         <Text style={styles.timeLbl}>Work Hours</Text>
//                       </View>
//                     </View>
//                   </View>

//                   <View style={styles.reasonRow}>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.reasonLbl}>Reason</Text>
//                       <Text style={styles.reasonVal}>{item.reason}</Text>
//                     </View>
//                     <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
//                       <Text style={[styles.statusBadgeText, { color: badge.text }]}>
//                         {item.status}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         )}
//       </ScrollView>

//       {/* FLOATING ADD BUTTON */}
//       <TouchableOpacity style={styles.fab} onPress={handleOpenAddModal}>
//         <Feather name="plus" size={24} color="#FFF" />
//       </TouchableOpacity>

//       {/* REGULARIZATION DETAILS MODAL */}
//       <Modal visible={showDetailsModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.detailsModalCard}>
//             <View style={styles.modalTopHeader}>
//               <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
//                 <Feather name="arrow-left" size={20} color="#101828" />
//               </TouchableOpacity>
//               <Text style={styles.modalHeaderTitle}>Regularization Details</Text>
//               <Feather name="more-horizontal" size={20} color="#101828" />
//             </View>

//             {selectedItem && (
//               <ScrollView style={{ padding: 16 }}>
//                 <View style={styles.cardHeader}>
//                   <View style={styles.userInfo}>
//                     <View style={styles.avatar}>
//                       <Text style={styles.avatarText}>{selectedItem.avatarText || 'DB'}</Text>
//                     </View>
//                     <View>
//                       <Text style={styles.userName}>{selectedItem.employeeName}</Text>
//                       <Text style={styles.dateSubtext}>
//                         {selectedItem.date} <Text style={{ color: '#2563EB' }}>{selectedItem.dayOfWeek}</Text>
//                       </Text>
//                     </View>
//                   </View>
//                   <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
//                     <Text style={{ color: '#EF6C00', fontSize: 11, fontWeight: '600' }}>
//                       {selectedItem.status}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.detailsList}>
//                   <View style={styles.detailRow}>
//                     <View style={styles.iconCircleGreen}>
//                       <Feather name="arrow-down-left" size={12} color="#16A34A" />
//                     </View>
//                     <View>
//                       <Text style={styles.timeLbl}>Check-In</Text>
//                       <Text style={styles.timeVal}>{selectedItem.checkIn}</Text>
//                     </View>
//                   </View>

//                   <View style={styles.detailRow}>
//                     <View style={styles.iconCircleRed}>
//                       <Feather name="arrow-up-right" size={12} color="#DC2626" />
//                     </View>
//                     <View>
//                       <Text style={styles.timeLbl}>Check-Out</Text>
//                       <Text style={styles.timeVal}>{selectedItem.checkOut}</Text>
//                     </View>
//                   </View>

//                   <View style={styles.detailRow}>
//                     <View style={styles.iconCircleBlue}>
//                       <Feather name="clock" size={12} color="#2563EB" />
//                     </View>
//                     <View>
//                       <Text style={styles.timeLbl}>Work Hours</Text>
//                       <Text style={styles.timeVal}>{selectedItem.workHours}</Text>
//                     </View>
//                   </View>

//                   <View style={styles.detailRow}>
//                     <View style={styles.iconCircleOrange}>
//                       <Feather name="file-text" size={12} color="#D97706" />
//                     </View>
//                     <View>
//                       <Text style={styles.timeLbl}>Reason</Text>
//                       <Text style={styles.timeVal}>{selectedItem.reason}</Text>
//                     </View>
//                   </View>
//                 </View>

//                 {/* ACTIONS */}
//                 <Text style={styles.actionsTitle}>Actions</Text>
//                 <View style={styles.actionButtonsRow}>
//                   <TouchableOpacity style={styles.actionBtn}>
//                     <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
//                       <Feather name="check" size={16} color="#16A34A" />
//                     </View>
//                     <Text style={styles.actionBtnText}>Approve</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity style={styles.actionBtn}>
//                     <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
//                       <Feather name="x" size={16} color="#DC2626" />
//                     </View>
//                     <Text style={styles.actionBtnText}>Reject</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity style={styles.actionBtn}>
//                     <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
//                       <Feather name="x-circle" size={16} color="#6B7280" />
//                     </View>
//                     <Text style={styles.actionBtnText}>Cancel</Text>
//                   </TouchableOpacity>
//                 </View>
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* ADD REGULARIZATION REQUEST MODAL */}
//       <Modal visible={showAddModal} animationType="slide">
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
//           <View style={styles.addModalHeader}>
//             <TouchableOpacity onPress={() => setShowAddModal(false)}>
//               <Feather name="arrow-left" size={20} color="#101828" />
//             </TouchableOpacity>
//             <View style={{ flex: 1, alignItems: 'center' }}>
//               <Text style={styles.addModalTitle}>Add Regularization Request</Text>
//               <Text style={styles.addModalSub}>Submit a regularization request</Text>
//             </View>
//             <TouchableOpacity onPress={() => setShowAddModal(false)}>
//               <Feather name="x" size={20} color="#101828" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={{ padding: 16 }}>
//             {/* CHECK IN ROW */}
//             <View style={styles.formRow}>
//               <View style={{ flex: 1, marginRight: 8 }}>
//                 <Text style={styles.formLabel}>Check-In Date</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput style={styles.inputText} value={checkInDate} onChangeText={setCheckInDate} />
//                   <Feather name="calendar" size={16} color="#666" />
//                 </View>
//               </View>

//               <View style={{ flex: 1, marginLeft: 8 }}>
//                 <Text style={styles.formLabel}>Check-In Time</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput style={styles.inputText} value={checkInTime} onChangeText={setCheckInTime} />
//                   <Feather name="clock" size={16} color="#666" />
//                 </View>
//               </View>
//             </View>

//             {/* CHECK OUT ROW */}
//             <View style={styles.formRow}>
//               <View style={{ flex: 1, marginRight: 8 }}>
//                 <Text style={styles.formLabel}>Check-Out Date</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput style={styles.inputText} value={checkOutDate} onChangeText={setCheckOutDate} />
//                   <Feather name="calendar" size={16} color="#666" />
//                 </View>
//               </View>

//               <View style={{ flex: 1, marginLeft: 8 }}>
//                 <Text style={styles.formLabel}>Check-Out Time</Text>
//                 <View style={styles.inputBox}>
//                   <TextInput style={styles.inputText} value={checkOutTime} onChangeText={setCheckOutTime} />
//                   <Feather name="clock" size={16} color="#666" />
//                 </View>
//               </View>
//             </View>

//             {/* REASON TEXTAREA */}
//             <Text style={styles.formLabel}>Reason</Text>
//             <View style={styles.textAreaBox}>
//               <TextInput
//                 style={styles.textAreaInput}
//                 placeholder="Enter description here..."
//                 placeholderTextColor="#9CA3AF"
//                 multiline
//                 numberOfLines={5}
//                 maxLength={250}
//                 value={reason}
//                 onChangeText={setReason}
//               />
//               <Text style={styles.charCount}>{reason.length}/250</Text>
//             </View>
//           </ScrollView>

//           {/* FORM FOOTER BUTTONS */}
//           <View style={styles.formFooter}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
//               <Text style={styles.cancelBtnText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitForm} disabled={submitting}>
//               {submitting ? (
//                 <ActivityIndicator color="#FFF" />
//               ) : (
//                 <>
//                   <Feather name="send" size={14} color="#FFF" style={{ marginRight: 6 }} />
//                   <Text style={styles.submitBtnText}>Submit</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </Modal>

//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },
//   topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
//   iconBtn: { padding: 6 },
//   headerTextCenter: { alignItems: 'center' },
//   headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
//   headerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
//   searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 10 },
//   searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 40 },
//   searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A' },
//   todayBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 40, gap: 6 },
//   todayBtnText: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
//   metricsScroll: { paddingLeft: 16, marginTop: 12 },
//   metricCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, width: 90, marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'flex-start' },
//   metricIcon: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
//   metricVal: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
//   metricLbl: { fontSize: 11, color: '#64748B', marginTop: 2 },
//   countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
//   showDropdown: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   showText: { fontSize: 12, color: '#64748B' },
//   showVal: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
//   totalCountText: { fontSize: 12, fontWeight: 'bold', color: '#2563EB' },
//   listContainer: { paddingHorizontal: 16, gap: 12 },
//   requestCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center' },
//   avatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
//   userName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
//   dateSubtext: { fontSize: 11, color: '#64748B' },
//   timeDetailsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginVertical: 12 },
//   timeCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   iconCircleGreen: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
//   iconCircleRed: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
//   iconCircleBlue: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
//   iconCircleOrange: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
//   timeVal: { fontSize: 11, fontWeight: 'bold', color: '#0F172A' },
//   timeLbl: { fontSize: 9, color: '#64748B' },
//   reasonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
//   reasonLbl: { fontSize: 10, color: '#94A3B8' },
//   reasonVal: { fontSize: 12, color: '#334155', marginTop: 2 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusBadgeText: { fontSize: 11, fontWeight: '600' },
//   fab: { position: 'absolute', bottom: 20, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', elevation: 5 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
//   detailsModalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
//   modalTopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
//   modalHeaderTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
//   detailsList: { gap: 12, marginVertical: 16 },
//   detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 },
//   actionsTitle: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
//   actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
//   actionBtn: { flex: 1, alignItems: 'center', gap: 4 },
//   actionIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
//   actionBtnText: { fontSize: 11, fontWeight: '500', color: '#334155' },
//   addModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
//   addModalTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
//   addModalSub: { fontSize: 11, color: '#64748B' },
//   formRow: { flexDirection: 'row', marginBottom: 14 },
//   formLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 6 },
//   inputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 42 },
//   inputText: { flex: 1, fontSize: 12, color: '#0F172A' },
//   textAreaBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, height: 120, justifyContent: 'space-between' },
//   textAreaInput: { fontSize: 12, color: '#0F172A', textAlignVertical: 'top', flex: 1 },
//   charCount: { fontSize: 10, color: '#94A3B8', textAlign: 'right' },
//   formFooter: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
//   cancelBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
//   cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#334155' },
//   submitBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//   submitBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
// });

// app/(tabs)/regularization.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  regularizationService,
  RegularizationItem,
  SummaryMetrics,
} from '@/app/config/regularizationService';

// Helper to format date into YYYY-MM-DD
const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RegularizationScreen() {
  const todayStr = getFormattedDate(new Date());

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // API State
  const [metrics, setMetrics] = useState<SummaryMetrics>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [requests, setRequests] = useState<RegularizationItem[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('');
  const [isFilteredByDate, setIsFilteredByDate] = useState<boolean>(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>(todayStr);
  const [filterEndDate, setFilterEndDate] = useState<string>(todayStr);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<RegularizationItem | null>(null);

  // Form Fields
  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkInTime, setCheckInTime] = useState<string>('09:30 AM');
  const [checkOutDate, setCheckOutDate] = useState<string>(todayStr);
  const [checkOutTime, setCheckOutTime] = useState<string>('06:30 PM');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch Default List Data
  const fetchData = useCallback(async () => {
    try {
      const data = await regularizationService.getRegularizationList();
      if (data) {
        setMetrics(data.metrics || { total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 });
        setRequests(data.requests || []);
        setDateRangeLabel(data.dateRangeLabel || data.dateRange || '');
        setIsFilteredByDate(false);
      }
    } catch (error) {
      console.error('Error fetching regularization data:', error);
      Alert.alert('Error', 'Failed to fetch regularization details from server.');
    }
  }, []);

  // Fetch List Data Filtered by Date Range
  const fetchDateRangeData = async (start: string, end: string) => {
    try {
      setLoading(true);
      const data = await regularizationService.getRegularizationListByDateRange(start, end);
      if (data) {
        setMetrics(data.metrics || { total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 });
        setRequests(data.requests || []);
        setDateRangeLabel(
          data.dateRangeLabel || data.dateRange || `${start} to ${end}`
        );
        setIsFilteredByDate(true);
      }
    } catch (error) {
      console.error('Error fetching date-wise regularization data:', error);
      Alert.alert('Error', 'Failed to fetch date-wise regularization details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isFilteredByDate && filterStartDate && filterEndDate) {
      await fetchDateRangeData(filterStartDate, filterEndDate);
    } else {
      await fetchData();
    }
    setRefreshing(false);
  };

  // Quick Filter: Today
  const handleTodayFilter = () => {
    setFilterStartDate(todayStr);
    setFilterEndDate(todayStr);
    fetchDateRangeData(todayStr, todayStr);
  };

  // Custom Date Range Submit
  const handleApplyDateFilter = () => {
    if (!filterStartDate.trim() || !filterEndDate.trim()) {
      Alert.alert('Validation Error', 'Please specify both start and end dates.');
      return;
    }
    setShowFilterModal(false);
    fetchDateRangeData(filterStartDate, filterEndDate);
  };

  // Fetch Form Options when opening Add Modal
  const handleOpenAddModal = async () => {
    try {
      await regularizationService.getFormInitData();
    } catch (err) {
      console.log('Form init metadata fetch error:', err);
    }
    setShowAddModal(true);
  };

  // Submit Add Regularization Form
 const handleSubmitForm = async () => {
  if (!reason.trim()) {
    Alert.alert('Validation Error', 'Please enter a reason for regularization.');
    return;
  }

  setSubmitting(true);
  try {
    const payload = {
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      reason,
      // Pass the user and org IDs if available from your screen state/context
      userId: '324cd609-926f-42d0-badd-110339db5e4e', 
      orgId: '0bb2e9c7-1a17-4941-ab93-c938125c8d96',
    };

    await regularizationService.addRegularization(payload);

    Alert.alert('Success', 'Regularization request submitted successfully.');
    setShowAddModal(false);
    setReason('');

    if (isFilteredByDate) {
      fetchDateRangeData(filterStartDate, filterEndDate);
    } else {
      fetchData();
    }
  } catch (error: any) {
    console.error('Submission Error Details:', error);
    Alert.alert('Submission Failed', error?.message || 'Failed to submit regularization request.');
  } finally {
    setSubmitting(false);
  }
};

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'pending':
        return { bg: '#FFF3E0', text: '#EF6C00' };
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'cancelled':
        return { bg: '#F3E5F5', text: '#7B1FA2' };
      default:
        return { bg: '#ECEFF1', text: '#455A64' };
    }
  };

  const filteredRequests = requests.filter((item) =>
    item.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color="#101828" />
        </TouchableOpacity>
        <View style={styles.headerTextCenter}>
          <Text style={styles.headerTitle}>Regularization</Text>
          <Text style={styles.headerSubtitle}>
            {dateRangeLabel ? dateRangeLabel : 'Manage employee regularization requests'}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowFilterModal(true)}>
          <Feather name="filter" size={18} color="#101828" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        
        {/* SEARCH BAR & TODAY BUTTON */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by employee"
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.todayBtn} onPress={handleTodayFilter}>
            <Feather name="calendar" size={14} color="#101828" />
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* METRICS CARDS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="file-text" size={16} color="#0284C7" />
            </View>
            <Text style={styles.metricVal}>{metrics.total}</Text>
            <Text style={styles.metricLbl}>Total</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
              <Feather name="check-circle" size={16} color="#16A34A" />
            </View>
            <Text style={styles.metricVal}>{metrics.approved}</Text>
            <Text style={styles.metricLbl}>Approved</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="clock" size={16} color="#D97706" />
            </View>
            <Text style={styles.metricVal}>{metrics.pending}</Text>
            <Text style={styles.metricLbl}>Pending</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="x-circle" size={16} color="#DC2626" />
            </View>
            <Text style={styles.metricVal}>{metrics.rejected}</Text>
            <Text style={styles.metricLbl}>Rejected</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="calendar" size={16} color="#9333EA" />
            </View>
            <Text style={styles.metricVal}>{metrics.cancelled}</Text>
            <Text style={styles.metricLbl}>Cancelled</Text>
          </View>
        </ScrollView>

        {/* TOTAL COUNTER ROW */}
        <View style={styles.countRow}>
          {isFilteredByDate ? (
            <TouchableOpacity style={styles.resetFilterBtn} onPress={fetchData}>
              <Feather name="refresh-cw" size={12} color="#2563EB" />
              <Text style={styles.resetFilterText}>Clear Date Filter</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.showDropdown}>
              <Text style={styles.showText}>Show</Text>
              <Text style={styles.showVal}>{filteredRequests.length}</Text>
            </View>
          )}
          <Text style={styles.totalCountText}>Total : {filteredRequests.length}</Text>
        </View>

        {/* REQUESTS LIST */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 30 }} />
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>No regularization requests found</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredRequests.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <View key={String(item.id)} style={styles.requestCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.avatarText}</Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{item.employeeName}</Text>
                        <Text style={styles.dateSubtext}>
                          {item.date} {item.dayOfWeek ? <Text style={{ color: '#2563EB' }}>{item.dayOfWeek}</Text> : null}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedItem(item);
                        setShowDetailsModal(true);
                      }}>
                      <Feather name="more-horizontal" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeDetailsGrid}>
                    <View style={styles.timeCol}>
                      <View style={styles.iconCircleGreen}>
                        <Feather name="arrow-down-left" size={12} color="#16A34A" />
                      </View>
                      <View>
                        <Text style={styles.timeVal}>{item.checkIn}</Text>
                        <Text style={styles.timeLbl}>Check-In</Text>
                      </View>
                    </View>

                    <View style={styles.timeCol}>
                      <View style={styles.iconCircleRed}>
                        <Feather name="arrow-up-right" size={12} color="#DC2626" />
                      </View>
                      <View>
                        <Text style={styles.timeVal}>{item.checkOut}</Text>
                        <Text style={styles.timeLbl}>Check-Out</Text>
                      </View>
                    </View>

                    <View style={styles.timeCol}>
                      <View style={styles.iconCircleBlue}>
                        <Feather name="clock" size={12} color="#2563EB" />
                      </View>
                      <View>
                        <Text style={styles.timeVal}>{item.workHours}</Text>
                        <Text style={styles.timeLbl}>Work Hours</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.reasonRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.reasonLbl}>Reason</Text>
                      <Text style={styles.reasonVal} numberOfLines={2}>{item.reason}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAddModal}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* DATE FILTER MODAL */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalCard}>
            <View style={styles.modalTopHeader}>
              <Text style={styles.modalHeaderTitle}>Filter by Date Range</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Feather name="x" size={20} color="#101828" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.formLabel}>Start Date (YYYY-MM-DD)</Text>
              <View style={[styles.inputBox, { marginBottom: 12 }]}>
                <TextInput
                  style={styles.inputText}
                  placeholder="YYYY-MM-DD"
                  value={filterStartDate}
                  onChangeText={setFilterStartDate}
                />
                <Feather name="calendar" size= {16} color="#666" />
              </View>

              <Text style={styles.formLabel}>End Date (YYYY-MM-DD)</Text>
              <View style={[styles.inputBox, { marginBottom: 20 }]}>
                <TextInput
                  style={styles.inputText}
                  placeholder="YYYY-MM-DD"
                  value={filterEndDate}
                  onChangeText={setFilterEndDate}
                />
                <Feather name="calendar" size={16} color="#666" />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowFilterModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleApplyDateFilter}>
                  <Text style={styles.submitBtnText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* REGULARIZATION DETAILS MODAL */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalCard}>
            <View style={styles.modalTopHeader}>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Feather name="arrow-left" size={20} color="#101828" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Regularization Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Feather name="x" size={20} color="#101828" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={{ padding: 16 }}>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{selectedItem.avatarText || 'EM'}</Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{selectedItem.employeeName}</Text>
                      <Text style={styles.dateSubtext}>
                        {selectedItem.date} {selectedItem.dayOfWeek ? <Text style={{ color: '#2563EB' }}>{selectedItem.dayOfWeek}</Text> : null}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBadge(selectedItem.status).bg }]}>
                    <Text style={{ color: getStatusBadge(selectedItem.status).text, fontSize: 11, fontWeight: '600' }}>
                      {selectedItem.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsList}>
                  <View style={styles.detailRow}>
                    <View style={styles.iconCircleGreen}>
                      <Feather name="arrow-down-left" size={12} color="#16A34A" />
                    </View>
                    <View>
                      <Text style={styles.timeLbl}>Check-In</Text>
                      <Text style={styles.timeVal}>{selectedItem.checkIn}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.iconCircleRed}>
                      <Feather name="arrow-up-right" size={12} color="#DC2626" />
                    </View>
                    <View>
                      <Text style={styles.timeLbl}>Check-Out</Text>
                      <Text style={styles.timeVal}>{selectedItem.checkOut}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.iconCircleBlue}>
                      <Feather name="clock" size={12} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.timeLbl}>Work Hours</Text>
                      <Text style={styles.timeVal}>{selectedItem.workHours}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.iconCircleOrange}>
                      <Feather name="file-text" size={12} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeLbl}>Reason</Text>
                      <Text style={styles.timeVal}>{selectedItem.reason}</Text>
                    </View>
                  </View>
                </View>

                {/* ACTIONS */}
                <Text style={styles.actionsTitle}>Actions</Text>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
                      <Feather name="check" size={16} color="#16A34A" />
                    </View>
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
                      <Feather name="x" size={16} color="#DC2626" />
                    </View>
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
                      <Feather name="x-circle" size={16} color="#6B7280" />
                    </View>
                    <Text style={styles.actionBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ADD REGULARIZATION REQUEST MODAL */}
      <Modal visible={showAddModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.addModalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Feather name="arrow-left" size={20} color="#101828" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.addModalTitle}>Add Regularization Request</Text>
              <Text style={styles.addModalSub}>Submit a regularization request</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Feather name="x" size={20} color="#101828" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {/* CHECK IN ROW */}
            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.formLabel}>Check-In Date</Text>
                <View style={styles.inputBox}>
                  <TextInput style={styles.inputText} value={checkInDate} onChangeText={setCheckInDate} />
                  <Feather name="calendar" size={16} color="#666" />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>Check-In Time</Text>
                <View style={styles.inputBox}>
                  <TextInput style={styles.inputText} value={checkInTime} onChangeText={setCheckInTime} />
                  <Feather name="clock" size={16} color="#666" />
                </View>
              </View>
            </View>

            {/* CHECK OUT ROW */}
            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.formLabel}>Check-Out Date</Text>
                <View style={styles.inputBox}>
                  <TextInput style={styles.inputText} value={checkOutDate} onChangeText={setCheckOutDate} />
                  <Feather name="calendar" size={16} color="#666" />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>Check-Out Time</Text>
                <View style={styles.inputBox}>
                  <TextInput style={styles.inputText} value={checkOutTime} onChangeText={setCheckOutTime} />
                  <Feather name="clock" size={16} color="#666" />
                </View>
              </View>
            </View>

            {/* REASON TEXTAREA */}
            <Text style={styles.formLabel}>Reason</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Enter description here..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                maxLength={250}
                value={reason}
                onChangeText={setReason}
              />
              <Text style={styles.charCount}>{reason.length}/250</Text>
            </View>
          </ScrollView>

          {/* FORM FOOTER BUTTONS */}
          <View style={styles.formFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitForm} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Feather name="send" size={14} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  iconBtn: { padding: 6 },
  headerTextCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  headerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A' },
  todayBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 40, gap: 6 },
  todayBtnText: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
  metricsScroll: { paddingLeft: 16, marginTop: 12 },
  metricCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, width: 90, marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'flex-start' },
  metricIcon: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metricVal: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  metricLbl: { fontSize: 11, color: '#64748B', marginTop: 2 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  showDropdown: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  showText: { fontSize: 12, color: '#64748B' },
  showVal: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  totalCountText: { fontSize: 12, fontWeight: 'bold', color: '#2563EB' },
  resetFilterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resetFilterText: { fontSize: 12, color: '#2563EB', fontWeight: '500' },
  listContainer: { paddingHorizontal: 16, gap: 12 },
  requestCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  userName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  dateSubtext: { fontSize: 11, color: '#64748B' },
  timeDetailsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginVertical: 12 },
  timeCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconCircleGreen: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  iconCircleRed: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  iconCircleBlue: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  iconCircleOrange: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  timeVal: { fontSize: 11, fontWeight: 'bold', color: '#0F172A' },
  timeLbl: { fontSize: 9, color: '#64748B' },
  reasonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  reasonLbl: { fontSize: 10, color: '#94A3B8' },
  reasonVal: { fontSize: 12, color: '#334155', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  detailsModalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  filterModalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  modalTopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalHeaderTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  detailsList: { gap: 12, marginVertical: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 },
  actionsTitle: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 4 },
  actionIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 11, fontWeight: '500', color: '#334155' },
  addModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  addModalTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  addModalSub: { fontSize: 11, color: '#64748B' },
  formRow: { flexDirection: 'row', marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 42 },
  inputText: { flex: 1, fontSize: 12, color: '#0F172A' },
  textAreaBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, height: 120, justifyContent: 'space-between' },
  textAreaInput: { fontSize: 12, color: '#0F172A', textAlignVertical: 'top', flex: 1 },
  charCount: { fontSize: 10, color: '#94A3B8', textAlign: 'right' },
  formFooter: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  cancelBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  submitBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 8, fontSize: 13, color: '#94A3B8' },
});