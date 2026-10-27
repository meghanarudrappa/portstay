import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Share, Alert,Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ExpenseLineItem {
  date: string;       
  description: string;
  amount: string;
  taxPercent: string;
}

interface TravelExpenseClaim {
  id?: string;
  expenseReferenceNo?: string;
  employeeName?: string;
  expenseCategory?: string;
  department?: string;
  claimDate?: string | number;
  subTotal?: number;
  totalTax?: number;
  adjustment?: number;
  Adjustments?: number;
  grandTotal?: number;
  totalAmount?: number;
  approvalStatus?: string | null;
  expenseItems?: ExpenseLineItem[]; 
  company?: {
    name?: string;
    area?: string;
    city?: string;
    state?: string;
    country?: string;
    gstin?: string;
    
  };
}

export default function TravelExpenseDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [claimData, setClaimData] = useState<TravelExpenseClaim>({}); 

useEffect(() => {
  const loadTargetClaimDetails = () => {
    try {
      setLoading(true);
      console.log("📥 [DETAILS] Checking incoming navigation parameters...");

      if (params?.data) {
        const parsedPayload = JSON.parse(params.data as string);
        console.log("📥 [DETAILS] Complete Payload received:", parsedPayload);

        // Extract lines securely
        const backendItems = parsedPayload.expenseItems || parsedPayload.lineItems || [];
        const normalizedItems: ExpenseLineItem[] = Array.isArray(backendItems) 
          ? backendItems.map((item: any) => ({
              date: String(item.expenseDate || item.date || ''),
              description: String(item.description || 'General Expense Item Line'),
              amount: String(item.amount || '0'),
              taxPercent: String(item.taxAmount || item.taxPercent || '0')
            }))
          : [];

        // 🔄 Map company layout fields dynamically passed down from your index list
        setClaimData({
          ...parsedPayload,
          expenseItems: normalizedItems,
          company: {
            name: parsedPayload.company?.name || 'N/A',
            area: parsedPayload.company?.area || '',
            city: parsedPayload.company?.city || '',
            state: parsedPayload.company?.state || '',
            country: parsedPayload.company?.country || '',
            gstin: parsedPayload.company?.gstin || 'N/A'
        }
        });
      }
    } catch (e) {
      console.error("❌ [DETAILS] Error parsing param payload data:", e);
    } finally {
      setLoading(false);
    }
  };

  loadTargetClaimDetails();
}, [targetId, params?.data]);

  // 📝 Helper to clean/format dates for layout views
  const getFormattedDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    const parsed = typeof dateVal === 'number' || !isNaN(Number(dateVal)) ? new Date(Number(dateVal)) : new Date(dateVal);
    return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // 📄 Core HTML Generation Markup Engine for PDF and Print Actions
  const generateInvoiceHtml = (): string => {
    const itemsHtml = (claimData.expenseItems || []).map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${getFormattedDate(item.date)}</td>
        <td>${item.description}</td>
        <td style="text-align: right;">₹${Number(item.amount).toFixed(2)}</td>
        <td style="text-align: right;">${Number(item.taxPercent).toFixed(2)}%</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0056fa; padding-bottom: 16px; margin-bottom: 24px; }
            .company-title { font-size: 20px; font-weight: bold; color: #1e293b; text-transform: uppercase; }
            .doc-label { text-align: right; font-size: 14px; font-weight: bold; color: #64748b; }
            .ref-code { color: #0056fa; font-size: 16px; font-weight: bold; }
            .grid { display: flex; flex-wrap: wrap; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 8px; }
            .grid-cell { flex: 1; min-width: 50%; margin-bottom: 8px; font-size: 13px; }
            .label { font-weight: bold; color: #94a3b8; text-transform: uppercase; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background-color: #f1f5f9; color: #475569; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .totals-container { width: 40%; margin-left: auto; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
            .total-line { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
            .grand-total { font-size: 15px; font-weight: bold; color: #0056fa; margin-top: 8px; border-top: 1px double #e2e8f0; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company-title">${claimData.company?.name}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                ${claimData.company?.area ? `${claimData.company.area}, ` : ''}${claimData.company?.city}<br/>
                ${claimData.company?.state}, ${claimData.company?.country}<br/>
                GSTIN: ${claimData.company?.gstin}
              </div>
            </div>
            <div class="doc-label">
              <div>EXPENSE CLAIM</div>
              <div class="ref-code">Ref# ${claimData.expenseReferenceNo || 'N/A'}</div>
            </div>
          </div>

          <div class="grid">
            <div class="grid-cell"><div class="label">Employee</div><div style="color:#0056fa; font-weight:600;">${claimData.employeeName || 'N/A'}</div></div>
            <div class="grid-cell"><div class="label">Category</div><div style="color:#0056fa; font-weight:600;">${claimData.expenseCategory || 'General'}</div></div>
            <div class="grid-cell"><div class="label">Department</div><div>${claimData.department || 'Operations'}</div></div>
            <div class="grid-cell"><div class="label">Claim Date</div><div>${getFormattedDate(claimData.claimDate)}</div></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 20%;">DATE</th>
                <th style="width: 45%;">DESCRIPTION</th>
                <th style="width: 18%; text-align: right;">AMOUNT</th>
                <th style="width: 12%; text-align: right;">TAX</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="total-line"><span>Subtotal:</span><span>₹${Number(claimData.subTotal || claimData.grandTotal || claimData.totalAmount || 0).toFixed(2)}</span></div>
            <div class="total-line"><span>Total Tax:</span><span>₹${Number(claimData.totalTax || 0).toFixed(2)}</span></div>
            <div class="total-line"><span>Adjustments:</span><span>₹${Number(claimData.adjustment || claimData.Adjustments || 0).toFixed(2)}</span></div>
            <div class="total-line grand-total"><span>Grand Total:</span><span>₹${Number(claimData.grandTotal || claimData.totalAmount || 0).toFixed(2)}</span></div>
          </div>
        </body>
      </html>
    `;
  };

  // 🔗 1. NATIVE SHARE SHEET IMPLEMENTATION
  const handleShareAction = async () => {
    try {
      const summaryMsg = `Expense Claim Summary:\nRef: ${claimData.expenseReferenceNo || 'N/A'}\nEmployee: ${claimData.employeeName}\nGrand Total: ₹${Number(claimData.grandTotal || claimData.totalAmount || 0).toFixed(2)}\nStatus: ${claimData.approvalStatus || 'Pending'}`;
      await Share.share({
        message: summaryMsg,
        title: `Expense Claim ${claimData.expenseReferenceNo}`,
      });
    } catch (error: any) {
      Alert.alert('Share Failed', error.message);
    }
  };

  // 📁 2. COMPILE & SAVE TO DEVICE FILESYSTEM AS PDF
  const handlePdfCompilation = async () => {
    try {
      const htmlMarkup = generateInvoiceHtml();
      const { uri } = await Print.printToFileAsync({ html: htmlMarkup });
      
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save PDF Claim' });
      }
    } catch (error: any) {
      Alert.alert('PDF Generation Failed', error.message);
    }
  };

  // 🖨️ 3. ROUTE DIRECTLY TO AIRPRINT / WIRELESS SYSTEM PRINTER
  const handleSystemPrint = async () => {
    try {
      const htmlMarkup = generateInvoiceHtml();
      await Print.printAsync({ html: htmlMarkup });
    } catch (error: any) {
      Alert.alert('Printing Failed', error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0056FA" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Synchronizing details structure...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Action Bar Header */}
      <View style={styles.actionAppBar}>
        <TouchableOpacity onPress={() => router.replace('/expenses')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
          <Text style={styles.backButtonText}>Expense Claim</Text>
        </TouchableOpacity>
        
        {/* Dynamic Connected Button Implementations */}
        <View style={styles.iconActionsGroup}>
          <TouchableOpacity onPress={handleShareAction} activeOpacity={0.6}>
            <Ionicons name="share-social-outline" size={20} color="#0056FA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePdfCompilation} activeOpacity={0.6}>
            <Ionicons name="document-text-outline" size={20} color="#0056FA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSystemPrint} activeOpacity={0.6}>
            <Ionicons name="print-outline" size={20} color="#0056FA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollLayout} showsVerticalScrollIndicator={false}>
        {/* Company Meta Info */}
        <View style={styles.metaInvoiceCard}>
          <View style={styles.rowJustified}>
            <View>
              <Text style={styles.corporateBrandTitle}>{claimData.company?.name}</Text>
              <Text style={styles.corporateBrandSub}>
                {claimData.company?.area ? `${claimData.company.area}, ` : ''}{claimData.company?.city}
              </Text>
              <Text style={styles.corporateBrandSub}>{claimData.company?.state}, {claimData.company?.country}</Text>
              <Text style={styles.corporateBrandSub}>GSTIN: {claimData.company?.gstin}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.documentClassificationLabel}>EXPENSE CLAIM</Text>
              <Text style={styles.documentReferenceCode}>Ref# {claimData.expenseReferenceNo || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Informational Parameter Block */}
        <View style={styles.detailsGridCard}>
          <View style={styles.gridTwoColumnRow}>
            <View style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>Employee</Text>
              <Text style={styles.gridCellValueBlue}>{claimData.employeeName || 'Authorized Professional'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>Category</Text>
              <Text style={styles.gridCellValueBlue}>{claimData.expenseCategory || 'General'}</Text>
            </View>
          </View>

          <View style={[styles.gridTwoColumnRow, { marginTop: 14 }]}>
            <View style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>Department</Text>
              <Text style={styles.gridCellValueBlue}>{claimData.department || 'Operations'}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>Claim Date</Text>
              <Text style={styles.gridCellValueDark}>{getFormattedDate(claimData.claimDate)}</Text>
            </View>
          </View>
        </View>

        {/* Breakout Table Line Logs */}
        <View style={styles.tableCardContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderColumnText, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableHeaderColumnText, { flex: 1.5 }]}>DATE</Text>
            <Text style={[styles.tableHeaderColumnText, { flex: 2.5 }]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderColumnText, { flex: 1.5, textAlign: 'right' }]}>AMOUNT (₹)</Text>
            <Text style={[styles.tableHeaderColumnText, { flex: 1, textAlign: 'right' }]}>TAX (%)</Text>
          </View>

          {claimData.expenseItems && claimData.expenseItems.length > 0 ? (
            claimData.expenseItems.map((item: ExpenseLineItem, idx: number) => (
              <View key={idx} style={styles.tableDataBodyRow}>
                <Text style={[styles.tableBodyColumnText, { flex: 0.5 }]}>{idx + 1}</Text>
                <Text style={[styles.tableBodyColumnText, { flex: 1.5 }]}>{getFormattedDate(item.date)}</Text>
                <Text style={[styles.tableBodyColumnText, { flex: 2.5 }]} numberOfLines={2}>{item.description}</Text>
                <Text style={[styles.tableBodyColumnText, { flex: 1.5, textAlign: 'right', fontWeight: '600' }]}>{Number(item.amount || 0).toFixed(2)}</Text>
                <Text style={[styles.tableBodyColumnText, { flex: 1, textAlign: 'right' }]}>{Number(item.taxPercent || 0).toFixed(2)}%</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyDataRowFallback}>
              <Text style={styles.fallbackMutedText}>No matching lines bound to transaction context.</Text>
            </View>
          )}
        </View>

        {/* Bottom Financial Aggregation Column */}
        <View style={styles.financialAggregatorCard}>
          <View style={styles.flexStatementLine}>
            <Text style={styles.aggregatorLabel}>Subtotal (₹)</Text>
            <Text style={styles.aggregatorValueBold}>
              {Number(claimData.subTotal || claimData.grandTotal || claimData.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.flexStatementLine}>
            <Text style={styles.aggregatorLabel}>Total Tax (₹)</Text>
            <Text style={styles.aggregatorValueBold}>{Number(claimData.totalTax || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.flexStatementLine}>
            <Text style={styles.aggregatorLabel}>Adjustments (₹)</Text>
            <Text style={styles.aggregatorValueBold}>{Number(claimData.adjustment || claimData.Adjustments || 0).toFixed(2)}</Text>
          </View>
          
          <View style={styles.accentTotalsDivider} />
          
          <View style={styles.flexStatementLine}>
            <Text style={styles.grandTotalLabel}>Grand Total (₹)</Text>
            <Text style={styles.grandTotalValue}>
              {Number(claimData.grandTotal || claimData.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.securityApproveFooterCard}>
          <Ionicons name="checkmark-circle" size={16} color="#0056FA" />
          <Text style={styles.securityVerificationMessage}>
            Status: {claimData.approvalStatus || 'Pending'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Keep your existing styles exactly as they are below
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  actionAppBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', backgroundColor: '#FFF' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  iconActionsGroup: { flexDirection: 'row', gap: 16 },
  scrollLayout: { padding: 16 },
  metaInvoiceCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#0056FA' },
  rowJustified: { flexDirection: 'row', justifyContent: 'space-between' },
  corporateBrandTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', marginBottom: 4 },
  corporateBrandSub: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  documentClassificationLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', textAlign: 'right' },
  documentReferenceCode: { fontSize: 14, fontWeight: '700', color: '#0056FA', marginTop: 4, textAlign: 'right' },
  detailsGridCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 16 },
  gridTwoColumnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCell: { flex: 1 },
  gridCellLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  gridCellValueBlue: { fontSize: 14, fontWeight: '600', color: '#0056FA' },
  gridCellValueDark: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  tableCardContainer: { backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 12 },
  tableHeaderColumnText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  tableDataBodyRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  tableBodyColumnText: { fontSize: 13, color: '#334155' },
  emptyDataRowFallback: { padding: 24, alignItems: 'center' },
  fallbackMutedText: { color: '#94A3B8', fontSize: 13 },
  financialAggregatorCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 16 },
  flexStatementLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  aggregatorLabel: { fontSize: 13, color: '#64748B' },
  aggregatorValueBold: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  accentTotalsDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  grandTotalLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  grandTotalValue: { fontSize: 16, fontWeight: '700', color: '#0056FA' },
  securityApproveFooterCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, gap: 8 },
  securityVerificationMessage: { fontSize: 13, fontWeight: '600', color: '#0056FA' }
});