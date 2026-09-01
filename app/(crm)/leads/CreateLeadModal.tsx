// app/(crm)/components/CreateLeadModal.tsx
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
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createLead } from '@/app/config/crmService';

interface Props {
  onClose: () => void;
  onRefresh: () => void;
}

const TITLE_OPTIONS = ['--', 'Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.'];

export default function CreateLeadModal({ onClose, onRefresh }: Props) {
  const [title, setTitle] = useState('--');
  const [isTitleDropdownOpen, setIsTitleDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [leadOwner, setLeadOwner] = useState('crm manager');
  const [leadSource, setLeadSource] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [confirmQuotationConversion, setConfirmQuotationConversion] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First Name is required.');
      return;
    }

    setLoading(true);
    const success = await createLead({
      title: title === '--' ? '' : title,
      firstName,
      lastName,
      companyName,
      leadOwner,
      leadSource,
      email,
      phone,
      description,
      confirmQuotationConversion,
    });
    setLoading(false);

    if (success) {
      onRefresh();
      onClose();
    } else {
      Alert.alert('Error', 'Failed to create lead. Please try again.');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconCircle}>
              <Feather name="star" size={16} color="#fff" />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.modalTitle}>Create New Lead</Text>
              <Text style={styles.modalSubtitle}>Capture new opportunities and grow your pipeline</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Lead Information</Text>

          {/* Title, First Name, Last Name Row */}
          <View style={styles.nameRow}>
            {/* Title Dropdown Selector */}
            <View style={styles.titleGroup}>
              <Text style={styles.label}>Title</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setIsTitleDropdownOpen(!isTitleDropdownOpen)}
              >
                <Text style={styles.dropdownBtnText}>{title}</Text>
                <Feather name="chevron-down" size={14} color="#64748b" />
              </TouchableOpacity>

              {/* Title Dropdown Menu Overlay */}
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
            <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                placeholder="Enter First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
              />
            </View>

            {/* Last Name Input */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
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
            <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>Lead Owner *</Text>
              <TextInput
                value={leadOwner}
                onChangeText={setLeadOwner}
                style={styles.input}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Lead Source</Text>
              <TextInput
                placeholder="Select source"
                value={leadSource}
                onChangeText={setLeadSource}
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
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            />
          </View>

          <View style={styles.checkboxRow}>
            <Switch
              value={confirmQuotationConversion}
              onValueChange={setConfirmQuotationConversion}
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            />
            <Text style={styles.checkboxLabel}>Confirm lead to quotation conversion</Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>+ Create Lead</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding:10  },
  keyboardContainer: {
    width: '100%',
    height: '80%', // Explicit height forces ScrollView bounds
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, height: '88%', overflow: 'hidden',  paddingLeft:10 },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeTouchArea: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  formContainer: {
    flex: 1, // Directly claims leftover space between Header and Footer
  },
  checkboxLabel: { fontSize: 13, color: '#475569', marginLeft: 6 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#2563eb', marginBottom: 10 },
 
  nameRow: { flexDirection: 'column', zIndex: 1000, marginBottom: 10 },

  titleGroup: {
    position: 'relative',
    marginBottom:10
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#ffffff',
  },
  dropdownBtnText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    elevation: 6,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
    fontSize: 14,
    color: '#0f172a', 
    backgroundColor: '#f8fafc',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  flexInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingHorizontal: 12,
    height: '100%',
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 4,
    marginBottom: 16,
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
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  cancelBtn: {
    paddingHorizontal: 18,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  submitBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});


// const styles = StyleSheet.create({
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 12 },
//   modalContent: { backgroundColor: '#fff', borderRadius: 12, height: '80%', overflow: 'hidden' },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//   headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
//   iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
//   modalTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
//   modalSubtitle: { fontSize: 10, color: '#64748b' },
//   formContainer: { flex: 1, padding: 12 },
//   sectionHeader: { fontSize: 13, fontWeight: '700', color: '#2563eb', marginBottom: 10 },
//   nameRow: { flexDirection: 'row', zIndex: 1000, marginBottom: 10 },
//   titleGroup: { width: 65, marginRight: 6, position: 'relative' },
//   dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#fff' },
//   dropdownBtnText: { fontSize: 11, color: '#0f172a' },
//   dropdownMenu: { position: 'absolute', top: 40, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, elevation: 5, zIndex: 2000, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   dropdownItem: { paddingVertical: 6, paddingHorizontal: 8 },
//   dropdownItemSelected: { backgroundColor: '#2563eb' },
//   dropdownItemText: { fontSize: 11, color: '#0f172a' },
//   dropdownItemTextSelected: { color: '#fff', fontWeight: '600' },
//   row: { flexDirection: 'row' },
//   inputGroup: { marginBottom: 10 },
//   label: { fontSize: 10, fontWeight: '600', color: '#475569', marginBottom: 3 },
//   input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, fontSize: 11, color: '#0f172a' },
//   phoneInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8 },
//   countryPrefix: { fontSize: 10, color: '#64748b', marginRight: 6 },
//   flexInput: { flex: 1, paddingVertical: 5, fontSize: 11, color: '#0f172a' },
//   checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 },
//   checkboxLabel: { fontSize: 10, color: '#475569', marginLeft: 6 },
//   footer: { flexDirection: 'row', justifyContent: 'flex-end', padding: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#f8fafc' },
//   cancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
//   cancelBtnText: { fontSize: 11, color: '#475569', fontWeight: '600' },
//   submitBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
//   submitBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' },
// });