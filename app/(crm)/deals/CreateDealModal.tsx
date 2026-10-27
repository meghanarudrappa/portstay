// // import React, { useState } from 'react';
// // import {
// //   StyleSheet,
// //   Text,
// //   View,
// //   TouchableOpacity,
// //   TextInput,
// //   ScrollView,
// //   Switch,
// //   ActivityIndicator,
// //   Alert,
// //   KeyboardAvoidingView,
// //   Platform,
// // } from 'react-native';
// // import { Feather } from '@expo/vector-icons';
// // import { createLead } from '@/app/config/crmService';

// // interface Props {
// //   onClose: () => void;
// //   onRefresh: () => void;
// // }

// // const TITLE_OPTIONS = ['--', 'Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.'];

// // export default function CreateDealModal({ onClose, onRefresh }: Props) {
// //   const [title, setTitle] = useState('--');
// //   const [isTitleDropdownOpen, setIsTitleDropdownOpen] = useState(false);
// //   const [firstName, setFirstName] = useState('');
// //   const [lastName, setLastName] = useState('');
// //   const [companyName, setCompanyName] = useState('');
// //   const [dealDate, setDealDate] = useState('');
// //   const [dealValue, setDealValue] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [phone, setPhone] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [confirmQuotationConversion, setConfirmQuotationConversion] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async () => {
// //     // 🔍 STEP 1: Debug Client-Side Validation
// //     console.log('--- [DEBUG] Form Submit Triggered ---');
// //     console.log('Current Form Inputs:', { firstName, lastName, email, phone, companyName });

// //     if (!firstName.trim()) {
// //       console.warn('[DEBUG Validation Failed]: First Name is missing.');
// //       Alert.alert('Validation Error', 'First Name is required.');
// //       return;
// //     }

// //     setLoading(true);

// //     const payload = {
// //       type: 'deals',
// //       title: title === '--' ? '' : title,
// //       contact_Person: firstName,
// //       lastName: lastName,
// //       company_Name: companyName,
// //       attendBy: dealDate,
// //       dealValue: dealValue,
// //       email: email,
// //       phone: phone,
// //       summary: description,
// //       confirmConversion: confirmQuotationConversion ? 'on' : 'off',
// //       // ISO Date is safer for most DBs than formatted strings
// //       date: new Date().toISOString(), 
// //     };

// //     // 🔍 STEP 2: Log Payload directly before dispatching to API service
// //     console.log('[DEBUG Outgoing Payload]:', JSON.stringify(payload, null, 2));

// //     try {
// //       const response = await createLead(payload);
      
// //       // 🔍 STEP 3: Log API Service Output
// //       console.log('[DEBUG API Service Response]:', response);

// //       if (response) {
// //         console.log('[DEBUG Success]: Lead created successfully. Refreshing list.');
// //         onRefresh();
// //         onClose();
// //       } else {
// //         console.error('[DEBUG Error]: Service returned false or non-ok response.');
// //         Alert.alert('Error', 'Failed to create lead. Check logs for details.');
// //       }
// //     } catch (err) {
// //       // 🔍 STEP 4: Catch Unhandled Exception
// //       console.error('[DEBUG Critical Exception during createLead]:', err);
// //       Alert.alert('Error', 'An unexpected error occurred while saving.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <View style={styles.modalOverlay}>
// //       <KeyboardAvoidingView
// //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //         style={styles.keyboardContainer}
// //       >
// //         <View style={styles.modalContent}>
// //           {/* Header */}
// //           <View style={styles.modalHeader}>
// //             <View style={styles.headerTitleRow}>
// //               <View style={styles.iconCircle}>
// //                 <Feather name="dollar-sign" size={16} color="#fff" />
// //               </View>
// //               <View style={{ marginLeft: 8 }}>
// //                 <Text style={styles.modalTitle}>Create New Deal</Text>
// //                 <Text style={styles.modalSubtitle}>
// //                   Track opportunities and manage deal pipeline
// //                 </Text>
// //               </View>
// //             </View>
// //             <TouchableOpacity onPress={onClose} style={styles.closeTouchArea}>
// //               <Feather name="x" size={20} color="#64748b" />
// //             </TouchableOpacity>
// //           </View>

// //           {/* Form Body */}
// //           <ScrollView
// //             style={styles.formContainer}
// //             contentContainerStyle={styles.scrollContent}
// //             showsVerticalScrollIndicator={true}
// //             keyboardShouldPersistTaps="handled"
// //             bounces={false}
// //           >
// //             <Text style={styles.sectionHeader}>Deal Information</Text>

// //             {/* Title & Names Row */}
// //             <View style={styles.nameRow}>
// //               <View style={[styles.titleGroup, { zIndex: isTitleDropdownOpen ? 9999 : 1 }]}>
// //                 <Text style={styles.label}>Title</Text>
// //                 <TouchableOpacity
// //                   style={styles.dropdownBtn}
// //                   onPress={() => setIsTitleDropdownOpen(!isTitleDropdownOpen)}
// //                 >
// //                   <Text style={styles.dropdownBtnText}>{title}</Text>
// //                   <Feather name="chevron-down" size={14} color="#64748b" />
// //                 </TouchableOpacity>

// //                 {isTitleDropdownOpen && (
// //                   <View style={styles.dropdownMenu}>
// //                     {TITLE_OPTIONS.map((item) => (
// //                       <TouchableOpacity
// //                         key={item}
// //                         style={[
// //                           styles.dropdownItem,
// //                           title === item && styles.dropdownItemSelected,
// //                         ]}
// //                         onPress={() => {
// //                           setTitle(item);
// //                           setIsTitleDropdownOpen(false);
// //                         }}
// //                       >
// //                         <Text
// //                           style={[
// //                             styles.dropdownItemText,
// //                             title === item && styles.dropdownItemTextSelected,
// //                           ]}
// //                         >
// //                           {item}
// //                         </Text>
// //                       </TouchableOpacity>
// //                     ))}
// //                   </View>
// //                 )}
// //               </View>

// //               {/* First Name Input */}
// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>First Name *</Text>
// //                 <TextInput
// //                   placeholder="Enter First Name"
// //                   value={firstName}
// //                   onChangeText={setFirstName}
// //                   style={styles.input}
// //                 />
// //               </View>

// //               {/* Last Name Input */}
// //               <View style={styles.inputGroup}>
// //                 <Text style={styles.label}>Last Name</Text>
// //                 <TextInput
// //                   placeholder="Enter Last Name"
// //                   value={lastName}
// //                   onChangeText={setLastName}
// //                   style={styles.input}
// //                 />
// //               </View>
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Company Name</Text>
// //               <TextInput
// //                 placeholder="Enter company name"
// //                 value={companyName}
// //                 onChangeText={setCompanyName}
// //                 style={styles.input}
// //               />
// //             </View>

// //             <View style={styles.row}>
// //               <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
// //                 <Text style={styles.label}> Deal Date </Text>
// //                 <TextInput
// //                   value={dealDate}
// //                   onChangeText={setDealDate}
// //                   style={styles.input}
// //                 />
// //               </View>
// //               <View style={[styles.inputGroup, { flex: 1 }]}>
// //                 <Text style={styles.label}>Deal Value</Text>
// //                 <TextInput
// //                   placeholder="Select source"
// //                   value={dealValue}
// //                   onChangeText={setDealValue}
// //                   style={styles.input}
// //                 />
// //               </View>
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Email</Text>
// //               <TextInput
// //                 placeholder="Enter email address"
// //                 value={email}
// //                 onChangeText={setEmail}
// //                 keyboardType="email-address"
// //                 autoCapitalize="none"
// //                 style={styles.input}
// //               />
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Phone</Text>
// //               <View style={styles.phoneInputRow}>
// //                 <Text style={styles.countryPrefix}>IN +91</Text>
// //                 <TextInput
// //                   placeholder="Enter phone"
// //                   value={phone}
// //                   onChangeText={setPhone}
// //                   keyboardType="phone-pad"
// //                   style={styles.flexInput}
// //                 />
// //               </View>
// //             </View>

// //             <View style={styles.inputGroup}>
// //               <Text style={styles.label}>Description</Text>
// //               <TextInput
// //                 placeholder="Add description about this lead"
// //                 value={description}
// //                 onChangeText={setDescription}
// //                 multiline
// //                 numberOfLines={3}
// //                 style={[styles.input, styles.textArea]}
// //               />
// //             </View>

// //             <View style={styles.checkboxCard}>
// //               <View style={{ flex: 1, paddingRight: 10 }}>
// //                 <Text style={styles.switchTitle}>Convert to Quotation</Text>
// //                 <Text style={styles.switchSubtitle}>
// //                   Automatically create a quotation draft upon saving
// //                 </Text>
// //               </View>
// //               <Switch
// //                 value={confirmQuotationConversion}
// //                 onValueChange={setConfirmQuotationConversion}
// //                 trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
// //               />
// //             </View>
// //           </ScrollView>

// //           {/* Footer Actions */}
// //           <View style={styles.footer}>
// //             <TouchableOpacity
// //               style={styles.cancelBtn}
// //               onPress={onClose}
// //               disabled={loading}
// //             >
// //               <Text style={styles.cancelBtnText}>Close</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               style={styles.submitBtn}
// //               onPress={handleSubmit}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#fff" size="small" />
// //               ) : (
// //                 <Text style={styles.submitBtnText}>+ Create Deal</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </KeyboardAvoidingView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 16,
// //   },
// //   keyboardContainer: {
// //     width: '100%',
// //     maxHeight: '85%',
// //     justifyContent: 'center',
// //   },
// //   modalContent: {
// //     backgroundColor: '#ffffff',
// //     borderRadius: 14,
// //     overflow: 'hidden',
// //     width: '100%',
// //     maxHeight: '100%',
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 18,
// //     paddingVertical: 14,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#f1f5f9',
// //     backgroundColor: '#ffffff',
// //   },
// //   headerTitleRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flex: 1,
// //   },
// //   iconCircle: {
// //     width: 32,
// //     height: 32,
// //     borderRadius: 16,
// //     backgroundColor: '#2563eb',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   modalTitle: {
// //     fontSize: 16,
// //     fontWeight: '700',
// //     color: '#0f172a',
// //   },
// //   modalSubtitle: {
// //     fontSize: 11,
// //     color: '#64748b',
// //     marginTop: 1,
// //   },
// //   closeTouchArea: {
// //     padding: 6,
// //     borderRadius: 8,
// //     backgroundColor: '#f8fafc',
// //   },
// //   formContainer: {
// //     flexShrink: 1,
// //   },
// //   scrollContent: {
// //     paddingHorizontal: 18,
// //     paddingTop: 16,
// //     paddingBottom: 24,
// //   },
// //   sectionHeader: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: '#2563eb',
// //     marginBottom: 12,
// //   },
// //   nameRow: {
// //     flexDirection: 'column',
// //   },
// //   titleGroup: {
// //     position: 'relative',
// //     marginBottom: 14,
// //   },
// //   dropdownBtn: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#cbd5e1',
// //     borderRadius: 8,
// //     paddingHorizontal: 12,
// //     height: 40,
// //     backgroundColor: '#f8fafc',
// //   },
// //   dropdownBtnText: {
// //     fontSize: 14,
// //     color: '#0f172a',
// //     fontWeight: '500',
// //   },
// //   dropdownMenu: {
// //     position: 'absolute',
// //     top: 68,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: '#ffffff',
// //     borderWidth: 1,
// //     borderColor: '#cbd5e1',
// //     borderRadius: 8,
// //     elevation: 8,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 8,
// //   },
// //   dropdownItem: {
// //     paddingVertical: 10,
// //     paddingHorizontal: 12,
// //   },
// //   dropdownItemSelected: {
// //     backgroundColor: '#2563eb',
// //   },
// //   dropdownItemText: {
// //     fontSize: 13,
// //     color: '#0f172a',
// //   },
// //   dropdownItemTextSelected: {
// //     color: '#ffffff',
// //     fontWeight: '600',
// //   },
// //   row: {
// //     flexDirection: 'row',
// //   },
// //   inputGroup: {
// //     marginBottom: 14,
// //   },
// //   label: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: '#334155',
// //     marginBottom: 6,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#cbd5e1',
// //     borderRadius: 8,
// //     paddingHorizontal: 12,
// //     height: 40,
// //     fontSize: 14,
// //     color: '#0f172a',
// //     backgroundColor: '#f8fafc',
// //   },
// //   phoneInputRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#cbd5e1',
// //     borderRadius: 8,
// //     height: 40,
// //     backgroundColor: '#f8fafc',
// //     overflow: 'hidden',
// //   },
// //   countryPrefix: {
// //     fontSize: 13,
// //     fontWeight: '500',
// //     color: '#475569',
// //     paddingHorizontal: 10,
// //     borderRightWidth: 1,
// //     borderRightColor: '#cbd5e1',
// //   },
// //   flexInput: {
// //     flex: 1,
// //     fontSize: 14,
// //     color: '#0f172a',
// //     paddingHorizontal: 10,
// //     height: '100%',
// //   },
// //   textArea: {
// //     height: 70,
// //     paddingTop: 8,
// //     paddingBottom: 8,
// //     textAlignVertical: 'top',
// //   },
// //   checkboxCard: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     padding: 12,
// //     backgroundColor: '#f8fafc',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#cbd5e1',
// //     marginTop: 4,
// //     marginBottom: 8,
// //   },
// //   switchTitle: {
// //     fontSize: 13,
// //     fontWeight: '600',
// //     color: '#0f172a',
// //   },
// //   switchSubtitle: {
// //     fontSize: 11,
// //     color: '#64748b',
// //     marginTop: 2,
// //   },
// //   footer: {
// //     flexDirection: 'row',
// //     justifyContent: 'flex-end',
// //     paddingHorizontal: 18,
// //     paddingVertical: 12,
// //     borderTopWidth: 1,
// //     borderTopColor: '#f1f5f9',
// //     backgroundColor: '#ffffff',
// //   },
// //   cancelBtn: {
// //     paddingHorizontal: 16,
// //     height: 40,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#cbd5e1',
// //     marginRight: 10,
// //   },
// //   cancelBtnText: {
// //     fontSize: 13,
// //     color: '#475569',
// //     fontWeight: '600',
// //   },
// //   submitBtn: {
// //     backgroundColor: '#2563eb',
// //     paddingHorizontal: 18,
// //     height: 40,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderRadius: 8,
// //   },
// //   submitBtnText: {
// //     fontSize: 13,
// //     color: '#ffffff',
// //     fontWeight: '600',
// //   },
// // });


import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createLead } from '@/app/config/crmService';

interface Props {
  onClose: () => void;
  onRefresh: () => void;
}

const TITLE_OPTIONS = ['--', 'Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.'];

export default function CreateDealModal({ onClose, onRefresh }: Props) {
  const [title, setTitle] = useState('--');
  const [isTitleDropdownOpen, setIsTitleDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('New');
  
  // Date Picker States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dealDate, setDealDate] = useState<string>(''); // Stores formatted string "MM/DD/YY"
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const [dealValue, setDealValue] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [confirmQuotationConversion, setConfirmQuotationConversion] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to format Date object into MM/DD/YY
  const formatDateToDDMMYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    // Hide picker on Android after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setDealDate(formatDateToDDMMYY(date));
    }
  };

  const handleSubmit = async () => {
    console.log('--- [DEBUG] Form Submit Triggered ---');
    console.log('Current Form Inputs:', { firstName, lastName, email, phone, companyName, dealDate });

    if (!firstName.trim()) {
      console.warn('[DEBUG Validation Failed]: First Name is missing.');
      Alert.alert('Validation Error', 'First Name is required.');
      return;
    }

    setLoading(true);

    const payload = {
      type: 'deals',
      title: title === '--' ? '' : title,
      contact_Person: firstName,
      lastName: lastName,
      company_Name: companyName,
      closingDate: dealDate, // Formatted as MM/DD/YY
      amount: dealValue,
      email: email,
      phone: phone,
      summary: description,
      confirmConversion: confirmQuotationConversion ? 'on' : 'off',
      date: new Date().toISOString(), 
      status: status || 'New',
    };

    console.log('[DEBUG Outgoing Payload]:', JSON.stringify(payload, null, 2));

    try {
      const response = await createLead(payload);
      console.log('[DEBUG API Service Response]:', response);

      if (response) {
        console.log('[DEBUG Success]: Deal created successfully. Refreshing list.');
        onRefresh();
        onClose();
      } else {
        console.error('[DEBUG Error]: Service returned false or non-ok response.');
        Alert.alert('Error', 'Failed to create deal. Check logs for details.');
      }
    } catch (err) {
      console.error('[DEBUG Critical Exception during createLead]:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Feather name="dollar-sign" size={16} color="#fff" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.modalTitle}>Create New Deal</Text>
                <Text style={styles.modalSubtitle}>
                  Track opportunities and manage deal pipeline
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeTouchArea}>
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.sectionHeader}>Deal Information</Text>

            {/* Title & Names Row */}
            <View style={styles.nameRow}>
              <View style={[styles.titleGroup, { zIndex: isTitleDropdownOpen ? 9999 : 1 }]}>
                <Text style={styles.label}>Title</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setIsTitleDropdownOpen(!isTitleDropdownOpen)}
                >
                  <Text style={styles.dropdownBtnText}>{title}</Text>
                  <Feather name="chevron-down" size={14} color="#64748b" />
                </TouchableOpacity>

                {isTitleDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {TITLE_OPTIONS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.dropdownItem,
                          title === item && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setTitle(item);
                          setIsTitleDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            title === item && styles.dropdownItemTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* First Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  placeholder="Enter First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                />
              </View>

              {/* Last Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  placeholder="Enter Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                placeholder="Enter company name"
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              {/* Deal Date Input with Calendar Trigger */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>Closing Date</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={dealDate ? styles.dateText : styles.placeholderText}>
                    {dealDate || 'MM/DD/YY'}
                  </Text>
                  <Feather name="calendar" size={16} color="#64748b" />
                </TouchableOpacity>

                {/* Calendar Picker Modal/Component */}
                {showDatePicker && (
                  Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newDate = new Date(e.target.value);
                          setSelectedDate(newDate);
                          setDealDate(formatDateToDDMMYY(newDate));
                        }
                        setShowDatePicker(false);
                      }}
                      style={{ marginTop: 8, padding: 8, borderRadius: 6, borderWidth: 1 }}
                    />
                  ) : (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={handleDateChange}
                    />
                  )
                )}
              </View>

              {/* Deal Value Input */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Deal Value</Text>
                <TextInput
                  placeholder="Enter deal value"
                  value={dealValue}
                  onChangeText={setDealValue}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.phoneInputRow}>
                <Text style={styles.countryPrefix}>IN +91</Text>
                <TextInput
                  placeholder="Enter phone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.flexInput}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholder="Add description about this lead"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />
            </View>

            <View style={styles.checkboxCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.switchTitle}>Convert to Quotation</Text>
                <Text style={styles.switchSubtitle}>
                  Automatically create a quotation draft upon saving
                </Text>
              </View>
              <Switch
                value={confirmQuotationConversion}
                onValueChange={setConfirmQuotationConversion}
                trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>+ Create Deal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '85%',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeTouchArea: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  formContainer: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'column',
  },
  titleGroup: {
    position: 'relative',
    marginBottom: 14,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#f8fafc',
  },
  dropdownBtnText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#2563eb',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#0f172a',
  },
  dropdownItemTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  datePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#f8fafc',
  },
  dateText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 40,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  countryPrefix: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  flexInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingHorizontal: 10,
    height: '100%',
  },
  textArea: {
    height: 70,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 4,
    marginBottom: 8,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  switchSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
});
