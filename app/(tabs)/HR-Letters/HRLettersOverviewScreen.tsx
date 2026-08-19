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
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { hrLetterService } from '@/app/config/hrLetterService';
import { OverviewMetrics, EmployeeDocument, DocumentTemplate, FormInitData } from '@/types/hrLetter';

export const HRLettersScreen = () => {
  const router = useRouter();

  // API Data States
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [letters, setLetters] = useState<EmployeeDocument[]>([]);
  const [, setFormData] = useState<FormInitData | null>(null);
  
  // Add this new state for submit button loading
  const [submitting, setSubmitting] = useState<boolean>(false);

  // -------------------------------------------------------------
  // NEW: SUBMIT FUNCTION FOR HR LETTER CREATION
  // -------------------------------------------------------------
 const handleCreateSubmit = async () => {
  if (!formLetterType || !formSubject) {
    Alert.alert('Validation Error', 'Please select or enter a Letter Type and Subject.');
    return;
  }

  try {
    setSubmitting(true);

    const payload: Partial<EmployeeDocument> = {
      employeeName: formEmployee,
      designation: formDesignation,
      letterType: formLetterType,
      subject: formSubject,
      status: (formStatus as any) || 'Pending Approval',
    };

    // 1. Send API Request
    const createdLetter = await hrLetterService.saveHrLetter(payload);

    // 2. Add directly to UI list so it renders instantly
    if (createdLetter) {
      setLetters((prev) => [createdLetter, ...prev]);
    }

    // 3. Re-fetch full metrics from backend
    await fetchScreenData();

    // 4. Reset form & close modal
    setFormEmployee('don bosko');
    setFormDesignation('Software Engineer');
    setFormLetterType('');
    setFormSubject('Job Offer - Software Engineer');
    setFormStatus('Pending Approval');

    setShowCreateModal(false);
    Alert.alert('Success', 'HR Letter created successfully!');
  } catch (error: any) {
    console.error('Error creating HR Letter:', error);
    Alert.alert('Error', 'Failed to save HR letter. Check server logs.');
  } finally {
    setSubmitting(false);
  }
};

  // Dropdown Lists
  const letterTypes = [
    'All Types',
    'Offer Letter',
    'Appointment Letter',
    'Experience Letter',
    'Increment Letter',
    'Promotion Letter',
    'Relieving Letter',
    'NDA Letter',
  ];

  const statusTypes = [
    'All Status',
    'Approved',
    'Pending Approval',
    'Draft',
    'Rejected',
  ];

  // UI & Filter States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Modals
  const [showTypeDropdown, setShowTypeDropdown] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Selected Letter Data for Preview Modal
  const [selectedLetter, setSelectedLetter] = useState<EmployeeDocument | null>(null);
  const [previewData, setPreviewData] = useState<DocumentTemplate | null>(null);

  // Form Fields
  const [formEmployee, setFormEmployee] = useState('don bosko');
  const [formDesignation, setFormDesignation] = useState('Software Engineer');
  const [formLetterType, setFormLetterType] = useState('');
  const [formSubject, setFormSubject] = useState('Job Offer - Software Engineer');
  const [formStatus, setFormStatus] = useState('Pending Approval');

  // 1. FETCH DATA
  const fetchScreenData = useCallback(async () => {
    try {
      const overviewRes = await hrLetterService.getOverview().catch(() => null);
      const formInitRes = await hrLetterService.getFormInitData().catch(() => null);

      if (overviewRes) {
        setMetrics(overviewRes);
        setLetters(overviewRes.hrLetters || []);
      }

      if (formInitRes) {
        setFormData(formInitRes);
      }
    } catch (error: any) {
      console.error('Error loading backend data:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchScreenData();
      setLoading(false);
    };
    init();
  }, [fetchScreenData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchScreenData();
    setRefreshing(false);
  };

  // 2. HELPERS
  const formatDate = (dateValue?: string | number | Date | null) => {
    if (!dateValue) return 'N/A';
    const date =
      typeof dateValue === 'number' || !isNaN(Number(dateValue))
        ? new Date(Number(dateValue))
        : new Date(dateValue);

    return isNaN(date.getTime())
      ? String(dateValue)
      : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'pending approval':
      case 'pending':
        return { bg: '#FFF3E0', text: '#EF6C00' };
      case 'rejected':
        return { bg: '#FFEBEE', text: '#C62828' };
      default:
        return { bg: '#ECEFF1', text: '#455A64' };
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'DB';
    return name
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // 3. DYNAMIC LETTER TEMPLATES GENERATOR
  const getDynamicLetterTemplate = (item: EmployeeDocument | null) => {
    if (!item) return { bodyText: '', title: '' };

    const employee = item.employeeName || 'Don Bosko';
    const designation = item.designation || 'Associate Developer';
    const company = item.company_name || 'HDFC Bank';
    const letterType = item.letterType || 'Offer Letter';
    const formattedDate = formatDate(item.createdAt || new Date());
    const department = item.department || 'Human Resources';
    const location = item.location || 'Bommanahalli';
    const joiningDate = item.joiningDate || '2026-06-01';
    const ctc = item.ctc || '2,00,000';

    switch (letterType) {
      case 'Offer Letter':
        return {
          title: 'Offer Letter',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nWe are pleased to offer you the position of ${designation} at ${company}. We are confident that your skills and experience will contribute significantly to our organization.\n\nDepartment: ${department}\nLocation: ${location}\nJoining Date: ${joiningDate}\nAnnual CTC: ${ctc}\n\nYour employment shall be governed by the policies and regulations of the company.\n\nWe look forward to welcoming you to our team.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };

      case 'Appointment Letter':
        return {
          title: 'Appointment Letter',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nFollowing your acceptance of our offer, we are pleased to formally appoint you as ${designation} at ${company}.\n\nDepartment: ${department}\nWork Location: ${location}\nEffective Date: ${joiningDate}\n\nPlease return a signed copy of this appointment letter confirming your acceptance of the terms.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };

      case 'Experience Letter':
        return {
          title: 'Experience Letter',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nTo Whom It May Concern,\n\nThis is to certify that ${employee} was employed with ${company} as a ${designation} in the ${department} department.\n\nDuring their tenure, we found ${employee} to be hardworking, honest, and dedicated. We wish them all the best in their future endeavors.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };

      case 'Increment Letter':
        return {
          title: 'Salary Increment Letter',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nIn recognition of your performance and valuable contributions to ${company}, we are pleased to inform you that your compensation has been revised.\n\nDesignation: ${designation}\nDepartment: ${department}\nRevised Annual CTC: ${ctc}\n\nAll other terms and conditions of your employment remain unchanged.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };

      case 'Promotion Letter':
        return {
          title: 'Promotion Letter',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nWe are delighted to inform you that you are being promoted to ${designation} at ${company}.\n\nDepartment: ${department}\nRevised Annual CTC: ${ctc}\n\nThank you for your hard work and commitment to our shared success.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };

      case 'Relieving Letter':
        return {
          title: 'Relieving Letter',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nWith reference to your resignation, we hereby accept the same and relieve you from your duties as ${designation} at ${company} effective ${formattedDate}.\n\nAll company assets have been returned and dues settled.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };

      case 'NDA Letter':
        return {
          title: 'Non-Disclosure Agreement',
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nAs an employee working as ${designation} in the ${department} department at ${company}, you agree to maintain complete confidentiality regarding all proprietary information, software, and trade secrets.\n\nFailure to comply with confidentiality rules may result in legal action.\n\nSincerely,\n${company}\nHR Department\n${department}`,
        };

      default:
        return {
          title: letterType,
          bodyText: `${letterType}\nDate: ${formattedDate}\n\nDear ${employee},\n\nThis is a official document regarding your role as ${designation} in ${department} at ${company}.\n\nYour employment shall be governed by the policies and regulations of the company.\n\nSincerely,\n${employee}\nHR Department\n${department}`,
        };
    }
  };

  // 4. PRINT & DOWNLOAD LOGIC
  const generateHTMLContent = () => {
    const template = getDynamicLetterTemplate(selectedLetter);
    const contentWithLineBreaks = template.bodyText.replace(/\n/g, '<br/>');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #263238;
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #0047AB;
              padding-bottom: 12px;
              margin-bottom: 20px;
              text-align: center;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #0047AB;
            }
            .content {
              font-size: 14px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #ECEFF1;
              padding-top: 10px;
              font-size: 12px;
              color: #78909C;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${selectedLetter?.company_name || 'HDFC Bank'}</div>
          </div>
          <div class="content">
            ${contentWithLineBreaks}
          </div>
          <div class="footer">
            This document is computer-generated and requires no physical signature.
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      const html = generateHTMLContent();
      await Print.printAsync({ html });
    } catch (error) {
      Alert.alert('Error', 'Unable to execute print action.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const html = generateHTMLContent();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Download ${selectedLetter?.letterType || 'Document'}`,
        });
      } else {
        Alert.alert('Downloaded', `PDF generated successfully at: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF document.');
    }
  };

  // Open letter preview with target row data
  const handlePreview = async (item: EmployeeDocument) => {
    setSelectedLetter(item);
    try {
      const preview = await hrLetterService.getLetterPreview(item.id, item.userId);
      setPreviewData(preview);
    } catch {
      setPreviewData({
        templateName: `${item.letterType || 'HR'} Template`,
        templateContent: '',
        status: item.status || 'Active',
      });
    } finally {
      setShowPreviewModal(true);
    }
  };

  const filteredLetters = letters.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.employeeName?.toLowerCase().includes(searchLower) ||
      item.designation?.toLowerCase().includes(searchLower) ||
      item.letterType?.toLowerCase().includes(searchLower);

    const matchesType = selectedType === 'All Types' || item.letterType === selectedType;
    const matchesStatus =
      selectedStatus === 'All Status' || item.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1E3F" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>HR Letters</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Create, manage and track all HR letters and documents
          </Text>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        
        {/* OVERVIEW METRICS */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxBlue}>
              <Feather name="file-text" size={16} color="#0047AB" />
            </View>
            <View>
              <Text style={styles.metricLabel}>TOTAL LETTERS</Text>
              <Text style={styles.metricValue}>{metrics?.totalLetters ?? letters.length}</Text>
              <Text style={styles.metricSubtext}>All time</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxOrange}>
              <Feather name="clock" size={16} color="#EF6C00" />
            </View>
            <View>
              <Text style={styles.metricLabel}>PENDING APPROVAL</Text>
              <Text style={styles.metricValue}>{metrics?.pendingCount ?? 0}</Text>
              <Text style={styles.metricSubtext}>Awaiting approval</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxGreen}>
              <Feather name="check-circle" size={16} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.metricLabel}>APPROVED</Text>
              <Text style={styles.metricValue}>{metrics?.approvedCount ?? 0}</Text>
              <Text style={styles.metricSubtext}>This year</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconBoxRed}>
              <Feather name="x-circle" size={16} color="#C62828" />
            </View>
            <View>
              <Text style={styles.metricLabel}>REJECTED</Text>
              <Text style={styles.metricValue}>{metrics?.rejectedCount ?? 0}</Text>
              <Text style={styles.metricSubtext}>This year</Text>
            </View>
          </View>
        </View>

        {/* CONTROLS TOOLBAR */}
        <View style={styles.controlsSection}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search letters by employee name, type or..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowTypeDropdown(true)}>
              <Text style={styles.dropdownText}>{selectedType}</Text>
              <Feather name="chevron-down" size={14} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowStatusDropdown(true)}>
              <Text style={styles.dropdownText}>{selectedStatus}</Text>
              <Feather name="chevron-down" size={14} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateBtn}>
              <Feather name="calendar" size={14} color="#666" />
              <Text style={styles.dateText}>01 May 2026 – 31 May 2026</Text>
            </TouchableOpacity>

            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'card' && styles.activeToggle]}
                onPress={() => setViewMode('card')}>
                <Ionicons name="grid-outline" size={16} color={viewMode === 'card' ? '#FFF' : '#333'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'table' && styles.activeToggle]}
                onPress={() => setViewMode('table')}>
                <Ionicons name="list" size={16} color={viewMode === 'table' ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* CONTENT LIST */}
        {loading ? (
          <ActivityIndicator size="large" color="#0A1E3F" style={{ marginTop: 20 }} />
        ) : viewMode === 'card' ? (
          <View style={styles.cardsContainer}>
            {filteredLetters.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <View key={String(item.id)} style={styles.itemCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(item.employeeName)}</Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{item.employeeName || ''}</Text>
                        <Text style={styles.userRole}>{item.designation || ''}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handlePreview(item)}>
                      <Feather name="more-vertical" size={18} color="#9E9E9E" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBodyRow}>
                    <View style={styles.letterTag}>
                      <Feather name="file-text" size={14} color="#0047AB" />
                      <Text style={styles.letterTagText}>{item.letterType || ''}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        ● {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateLabel}>Created on</Text>
                    <Text style={styles.dateValue}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* TABLE VIEW */
          <ScrollView horizontal persistentScrollbar style={styles.tableScroll}>
            <View style={{ minWidth: 800 }}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 180 }]}>EMPLOYEE ▾</Text>
                <Text style={[styles.th, { width: 140 }]}>LETTER TYPE</Text>
                <Text style={[styles.th, { width: 180 }]}>SUBJECT</Text>
                <Text style={[styles.th, { width: 120 }]}>CREATED ON ▾</Text>
                <Text style={[styles.th, { width: 120 }]}>STATUS</Text>
                <Text style={[styles.th, { width: 80 }]}>ACTIONS</Text>
              </View>

              {filteredLetters.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <View key={String(item.id)} style={styles.tableRow}>
                    <View style={[styles.td, { width: 180 }]}>
                      <View style={styles.avatarSmall}>
                        <Text style={styles.avatarTextSmall}>{getInitials(item.employeeName)}</Text>
                      </View>
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.tdBold}>{item.employeeName || ''}</Text>
                        <Text style={styles.tdSub}>{item.designation || ''}</Text>
                      </View>
                    </View>

                    <View style={[styles.td, { width: 140 }]}>
                      <Text style={styles.tdText}>{item.letterType || ''}</Text>
                    </View>

                    <Text style={[styles.tdText, { width: 180 }]} numberOfLines={1}>
                      {item.subject || ''}
                    </Text>

                    <Text style={[styles.tdText, { width: 120 }]}>{formatDate(item.createdAt)}</Text>

                    <View style={[styles.td, { width: 120 }]}>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                          ● {item.status || 'Approved'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.tdActions, { width: 80 }]}>
                      <TouchableOpacity onPress={() => handlePreview(item)}>
                        <Feather name="eye" size={16} color="#0047AB" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </ScrollView>

      {/* FILTER DROPDOWN MODAL */}
      <Modal visible={showTypeDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTypeDropdown(false)}>
          <View style={styles.dropdownMenu}>
            <ScrollView style={{ maxHeight: 300 }}>
              {letterTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypeDropdown(false);
                  }}>
                  <Text style={[styles.menuItemText, selectedType === type && styles.activeMenuText]}>
                    {type}
                  </Text>
                  {selectedType === type && <Feather name="check" size={14} color="#0047AB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STATUS DROPDOWN MODAL */}
      <Modal visible={showStatusDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowStatusDropdown(false)}>
          <View style={styles.dropdownMenu}>
            <ScrollView style={{ maxHeight: 300 }}>
              {statusTypes.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setSelectedStatus(st);
                    setShowStatusDropdown(false);
                  }}>
                  <Text style={[styles.menuItemText, selectedStatus === st && styles.activeMenuText]}>
                    {st}
                  </Text>
                  {selectedStatus === st && <Feather name="check" size={14} color="#0047AB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

{/* ADD HR LETTER MODAL */}
<Modal 
  visible={showCreateModal} 
  animationType="slide"
  onRequestClose={() => setShowCreateModal(false)} // Fixes physical back button on Android
>
  <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
    <View style={styles.modalHeaderDark}>
      <TouchableOpacity 
        onPress={() => setShowCreateModal(false)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Fixes unclickable back arrow
      >
        <Feather name="arrow-left" size={20} color="#FFF" />
      </TouchableOpacity>
      
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Add HR Letter</Text>
        <Text style={{ color: '#90A4AE', fontSize: 11 }}>Manage your HR letters</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => setShowCreateModal(false)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="x" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>

    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.formSectionTitle}>HR Letter</Text>

      <Text style={styles.inputLabel}>Employee Name</Text>
      <TextInput style={styles.formInput} value={formEmployee} onChangeText={setFormEmployee} />

      <Text style={styles.inputLabel}>Designation</Text>
      <TextInput style={styles.formInput} value={formDesignation} onChangeText={setFormDesignation} />

      <Text style={styles.inputLabel}>Letter Type *</Text>
      <TextInput
        style={styles.formInput}
        placeholder="Select Letter Type"
        value={formLetterType}
        onChangeText={setFormLetterType}
      />

      <Text style={styles.inputLabel}>Subject *</Text>
      <TextInput style={styles.formInput} value={formSubject} onChangeText={setFormSubject} />

      <Text style={styles.inputLabel}>Status</Text>
      <TextInput style={styles.formInput} value={formStatus} onChangeText={setFormStatus} />
    </ScrollView>

    <View style={styles.modalFooter}>
      <TouchableOpacity 
        style={styles.closeBtn} 
        onPress={() => setShowCreateModal(false)}
        disabled={submitting}
      >
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>

      {/* ✅ FIXED: Button now calls handleCreateSubmit */}
      <TouchableOpacity 
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]} 
        onPress={handleCreateSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.submitBtnText}>Create</Text>
        )}
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</Modal>

      {/* DYNAMIC PREVIEW MODAL */}
      <Modal visible={showPreviewModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                {selectedLetter?.letterType || 'Letter Preview'}
              </Text>
              <Text style={{ fontSize: 11, color: '#2E7D32', fontWeight: 'bold' }}>
                ● {selectedLetter?.status || 'Active'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
              <Feather name="x" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }}>
            <View style={styles.previewCard}>
              <Text style={styles.companyTitle}>{selectedLetter?.company_name || 'HDFC Bank'}</Text>
              <View style={styles.divider} />
              
              <Text style={styles.dynamicLetterText}>
                {getDynamicLetterTemplate(selectedLetter).bodyText}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDownloadPDF}>
              <Feather name="download" size={14} color="#333" />
              <Text style={styles.actionBtnText}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handlePrint}>
              <Feather name="printer" size={14} color="#333" />
              <Text style={styles.actionBtnText}>Print</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

export default HRLettersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  topHeader: { backgroundColor: '#0A1E3F', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#90A4AE', fontSize: 11, marginTop: 2 },
  createBtn: { backgroundColor: '#1565C0', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  metricCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#ECEFF1' },
  metricIconBoxBlue: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  metricIconBoxOrange: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
  metricIconBoxGreen: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  metricIconBoxRed: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  metricLabel: { fontSize: 9, fontWeight: 'bold', color: '#78909C' },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#263238' },
  metricSubtext: { fontSize: 9, color: '#B0BEC5' },
  controlsSection: { paddingHorizontal: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, height: 40, marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 12, color: '#333' },
  filterScroll: { flexDirection: 'row', marginBottom: 12 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, paddingHorizontal: 12, height: 36, marginRight: 8, gap: 6 },
  dropdownText: { fontSize: 12, color: '#333' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, paddingHorizontal: 12, height: 36, marginRight: 8, gap: 6 },
  dateText: { fontSize: 11, color: '#333' },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#ECEFF1', borderRadius: 6, padding: 2, height: 36 },
  toggleBtn: { paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  activeToggle: { backgroundColor: '#0A1E3F' },
  cardsContainer: { paddingHorizontal: 12, gap: 10 },
  itemCard: { backgroundColor: '#FFF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#ECEFF1' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D1E9FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#1565C0' },
  userName: { fontSize: 14, fontWeight: 'bold', color: '#263238' },
  userRole: { fontSize: 11, color: '#78909C' },
  cardBodyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  letterTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 6 },
  letterTagText: { fontSize: 12, color: '#0047AB', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 8 },
  dateLabel: { fontSize: 10, color: '#9E9E9E' },
  dateValue: { fontSize: 12, fontWeight: '600', color: '#333' },
  tableScroll: { backgroundColor: '#FFF', marginHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ECEFF1' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', paddingVertical: 10, paddingHorizontal: 12 },
  th: { fontSize: 11, fontWeight: 'bold', color: '#475467' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  td: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1E9FF', alignItems: 'center', justifyContent: 'center' },
  avatarTextSmall: { fontSize: 10, fontWeight: 'bold', color: '#1565C0' },
  tdBold: { fontSize: 13, fontWeight: 'bold', color: '#101828' },
  tdSub: { fontSize: 11, color: '#667085' },
  tdText: { fontSize: 13, color: '#344054' },
  tdActions: { flexDirection: 'row', gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { backgroundColor: '#FFF', borderRadius: 8, padding: 8, width: 220, elevation: 5 },
  dropdownMenuItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12 },
  menuItemText: { fontSize: 13, color: '#333' },
  activeMenuText: { color: '#0047AB', fontWeight: 'bold' },
  modalHeaderDark: { backgroundColor: '#0A1E3F', flexDirection: 'row', alignItems: 'center', padding: 16 },
  formSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0047AB', marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 4 },
  formInput: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, paddingHorizontal: 12, height: 40, fontSize: 13 },
  modalFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ECEFF1', padding: 12, gap: 10 },
  closeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6, backgroundColor: '#F1F5F9' },
  closeBtnText: { color: '#333', fontWeight: 'bold' },
  submitBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6, backgroundColor: '#00A86B' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ECEFF1' },
  previewCard: { borderBottomWidth: 1, borderBottomColor: '#E0E0E0', padding: 16 },
  companyTitle: { fontSize: 18, fontWeight: 'bold', color: '#0047AB', textAlign: 'center' },
  divider: { height: 2, backgroundColor: '#0047AB', marginVertical: 12 },
  dynamicLetterText: { fontSize: 13, color: '#263238', lineHeight: 22 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#E0E0E0', gap: 6 },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
});