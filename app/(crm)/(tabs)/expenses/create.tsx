import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { expenseService } from '@/app/config/expenseApi';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const DEPARTMENTS = ['Operations', 'Finance', 'Sales', 'Support', 'IT Management', 'Human Resources'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'];
const TAX_PERCENTS = [0, 5, 18, 40];
const EXPENSE_CATEGORIES = [
  'Travel', 'Fuel Expenses', 'Toll Charges', 'Parking Charges', 'Lodging', 
  'Local Conveyance', 'Meals', 'Client Entertainment', 'Office Supplies', 
  'Communication / Internet', 'Printing & Stationery', 'Medical Reimbursement', 
  'Training & Seminar', 'Miscellaneous', 'Others'
];

export default function CreateExpenseForm() {
  const router = useRouter();
  const [initializing, setInitializing] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const [activeModal, setActiveModal] = useState<{ type: 'dept' | 'pay' | 'cat' | 'lineCat' | 'tax' | null }>({ type: null });
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; uri: string }[]>([]);

  const [showClaimDatePicker, setShowClaimDatePicker] = useState<boolean>(false);
  const [showLineDatePicker, setShowLineDatePicker] = useState<boolean>(false);

  // 🌟 State to store the full server company metadata profile context dynamically
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  // Core state containing zero static fallback strings
  const [claimForm, setClaimForm] = useState({
    expenseReferenceNo: '',
    employeeName: '',
    department: '',
    claimDate: new Date().toISOString().split('T')[0],
    expenseCategory: '',
    billNumber: '',
    vendorName: '',
    paymentMode: '',
    remarks: '',
    adjustment: 0,
    lineItems: [] as Array<{
      expenseDate: string;
      category: string;
      description: string;
      amount: number;
      taxAmount: number;
      totalAmount: number;
    }>
  });

  const [lineItemInput, setLineItemInput] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'Travel',
    description: '',
    amount: 0,
    taxAmount: 0
  });

  const financialSummary = useMemo(() => {
    const lines = claimForm.lineItems || [];
    const subTotal = lines.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalTax = lines.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0);
    const adjustment = Number(claimForm.adjustment) || 0;
    const grandTotal = subTotal + totalTax + adjustment;

    return { subTotal, totalTax, grandTotal };
  }, [claimForm.lineItems, claimForm.adjustment]);

  useEffect(() => {
  const syncBackendIdentityMetrics = async () => {
    try {
      setInitializing(true);
      // Cast the response to 'any' to stop TypeScript from complaining about missing fields
      const serverIdentity = await expenseService.getFormInitializationMetadata() as any;
      console.log("=== BACKEND RESPONSE ===", serverIdentity);
      
      // Now TypeScript will allow accessing these dynamic runtime properties safely
      if (serverIdentity.company) {
        setCompanyProfile(serverIdentity.company);
      } else if (serverIdentity.name || serverIdentity.gstin || serverIdentity.address) {
        setCompanyProfile(serverIdentity);
      }
      
      const currentYear = new Date().getFullYear();
      const sequenceRandom = Math.floor(10000 + Math.random() * 90000);

      setClaimForm(prev => {
        const serverName = serverIdentity.employeeName;
        const isBroken = !serverName || serverName === 'Operations';

        return {
          ...prev,
          expenseReferenceNo: `EXP-${currentYear}-${sequenceRandom}`,
          employeeName: isBroken ? '' : serverName,
          department: serverIdentity.department || 'Operations'
        };
      });
      
    } catch (err: any) {
      Alert.alert(
        'Session Unauthenticated',
        'Your active connection token has expired or is invalid. Please authorize login access credentials again.',
        [{ text: 'Exit Form', onPress: () => router.back() }]
      );
    } finally {
      setInitializing(false);
    }
  };
  syncBackendIdentityMetrics();
}, []);

  const adjustAmount = (inc: boolean) => {
    setLineItemInput(p => ({ ...p, amount: inc ? p.amount + 10 : Math.max(0, p.amount - 10) }));
  };

  const adjustAdjustment = (inc: boolean) => {
    setClaimForm(p => ({ ...p, adjustment: inc ? p.adjustment + 5 : Math.max(0, p.adjustment - 5) }));
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachedFiles(prev => [...prev, { name: result.assets[0].name, uri: result.assets[0].uri }]);
      }
    } catch {
      Alert.alert('File Picker Error', 'Unable to resolve dynamic storage context path.');
    }
  };

  const insertLineItem = () => {
    if (!lineItemInput.description.trim() || !lineItemInput.amount || lineItemInput.amount <= 0) {
      Alert.alert('Validation Failure', 'Please provide descriptive terms and valid non-zero amounts.');
      return;
    }

    const computedTax = lineItemInput.amount * (Number(lineItemInput.taxAmount) / 100);
    const computedTotal = lineItemInput.amount + computedTax;

    const rowItem = {
      expenseDate: lineItemInput.expenseDate,
      category: lineItemInput.category,
      description: lineItemInput.description.trim(),
      amount: Number(lineItemInput.amount),
      taxAmount: computedTax, 
      totalAmount: computedTotal
    };

    setClaimForm(prev => ({ ...prev, lineItems: [...prev.lineItems, rowItem] }));
    setLineItemInput({ expenseDate: new Date().toISOString().split('T')[0], category: 'Travel', description: '', amount: 0, taxAmount: 0 });
  };

  const removeLineItem = (indexToRemove: number) => {
    setClaimForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, idx) => idx !== indexToRemove)
    }));
  };
      
  const dispatchFormPayload = async () => {
    if (!claimForm.expenseReferenceNo || !claimForm.expenseCategory || claimForm.lineItems.length === 0) {
      Alert.alert('Incomplete Submissions', 'Please ensure reference tracking markers, categories, and items are filled completely.');
      return;
    }

    // 🌟 Safely process the structured address context matching your details parameters parser mapping requirements
    const rawCompany = companyProfile || {};
    const nestedAddress = rawCompany.address || {};

    const processedCompany = {
      name: rawCompany.name || "Hdfc bank",
      gstin: rawCompany.gstin || "29AADCN7222P1ZX",
      area: nestedAddress.area || rawCompany.area || "560035",
      city: nestedAddress.city || rawCompany.city || "Bommanahalli",
      state: nestedAddress.state || rawCompany.state || "Karnataka",
      country: nestedAddress.country || rawCompany.country || "India"
    };

    // 🌟 Mix the dynamic processedCompany profile payload property line cleanly into structural form mappings
    const payload = {
      ...claimForm,
      company: processedCompany,
      subTotal: financialSummary.subTotal.toFixed(2),
      totalTax: financialSummary.totalTax.toFixed(2),
      grandTotal: financialSummary.grandTotal.toFixed(2)
    };

    try {
      setSubmitting(true);
      const serverResponse = await expenseService.saveTravelExpenseClaim(payload, attachedFiles);
      
      // Merge dynamic instance identifiers generated from database storage mappings
      const localizedNavigationPayload = {
        ...payload,
        id: serverResponse?.id || "CLAIM-TEMP-ID"
      };

      Alert.alert('Claim Logged', 'Expense transaction saved successfully into remote system tracking records.', [
        { 
          text: 'OK', 
          onPress: () => router.replace({ 
            pathname: '/expenses/details', 
            params: { id: serverResponse?.id || "CLAIM-TEMP-ID", data: JSON.stringify(localizedNavigationPayload) } 
          }) 
        }
      ]);
    } catch {
      Alert.alert('Network Disconnection', 'Could not sync multi-part state values over the server connection parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectionModal = () => {
    let data: string[] = []; let title = 'Select Option';
    let onSelect = (val: string) => {};

    if (activeModal.type === 'dept') {
      data = DEPARTMENTS; title = 'Select Department';
      onSelect = (val) => setClaimForm(p => ({ ...p, department: val }));
    } else if (activeModal.type === 'pay') {
      data = PAYMENT_MODES; title = 'Select Payment Mode';
      onSelect = (val) => setClaimForm(p => ({ ...p, paymentMode: val }));
    } else if (activeModal.type === 'cat') {
      data = EXPENSE_CATEGORIES; title = 'Select Expense Category';
      onSelect = (val) => setClaimForm(p => ({ ...p, expenseCategory: val }));
    } else if (activeModal.type === 'lineCat') {
      data = EXPENSE_CATEGORIES; title = 'Select Line Category';
      onSelect = (val) => setLineItemInput(p => ({ ...p, category: val }));
    } else if (activeModal.type === 'tax') {
      data = TAX_PERCENTS.map(t => `${t}%`); title = 'Select Tax Percent';
      onSelect = (val) => setLineItemInput(p => ({ ...p, taxAmount: parseInt(val) || 0 }));
    }

    return (
      <Modal visible={activeModal.type !== null} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveModal({ type: null })}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalHeaderTitle}>{title}</Text>
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalSelectionItem} onPress={() => { onSelect(item); setActiveModal({ type: null }); }}>
                  <Text style={styles.modalSelectionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0056FA" />
        <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13, fontWeight: '500' }}>Syncing server context matrices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.headerContentContainer}>
          <Text style={styles.headerMainTitle}>Expenses</Text>
          <Text style={styles.headerSubTitle}>Manage and track your expenses</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.mainScrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardLayoutWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-outline" size={16} color="#0056FA" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitleText}>Basic Information</Text>
          </View>

          <Text style={styles.fieldInputLabel}>REFERENCE NO <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TextInput style={styles.fieldInputElement} value={claimForm.expenseReferenceNo} onChangeText={val => setClaimForm(p => ({ ...p, expenseReferenceNo: val }))} />

          <Text style={styles.fieldInputLabel}>EMPLOYEE NAME <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TextInput 
            style={[
              styles.fieldInputElement, 
              claimForm.employeeName === '' ? null : styles.disabledInputStyle
            ]} 
            value={claimForm.employeeName} 
            onChangeText={val => {
              setClaimForm(prev => ({
                ...prev,
                employeeName: val
              }));
            }}
            placeholder="Enter your name"
            editable={claimForm.employeeName === '' || claimForm.employeeName.length >= 1 || claimForm.employeeName === 'Operations'} 
          />
          <View style={styles.twinFieldsFlexRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.fieldInputLabel}>DEPARTMENT</Text>
              <TouchableOpacity style={styles.pickerFieldEmulationBox} onPress={() => setActiveModal({ type: 'dept' })}>
                <Text style={styles.emulatedPickerText}>{claimForm.department || '--'}</Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fieldInputLabel}>CLAIM DATE</Text>
              <TouchableOpacity style={styles.pickerFieldEmulationBox} onPress={() => setShowClaimDatePicker(true)}>
                <Text style={styles.emulatedPickerText}>{claimForm.claimDate}</Text>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
              </TouchableOpacity>
              {showClaimDatePicker && (
                <DateTimePicker value={new Date(claimForm.claimDate)} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={(e, d) => { setShowClaimDatePicker(Platform.OS === 'ios'); if(d) setClaimForm(p => ({ ...p, claimDate: d.toISOString().split('T')[0] })); }} />
              )}
            </View>
          </View>

          <Text style={styles.fieldInputLabel}>EXPENSE CATEGORY <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TouchableOpacity style={styles.pickerFieldEmulationBox} onPress={() => setActiveModal({ type: 'cat' })}>
            <Text style={[styles.emulatedPickerText, !claimForm.expenseCategory && { color: '#94A3B8' }]}>{claimForm.expenseCategory || 'Select Expense'}</Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>

          <Text style={styles.fieldInputLabel}>BILL / RECEIPT NO</Text>
          <TextInput style={styles.fieldInputElement} placeholder="Enter bill number" placeholderTextColor="#94A3B8" value={claimForm.billNumber} onChangeText={val => setClaimForm(p => ({ ...p, billNumber: val }))} />

          <Text style={styles.fieldInputLabel}>VENDOR / MERCHANT</Text>
          <TextInput style={styles.fieldInputElement} placeholder="e.g. Uber, Hotel" placeholderTextColor="#94A3B8" value={claimForm.vendorName} onChangeText={val => setClaimForm(p => ({ ...p, vendorName: val }))} />

          <Text style={styles.fieldInputLabel}>PAYMENT MODE</Text>
          <TouchableOpacity style={styles.pickerFieldEmulationBox} onPress={() => setActiveModal({ type: 'pay' })}>
            <Text style={styles.emulatedPickerText}>{claimForm.paymentMode || 'Select Mode'}</Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardLayoutWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="file-tray-full-outline" size={16} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitleText}>Expense Line Items</Text>
          </View>

          <View style={styles.inlineNestedSubformBlock}>
            <View style={styles.twinFieldsFlexRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.subFieldInputLabel}>DATE</Text>
                <TouchableOpacity style={[styles.pickerFieldEmulationBox, { paddingVertical: 6 }]} onPress={() => setShowLineDatePicker(true)}>
                  <Text style={styles.emulatedPickerText}>{lineItemInput.expenseDate}</Text>
                  <Ionicons name="calendar-outline" size={12} color="#64748B" />
                </TouchableOpacity>
                {showLineDatePicker && (
                  <DateTimePicker value={new Date(lineItemInput.expenseDate)} mode="date" display="default" onChange={(e, d) => { setShowLineDatePicker(Platform.OS === 'ios'); if(d) setLineItemInput(p => ({ ...p, expenseDate: d.toISOString().split('T')[0] })); }} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subFieldInputLabel}>CATEGORY</Text>
                <TouchableOpacity style={[styles.pickerFieldEmulationBox, { paddingVertical: 6 }]} onPress={() => setActiveModal({ type: 'lineCat' })}>
                  <Text style={styles.emulatedPickerText}>{lineItemInput.category}</Text>
                  <Ionicons name="chevron-down" size={12} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.subFieldInputLabel}>DESCRIPTION <Text style={{ color: '#DC2626' }}>*</Text></Text>
            <TextInput style={[styles.fieldInputElement, { minHeight: 48, textAlignVertical: 'top', paddingVertical: 6 }]} placeholder="Describe the expense..." placeholderTextColor="#CBD5E1" multiline value={lineItemInput.description} onChangeText={val => setLineItemInput(p => ({ ...p, description: val }))} />

            <View style={styles.tripleFieldsFlexRow}>
              <View style={{ flex: 1.4, marginRight: 8 }}>
                <Text style={styles.subFieldInputLabel}>AMOUNT <Text style={{ color: '#DC2626' }}>*</Text></Text>
                <View style={styles.stepperContainerInput}>
                  <TextInput style={styles.stepperInputElement} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94A3B8" value={lineItemInput.amount ? lineItemInput.amount.toString() : ''} onChangeText={val => setLineItemInput(p => ({ ...p, amount: parseFloat(val) || 0 }))} />
                  <View style={styles.stepperIconsColumn}>
                    <TouchableOpacity onPress={() => adjustAmount(true)}><Ionicons name="chevron-up" size={12} color="#64748B" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => adjustAmount(false)}><Ionicons name="chevron-down" size={12} color="#64748B" /></TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.subFieldInputLabel}>TAX %</Text>
                <TouchableOpacity style={[styles.pickerFieldEmulationBox, { paddingVertical: 6 }]} onPress={() => setActiveModal({ type: 'tax' })}>
                  <Text style={styles.emulatedPickerText}>{lineItemInput.taxAmount}%</Text>
                  <Ionicons name="chevron-down" size={12} color="#64748B" />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.subFieldInputLabel}>TOTAL</Text>
                <Text style={styles.calculatedStaticRowText}>₹ {(lineItemInput.amount * (1 + lineItemInput.taxAmount / 100)).toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.dashedAddLineButton} onPress={insertLineItem}>
              <Text style={styles.dashedAddLineButtonText}>+ Add Expense Line</Text>
            </TouchableOpacity>
          </View>

          {claimForm.lineItems.map((item, idx) => (
            <View key={idx} style={styles.renderedRowLogNode}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.itemOutputDescText}>{item.description}</Text>
                <Text style={styles.itemOutputMetaText}>Date: {item.expenseDate} | Cat: {item.category} | Base: ₹{item.amount.toFixed(2)} | Tax: ₹{item.taxAmount.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={styles.itemOutputTotalValue}>₹{item.totalAmount.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeLineItem(idx)}><Ionicons name="trash-outline" size={16} color="#EF4444" /></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.cardLayoutWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="create-outline" size={16} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitleText}>Remarks & Attachment</Text>
          </View>
          <TextInput style={[styles.fieldInputElement, { height: 75, textAlignVertical: 'top', paddingTop: 8 }]} placeholder="Provide justification detail..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} value={claimForm.remarks} onChangeText={val => setClaimForm(p => ({ ...p, remarks: val }))} />

          <Text style={[styles.fieldInputLabel, { marginTop: 14 }]}>ATTACHMENT (OPTIONAL)</Text>
          <TouchableOpacity style={styles.dashedUploadZoneBox} onPress={handleDocumentPick}>
            <Ionicons name="link" size={18} color="#0056FA" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadZoneMainText}><Text style={{ color: '#0056FA', fontWeight: '600' }}>Upload</Text> invoices or bills</Text>
              <Text style={styles.uploadZoneSubText}>PDF, JPG, PNG up to 10 MB</Text>
            </View>
          </TouchableOpacity>

          {attachedFiles.map((file, index) => (
            <View key={index} style={styles.fileAttachmentRow}>
              <Ionicons name="document-attach-outline" size={14} color="#64748B" />
              <Text style={styles.fileAttachmentText} numberOfLines={1}>{file.name}</Text>
              <TouchableOpacity onPress={() => setAttachedFiles(p => p.filter((_, i) => i !== index))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.blueSummaryLayoutCard}>
          <View style={styles.summaryTitleHeaderRow}>
            <Ionicons name="calculator-outline" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.summaryCardTitleText}>Summary</Text>
          </View>
          <View style={styles.summaryItemFlexLine}><Text style={styles.summaryLabelText}>Sub-Total (₹)</Text><Text style={styles.summaryValueText}>{financialSummary.subTotal.toFixed(2)}</Text></View>
          <View style={styles.summaryItemFlexLine}><Text style={styles.summaryLabelText}>Total Tax (₹)</Text><Text style={styles.summaryValueText}>{financialSummary.totalTax.toFixed(2)}</Text></View>
          <View style={[styles.summaryItemFlexLine, { alignItems: 'center', marginVertical: 4 }]}>
            <Text style={styles.summaryLabelText}>Adjustments (₹)</Text>
            <View style={[styles.stepperContainerInput, { width: 110, backgroundColor: '#FFFFFF', borderColor: 'transparent', height: 32 }]}>
              <TextInput style={[styles.stepperInputElement, { color: '#0F172A', paddingVertical: 2 }]} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94A3B8" value={claimForm.adjustment ? claimForm.adjustment.toString() : ''} onChangeText={val => setClaimForm(p => ({ ...p, adjustment: parseFloat(val) || 0 }))} />
              <View style={styles.stepperIconsColumn}>
                <TouchableOpacity onPress={() => adjustAdjustment(true)}><Ionicons name="chevron-up" size={10} color="#64748B" /></TouchableOpacity>
                <TouchableOpacity onPress={() => adjustAdjustment(false)}><Ionicons name="chevron-down" size={10} color="#64748B" /></TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.totalSumDividerLine} />
          <View style={styles.summaryItemFlexLine}><Text style={styles.totalPriceLabel}>Total Amount</Text><Text style={styles.totalPriceValue}>₹ {financialSummary.grandTotal.toFixed(2)}</Text></View>
        </View>

        <View style={styles.importantNotesContainerBox}>
          <Text style={styles.importantNotesMainHeader}>Important Notes</Text>
          <Text style={styles.bulletPointItem}>• Ensure all details are correct before submission</Text>
          <Text style={styles.bulletPointItem}>• Attach original receipts and bills correctly</Text>
          <Text style={styles.bulletPointItem}>• Claims without receipts may be rejected</Text>
          <Text style={styles.bulletPointItem}>• You can save a draft and submit later</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.stickyFooterActionBar}>
        <View style={styles.footerStickyTotalBlock}>
          <Text style={styles.footerTotalLabel}>Total Claim</Text>
          <Text style={styles.footerTotalAmountValue}>₹{financialSummary.grandTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.footerActionButtonsGroup}>
          <TouchableOpacity style={styles.cancelFooterButton} onPress={() => router.back()}><Text style={styles.cancelFooterButtonText}>Close</Text></TouchableOpacity>
          <TouchableOpacity style={styles.submitFooterButton} onPress={dispatchFormPayload} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.submitFooterButtonText}>Submit Claim</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {renderSelectionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  safeHeader: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  headerContentContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  headerMainTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  headerSubTitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  mainScrollContainer: { flex: 1, padding: 14 },
  cardLayoutWrapper: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 8 },
  sectionTitleText: { fontSize: 14, fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' },
  fieldInputLabel: { fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  subFieldInputLabel: { fontSize: 10, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  fieldInputElement: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 13, color: '#1E293B' },
  disabledInputStyle: { backgroundColor: '#F1F5F9', color: '#64748B', borderColor: '#E2E8F0' },
  twinFieldsFlexRow: { flexDirection: 'row', marginTop: 4 },
  tripleFieldsFlexRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  pickerFieldEmulationBox: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emulatedPickerText: { fontSize: 13, color: '#1E293B' },
  inlineNestedSubformBlock: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 6 },
  stepperContainerInput: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, height: 38, alignItems: 'center', overflow: 'hidden' },
  stepperInputElement: { flex: 1, paddingHorizontal: 10, fontSize: 13, color: '#1E293B', height: '100%' },
  stepperIconsColumn: { width: 24, height: '100%', borderLeftWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: '#F8FAFC' },
  calculatedStaticRowText: { fontSize: 13, fontWeight: '700', color: '#0F172A', paddingLeft: 4 },
  dashedAddLineButton: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#10B981', borderRadius: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginTop: 14, backgroundColor: '#EFF6FF' },
  dashedAddLineButtonText: { fontSize: 13, color: '#10B981', fontWeight: '700' },
  renderedRowLogNode: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#DCFCE7' },
  itemOutputDescText: { fontSize: 13, fontWeight: '600', color: '#14532D' },
  itemOutputMetaText: { fontSize: 10, color: '#166534', marginTop: 2 },
  itemOutputTotalValue: { fontSize: 13, fontWeight: '700', color: '#166534' },
  dashedUploadZoneBox: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#0056FA', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5FF', marginTop: 6 },
  uploadZoneMainText: { fontSize: 12, color: '#334155' },
  uploadZoneSubText: { fontSize: 10, color: '#64748B', marginTop: 2 },
  fileAttachmentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  fileAttachmentText: { flex: 1, fontSize: 12, color: '#475569' },
  blueSummaryLayoutCard: { backgroundColor: '#0056FA', borderRadius: 12, padding: 16, marginBottom: 14 },
  summaryTitleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingBottom: 6 },
  summaryCardTitleText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  summaryItemFlexLine: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  summaryLabelText: { fontSize: 12, color: '#E0F2FE' },
  summaryValueText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  totalSumDividerLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 8 },
  totalPriceLabel: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  totalPriceValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  stickyFooterActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'space-between' },
  footerStickyTotalBlock: { flexDirection: 'column' },
  footerTotalLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  footerTotalAmountValue: { fontSize: 18, fontWeight: '800', color: '#0056FA' },
  footerActionButtonsGroup: { flexDirection: 'row', gap: 8 },
  cancelFooterButton: { paddingHorizontal: 14, height: 40, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  cancelFooterButtonText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  submitFooterButton: { paddingHorizontal: 16, height: 40, borderRadius: 8, backgroundColor: '#0056FA', alignItems: 'center', justifyContent: 'center' },
  submitFooterButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 20 },
  modalContentCard: { backgroundColor: '#FFFFFF', borderRadius: 12, maxHeight: '70%', padding: 16 },
  modalHeaderTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12, paddingBottom: 6, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  modalSelectionItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F8FAFC' },
  modalSelectionText: { fontSize: 14, color: '#334155' },
  importantNotesContainerBox: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#BFDBFE', marginTop: 14 },
  importantNotesMainHeader: { fontSize: 13, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  bulletPointItem: { fontSize: 12, color: '#1E3A8A', marginTop: 2 }
});