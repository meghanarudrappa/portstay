
// Path: app/(tabs)/expenses/[id].tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { expenseService } from '@/app/config/expenseApi';
import { TravelExpenseClaim } from '@/types/expense';
import { Ionicons } from '@expo/vector-icons';

export default function TargetClaimInspectorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [claim, setClaim] = useState<TravelExpenseClaim | null>(null);

  useEffect(() => {
    const pinpointClaimRecord = async () => {
      try {
        setLoading(true);
        const dataList = await expenseService.getTravelExpenseDetailsList();
        if (dataList && Array.isArray(dataList)) {
          // Robust lookups matching against reference tokens or unique sequential database IDs
          const matchedItem = dataList.find(c => 
            String(c.expenseReferenceNo).toLowerCase() === String(id).toLowerCase() || 
            String(c.id) === String(id)
          );
          if (matchedItem) {
            setClaim(matchedItem);
          }
        }
      } catch (err) {
        console.error('Failure matching current parameter identifier keys:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) pinpointClaimRecord();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.fallbackCenteringView]}>
        <ActivityIndicator size="large" color="#004BCE" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={[styles.container, styles.fallbackCenteringView]}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
        <Text style={styles.fallbackErrorLabel}>The requested record instance is inaccessible.</Text>
        <TouchableOpacity style={styles.backHomeErrorButton} onPress={() => router.back()}>
          <Text style={styles.backHomeErrorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002D9C" translucent={false} />
      
      {/* Action Navigation Header Section */}
      <View style={styles.blueHeaderSection}>
        <SafeAreaView>
          <View style={styles.headerFlexRow}>
            <TouchableOpacity style={styles.backNavIconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.titleAreaColumn}>
              <Text style={styles.headerTitleText} numberOfLines={1}>Claim Details</Text>
              <Text style={styles.headerSubtitleText}>{claim.expenseReferenceNo || 'No Reference'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.contentScrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.whiteCardContainer}>
          
          {/* Main Claim Parameters Details Card */}
          <View style={styles.profileInspectorCard}>
            <View style={styles.headerInspectorRow}>
              <Text style={styles.referenceHeadingTokenText}>{claim.expenseReferenceNo || 'TRV-REF-UNKNOWN'}</Text>
              <View style={[
                styles.badgeWrapperLayout,
                claim.status === 'Approved' && styles.badgeSuccess,
                claim.status === 'Pending' && styles.badgeWarning,
                claim.status === 'Rejected' && styles.badgeDanger
              ]}>
                <Text style={[
                  styles.badgeTextLayoutLabel,
                  claim.status === 'Approved' && { color: '#16A34A' },
                  claim.status === 'Pending' && { color: '#D97706' },
                  claim.status === 'Rejected' && { color: '#DC2626' }
                ]}>{claim.status || 'Pending'}</Text>
              </View>
            </View>

            <View style={styles.gridDataMetadataBlock}>
              <View style={styles.metaDataColumnHalf}>
                <Text style={styles.labelMeta}>FILING DATE</Text>
                <Text style={styles.valMeta}>{claim.claimDate || '--'}</Text>
              </View>
              <View style={styles.metaDataColumnHalf}>
                <Text style={styles.labelMeta}>DEPARTMENT</Text>
                <Text style={styles.valMeta}>{claim.department || '--'}</Text>
              </View>
            </View>

            <View style={styles.gridDataMetadataBlock}>
              <View style={styles.metaDataColumnHalf}>
                <Text style={styles.labelMeta}>EMPLOYEE PROFILE</Text>
                <Text style={styles.valMeta}>{claim.employeeName || ''}</Text>
              </View>
              <View style={styles.metaDataColumnHalf}>
                <Text style={styles.labelMeta}>CATEGORY SCOPE</Text>
                <Text style={styles.valMeta}>{claim.expenseCategory || ''}</Text>
              </View>
            </View>

            <View style={styles.gridDataMetadataBlock}>
              <View style={styles.metaDataColumnHalf}>
                <Text style={styles.labelMeta}>PROJECT</Text>
                <Text style={styles.valMeta}>--</Text>
              </View>
              <View style={styles.metaDataColumnHalf}>
                <Text style={styles.labelMeta}>STATUS INDICATOR</Text>
                <Text style={styles.valMeta}>{claim.status || 'Pending'}</Text>
              </View>
            </View>

            <View style={[styles.gridDataMetadataBlock, { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 12, marginTop: 6 }]}>
              <View style={styles.metaDataColumnFull}>
                <Text style={styles.labelMeta}>AGGREGATE TOTAL BALANCE</Text>
                <Text style={styles.grandTotalNumericText}>₹ {(claim.totalAmount || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Reimbursement Processing Segment Block */}
          {claim.status === 'Approved' && (
            <View style={[styles.profileInspectorCard, { borderColor: '#10B981', borderWidth: 1 }]}>
              <Text style={styles.reimbursementSectionHeaderTitle}>Reimbursement Processing Parameters</Text>
              <View style={styles.reimbursementParameterRow}>
                <Text style={styles.rLabel}>Total Due Balance</Text>
                <Text style={styles.rValBold}>₹{(claim.totalAmount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.reimbursementParameterRow}>
                <Text style={styles.rLabel}>Settlement Channel</Text>
                <Text style={styles.rVal}>{claim.paymentMode || 'Corporate Transfer'}</Text>
              </View>
              <View style={styles.reimbursementParameterRow}>
                <Text style={styles.rLabel}>Bank Ledger Ref</Text>
                <Text style={styles.rVal}>{(claim as any).transactionRef || 'Awaiting Sync'}</Text>
              </View>
              
              <TouchableOpacity style={styles.downloadPdfActionButton} onPress={() => Alert.alert('Export In Progress', 'Generating local statements ledger parameters.')}>
                <Text style={styles.downloadPdfActionButtonLabel}>↓ Download Payment Receipt Statement</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Line Item Allocations Breakdown Table */}
          <View style={styles.profileInspectorCard}>
            <Text style={styles.breakdownHeaderTitleLabelText}>Itemized General Ledger Rows ({(claim.lineItems || []).length})</Text>
            {(claim.lineItems || []).length === 0 ? (
              <Text style={styles.emptyBreakdownLabelText}>No precise item rows appended to this record model.</Text>
            ) : (
              (claim.lineItems || []).map((row, index) => (
                <View key={index} style={styles.breakdownItemRowContainer}>
                  <View style={{ flex: 3.5 }}>
                    <Text style={styles.breakdownRowMainDescriptionText}>{row.description || 'Expense Item'}</Text>
                    <Text style={styles.breakdownRowMetadataSubtextLabel}>
                      {row.category || 'General'} • Base Charge: ₹{(row.amount || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                    <Text style={styles.breakdownRowFinalCalculatedAmountText}>₹{(row.total || 0).toFixed(2)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002D9C' },
  blueHeaderSection: { backgroundColor: '#002D9C', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 12 : 16, paddingBottom: 20 },
  headerFlexRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backNavIconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  titleAreaColumn: { flex: 1, flexDirection: 'column' },
  headerTitleText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitleText: { fontSize: 13, color: '#93C5FD', marginTop: 1 },
  
  contentScrollView: { flex: 1, backgroundColor: '#002D9C' },
  whiteCardContainer: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 16, minHeight: '100%' },
  
  fallbackCenteringView: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  fallbackErrorLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', marginTop: 8 },
  backHomeErrorButton: { marginTop: 16, backgroundColor: '#004BCE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backHomeErrorButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  
  profileInspectorCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, elevation: 1 },
  headerInspectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 12 },
  referenceHeadingTokenText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  badgeWrapperLayout: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeTextLayoutLabel: { fontSize: 11, fontWeight: '700' },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeWarning: { backgroundColor: '#FEF3C7' },
  badgeDanger: { backgroundColor: '#FEE2E2' },
  
  gridDataMetadataBlock: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  metaDataColumnHalf: { width: '48%' },
  metaDataColumnFull: { width: '100%' },
  labelMeta: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 4, letterSpacing: 0.5 },
  valMeta: { fontSize: 14, fontWeight: '600', color: '#334155' },
  grandTotalNumericText: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  
  reimbursementSectionHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#10B981', marginBottom: 12 },
  reimbursementParameterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  rLabel: { fontSize: 13, color: '#64748B' },
  rVal: { fontSize: 13, color: '#334155', fontWeight: '500' },
  rValBold: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  downloadPdfActionButton: { marginTop: 16, borderWidth: 1, borderColor: '#004BCE', borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F0F5FF' },
  downloadPdfActionButtonLabel: { color: '#004BCE', fontWeight: '700', fontSize: 13 },
  
  breakdownHeaderTitleLabelText: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyBreakdownLabelText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginVertical: 16 },
  breakdownItemRowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  breakdownRowMainDescriptionText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  breakdownRowMetadataSubtextLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  breakdownRowFinalCalculatedAmountText: { fontSize: 14, fontWeight: '700', color: '#0F172A' }
});