import { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    Image,
    StatusBar,
} from "react-native"

import { Feather, Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import * as Print from "expo-print"
import * as MediaLibrary from "expo-media-library"
import { API_BASE_URL } from '../../config/api'; 

export default function PayslipsScreen() {
    const { email, salMonth } = useLocalSearchParams()
    const [downloadLoading, setDownloadLoading] = useState(false)
    const [shareLoading, setShareLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [empDetails, setEmpDetails] = useState<any>({})
    const router = useRouter()

    const loadPayDetails = async () => {
        setDataLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/fetching-payslip-mobile?email=${email}&month=${salMonth}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok) {
                const data = await response.json()
                console.log("data---", data)
                setEmpDetails(data)
            } else {
                Alert.alert("Error", "Failed to load payslip details")
                
            }
        } catch (error) {
            console.error("Error fetching payslip:", error)
        } finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        loadPayDetails()
    }, [email, salMonth])

    const toUpperCaseString = (str: any) => String(str || "").toUpperCase();
    
    const capitalizeTextWords = (str: any) => {
        if (!str) return "--";
        return String(str).toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };

    const formatCurrency = (val: any) => {
        if (!val && val !== 0) return "0.00";
        const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
        return isNaN(num) ? "0.00" : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const cleanDisplayValue = (val: any) => {
        if (!val && val !== 0) return "0.00";
        return formatCurrency(val);
    }

    const generatePdfHtml = () => {
        const earnEntries = Object.entries(empDetails?.earnComponent || {});
        const deductEntries = Object.entries(empDetails?.deductComponent || {});
        
        let earningsRowsHtml = '';
        if (earnEntries.length === 0) {
            earningsRowsHtml = `
                <div class="table-row">
                    <span style="color: #94A3B8; font-style: italic;">No Earning Components Registered</span>
                    <span></span>
                    <span></span>
                </div>`;
        } else {
            earnEntries.forEach(([key, value]) => {
                const ytdEarnVal = empDetails?.ytdEarn?.[key] ?? value;
                earningsRowsHtml += `
                    <div class="table-row">
                        <span>${key}</span>
                        <div class="text-right">₹ ${formatCurrency(value)}</div>
                        <div class="text-right">₹ ${formatCurrency(ytdEarnVal)}</div>
                    </div>
                `;
            });
        }

        let deductionsRowsHtml = '';
        if (deductEntries.length === 0) {
            deductionsRowsHtml = `
                <div class="table-row">
                    <span style="color: #94A3B8; font-style: italic;">No Active Deductions</span>
                    <span></span>
                    <span></span>
                </div>`;
        } else {
            deductEntries.forEach(([key, value]) => {
                const ytdDeductVal = empDetails?.ytdDeduct?.[key] ?? value;
                deductionsRowsHtml += `
                    <div class="table-row">
                        <span>${key}</span>
                        <div class="text-right">₹ ${formatCurrency(value)}</div>
                        <div class="text-right">₹ ${formatCurrency(ytdDeductVal)}</div>
                    </div>
                `;
            });
        }

        return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payslip - ${empDetails.payMonth || "Document"}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      body {
        font-family: 'Inter', 'Helvetica', sans-serif;
        color: #334155;
        margin: 0;
        padding: 30px;
        background-color: #ffffff;
        -webkit-print-color-adjust: exact;
      }

      .payslip-container {
        max-width: 800px;
        margin: 0 auto;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 28px;
      }

      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #3F2BB5;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }

      .company-details h1 {
        font-size: 20px;
        font-weight: 700;
        color: #0F2C59;
        margin: 0 0 4px 0;
        letter-spacing: 0.5px;
      }

      .company-details p {
        font-size: 11px;
        color: #7F8C8D;
        margin: 0;
      }

      .payslip-title {
        font-size: 14px;
        font-weight: 600;
        color: #3F2BB5;
        background: #F0EEFF;
        padding: 6px 14px;
        border-radius: 6px;
        margin: 0;
      }

      .summary-title {
        font-size: 11px;
        font-weight: 700;
        color: #3F2BB5;
        text-transform: uppercase;
        margin-top:10px;
        margin-bottom: 10px;
        letter-spacing: 0.5px;
      }

      .summary-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px 24px;
        background: #F8FAFC;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #F1F5F9;
      }

      .info-item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 12px;
      }

      .info-label {
        color: #64748B;
        font-weight: 500;
      }

      .info-value {
        color: #2C3E50;
        font-weight: 600;
        text-align: right;
      }

      .net-pay-card {
        background: #3F2BB5;
        color: #ffffff;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .net-pay-label {
        font-size: 11px;
        font-weight: 500;
        opacity: 0.9;
        text-transform: uppercase;
      }

      .net-pay-amount {
        font-size: 22px;
        font-weight: 700;
        margin: 4px 0;
      }

      .attendance-mini-row {
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 12px;
        border-top: 1px dashed rgba(255, 255, 255, 0.2);
        margin-top: 10px;
        padding-top: 8px;
        font-size: 11px;
      }

      .financial-tables-stack {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 24px;
      }

      .table-header {
        background: #F8FAFC;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        padding: 8px 12px;
        border-radius: 6px 6px 0 0;
        font-size: 11px;
        font-weight: 700;
        color: #3F2BB5;
        border-bottom: 1px solid #E2E8F0;
      }

      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        padding: 10px 12px;
        border-bottom: 1px solid #F1F5F9;
        font-size: 12px;
        color: #2C3E50;
      }

      .text-right {
        text-align: right;
      }

      .total-row-block {
        background: #EEF2F6;
        font-weight: 700;
        color: #3F2BB5;
        border-bottom: none;
        border-radius: 0 0 6px 6px;
      }

      .final-payout-banner {
        background: #EEF2F6;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .final-label-stack h2 {
        font-size: 14px;
        color: #2C3E50;
        margin: 0;
        font-weight: 700;
      }

      .final-payout-value {
        font-size: 18px;
        font-weight: 800;
        color: #3F2BB5;
      }

      .final-payout-words-box {
        font-size: 11px;
        color: #7F8C8D;
        font-style: italic;
        margin-bottom: 20px;
        padding-left: 4px;
        text-align: center;
      }

      .system-footer {
        text-align: center;
        font-size: 10px;
        color: #94A3B8;
        border-top: 1px solid #E2E8F0;
        padding-top: 12px;
      }
    </style>
  </head>
  <body>

    <div class="payslip-container">
      
      <div class="header-section">
        <div class="company-details">
          <h1>${toUpperCaseString(empDetails.orgName || "HDFC BANK")}</h1>
          <p>${empDetails.orgAddress || "Koramangala, Bengaluru, Karnataka 560034"}</p>
        </div>
        <div>
          <h2 class="payslip-title">Payslip: ${empDetails.payMonth}</h2>
        </div>
      </div>
      <div>
        <div class="net-pay-card">
          <span class="net-pay-label">Employee Net Pay</span>
          <span class="net-pay-amount">₹ ${formatCurrency(empDetails.netpay)}</span>
          <div class="attendance-mini-row">
            <span>Paid Days: ${empDetails.paidDays || 0}</span>
            <span>|</span>
            <span>LOP Days: ${empDetails.loseOP || 0}</span>
          </div>
        </div>
        </div>

    <div class="summary-title">Employee Pay Summary</div>
      <div class="summary-container">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Employee Name</span><span class="info-value">${capitalizeTextWords(empDetails.name)}</span></div>
          <div class="info-item"><span class="info-label">Employee No</span><span class="info-value">${empDetails.empNo || "--"}</span></div>
          <div class="info-item"><span class="info-label">Department</span><span class="info-value">${capitalizeTextWords(empDetails.department)}</span></div>
          <div class="info-item"><span class="info-label">Date Of Joining</span><span class="info-value">${empDetails.doj || "-"}</span></div>
          <div class="info-item"><span class="info-label">Pay Period</span><span class="info-value">${empDetails.payslipMonth || "--"}</span></div>
          <div class="info-item"><span class="info-label">PAN</span><span class="info-value">${empDetails.pan || "--"}</span></div>
          <div class="info-item"><span class="info-label">PF A/C Number</span><span class="info-value">${empDetails.pfAccountNo || "--"}</span></div>
          <div class="info-item"><span class="info-label">ESI Number</span><span class="info-value">${empDetails.esiNo || "--"}</span></div>
          <div class="info-item"><span class="info-label">Bank Account No</span><span class="info-value">${empDetails.accNo || "--"}</span></div>
        </div>
      </div>

      <div class="financial-tables-stack">
        
        <div class="table-block">
          <div class="table-header">
            <span>EARNINGS DESCRIPTION</span>
            <div class="text-right">AMOUNT (₹)</div>
            <div class="text-right">YTD (₹)</div>
          </div>
          ${earningsRowsHtml}
          <div class="table-row total-row-block">
            <span>Gross Earnings</span>
            <div class="text-right">₹ ${formatCurrency(empDetails.monthlyCTC)}</div>
            <div class="text-right">₹ ${formatCurrency(empDetails.totalYtdEarn ?? empDetails.monthlyCTC)}</div>
          </div>
        </div>

        <div class="table-block">
          <div class="table-header">
            <span>DEDUCTIONS DESCRIPTION</span>
            <div class="text-right">AMOUNT (₹)</div>
            <div class="text-right">YTD (₹)</div>
          </div>
          ${deductionsRowsHtml}
          <div class="table-row total-row-block">
            <span>Total Deductions</span>
            <div class="text-right">₹ ${formatCurrency(empDetails.totalDeduction)}</div>
            <div class="text-right">₹ ${formatCurrency(empDetails.totalYtdDeduct ?? empDetails.totalDeduction)}</div>
          </div>
        </div>

      </div>

      <div class="final-payout-banner">
        <div class="final-label-stack">
          <h2>Total Net Payable</h2>
        </div>
        <div class="final-payout-value">
          ₹ ${formatCurrency(empDetails.netpay)}
        </div>
      </div>
      <div class="final-payout-words-box">
        Total Net Payable ${empDetails.netpay || "0.00"} (${empDetails.netpayInWords || "--"})
      </div>

      <div class="system-footer">
        • This is a system generated payslip and requires no physical signature •
      </div>

    </div>

  </body>
  </html>
  `;
    }

    const processPdfFile = async () => {
        const html = generatePdfHtml()
        const { uri } = await Print.printToFileAsync({ html })
        
        const fileName = `Payslip-${(empDetails.payMonth || "Document").replace(/\s+/g, "_")}.pdf`
        const safeCacheUri = `${FileSystem.cacheDirectory}${fileName}`
        
        await FileSystem.moveAsync({
            from: uri,
            to: safeCacheUri
        })
        return safeCacheUri
    }

    const downloadPdf = async () => {
  try {
    setDownloadLoading(true);
    const localUri = await processPdfFile(); // e.g., "file:///var/mobile/.../temp_payslip.pdf"
    
    if (!localUri) throw new Error("Could not resolve temporary file path.");
    
    const fileName = `Payslip_${Date.now()}.pdf`;

    if (Platform.OS === 'android') {
      // 1. Request access to a user-selected directory (SAF)
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        // 2. Create a blank file in that directory with the right mimeType
        const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/pdf'
        );
        
        // 3. Read temporary file data and write it directly into the new public file
        const fileContent = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.writeAsStringAsync(destinationUri, fileContent, { encoding: FileSystem.EncodingType.Base64 });
        
        Alert.alert("Success", "Payslip downloaded successfully to your chosen folder!");
      } else {
        Alert.alert("Permission Denied", "Storage access is required to save the file.");
      }
      
    } else {
      // iOS Implementation: Save directly to the app's accessible Documents folder
      const destinationPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({
        from: localUri,
        to: destinationPath
      });
      
      Alert.alert("Success", "Payslip downloaded to Files app inside your app's document folder!");
    }
  } catch (error) {
    console.error('Download Error:', error);
    Alert.alert("Download Error", "Could not complete PDF direct download.");
  } finally {
    setDownloadLoading(false);
  }
};

    const sharePdf = async () => {
        try {
            setShareLoading(true)
            const localUri = await processPdfFile()

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localUri, {
                    mimeType: "application/pdf",
                    dialogTitle: "Share Employee Payslip",
                    UTI: "com.adobe.pdf"
                })
            } else {
                Alert.alert("Unsupported System", "Sharing utilities are not available on this build.")
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            Alert.alert("Sharing Error", "An error occurred while passing your file to system handlers.");
        } finally {
            setShareLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F2BB5" translucent={true} />
            
            <View style={styles.appHeader}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.appHeaderTitle}>Payslip</Text>
                <TouchableOpacity 
                    style={styles.iconButton} 
                    onPress={downloadPdf} 
                    disabled={downloadLoading || shareLoading || dataLoading}
                >
                    <Feather name="download" size={22} color="#FFF" />
                </TouchableOpacity>
            </View>

            {dataLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3F2BB5" />
                </View>
            ) : (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.payslipCard}>
                        
                        <View style={styles.bankHeader}>
                            <Image 
                                source={require("../../../assets/images/HDFC.png")} 
                                style={styles.bankLogo}
                            />
                            <View style={styles.bankTextContainer}>
                                <Text style={styles.bankName}>{toUpperCaseString(empDetails.orgName || "HDFC BANK")}</Text>
                                <Text style={styles.bankAddress}>{empDetails.orgAddress || "Koramangala, Bengaluru, Karnataka 560034"}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.payslipMonthTitle}>Payslip for the month of {empDetails.payMonth || "November 2025"}</Text>

                         {/* Full width design container for the Net Pay section */}
                        <View style={styles.netPayCardFullWidth}>
                            <Text style={styles.netPayLabel}>Employee Net Pay</Text>
                            <Text style={styles.netPayAmount}>₹ {cleanDisplayValue(empDetails.netpay)}</Text>
                            <View style={styles.dashDivider} />
                            <Text style={styles.attendanceSummary}>
                                Paid Days: {empDetails.paidDays || 0}   |   LOP Days: {empDetails.loseOP || 0}
                            </Text>
                        </View>

                        <Text style={styles.sectionHeaderTitle}>EMPLOYEE PAY SUMMARY</Text>
                        
                        {/* Summary details card containing all standard structural metadata */}
                        <View style={styles.verticalSummaryBlock}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Employee Name</Text>
                                <Text style={styles.infoValue}>:  {capitalizeTextWords(empDetails.name)}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Employee No</Text>
                                <Text style={styles.infoValue}>:  {empDetails.empNo || "--"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Department</Text>
                                <Text style={styles.infoValue}>:  {capitalizeTextWords(empDetails.department)}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Date Of Joining</Text>
                                <Text style={styles.infoValue}>:  {empDetails.doj || "-"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Pay Period</Text>
                                <Text style={styles.infoValue}>:  {empDetails.payslipMonth || "--"}</Text>
                            </View>
    
                            {/* Section breakdown divider line inside metadata card */}
                            <View style={styles.innerCardDivider} />

                            {/* New requested account fields inserted gracefully here */}
                             <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>PAN</Text>
                                <Text style={styles.infoValue}>:  {empDetails.pan || "--"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>PF A/C Number</Text>
                                <Text style={styles.infoValue}>:  {empDetails.pfAccountNo || "--"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>ESI Number</Text>
                                <Text style={styles.infoValue}>:  {empDetails.esiNo || "--"}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Bank Account No</Text>
                                <Text style={styles.infoValue}>:  {empDetails.accNo || "--"}</Text>
                            </View>
                        </View>
                        <View style={styles.tableBlock}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, styles.cellLeft, { color: '#3F2BB5' }]}>EARNINGS</Text>
                                <Text style={[styles.tableHeaderCell, styles.cellRight]}>AMOUNT (₹)</Text>
                                <Text style={[styles.tableHeaderCell, styles.cellRight]}>YTD (₹)</Text>
                            </View>
                            
                            {empDetails.earnComponent && Object.entries(empDetails.earnComponent).map(([key, value]: any) => (
                                <View key={key} style={styles.tableDataRow}>
                                    <Text style={[styles.dataCell, styles.cellLeft]}>{key}</Text>
                                    <Text style={[styles.dataCell, styles.cellRight]}>{cleanDisplayValue(value)}</Text>
                                    <Text style={[styles.dataCell, styles.cellRight]}>
                                        {cleanDisplayValue(empDetails?.ytdEarn?.[key] ?? value)}
                                    </Text>
                                </View>
                            ))}

                            <View style={[styles.tableDataRow, styles.grossRow]}>
                                <Text style={[styles.dataCellBold, styles.cellLeft, { color: '#3F2BB5' }]}>Gross Earnings</Text>
                                <Text style={[styles.dataCellBold, styles.cellRight, { color: '#3F2BB5' }]}>{cleanDisplayValue(empDetails.monthlyCTC)}</Text>
                                <Text style={[styles.dataCellBold, styles.cellRight, { color: '#3F2BB5' }]}>{cleanDisplayValue(empDetails.totalYtdEarn ?? empDetails.monthlyCTC)}</Text>
                            </View>
                        </View>

                        <View style={styles.tableBlock}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.tableHeaderCell, styles.cellLeft, { color: '#3F2BB5' }]}>DEDUCTIONS</Text>
                                <Text style={[styles.tableHeaderCell, styles.cellRight]}>AMOUNT (₹)</Text>
                                <Text style={[styles.tableHeaderCell, styles.cellRight]}>YTD (₹)</Text>
                            </View>
                            
                            {!empDetails.deductComponent || Object.keys(empDetails.deductComponent).length === 0 ? (
                                <View style={styles.emptyCenterContainer}>
                                    <Text style={styles.emptyStateText}>No Deductions</Text>
                                </View>
                            ) : (
                                Object.entries(empDetails.deductComponent).map(([key, value]: any) => (
                                    <View key={key} style={styles.tableDataRow}>
                                        <Text style={[styles.dataCell, styles.cellLeft]}>{key}</Text>
                                        <Text style={[styles.dataCell, styles.cellRight]}>{cleanDisplayValue(value)}</Text>
                                        <Text style={[styles.dataCell, styles.cellRight]}>{cleanDisplayValue(empDetails?.ytdDeduct?.[key] ?? value)}</Text>
                                    </View>
                                ))
                            )}

                            <View style={[styles.tableDataRow, styles.grossRow]}>
                                <Text style={[styles.dataCellBold, styles.cellLeft, { color: '#3F2BB5' }]}>Total Deductions</Text>
                                <Text style={[styles.dataCellBold, styles.cellRight, { color: '#3F2BB5' }]}>{cleanDisplayValue(empDetails.totalDeduction)}</Text>
                                <Text style={[styles.dataCellBold, styles.cellRight, { color: '#3F2BB5' }]}>{cleanDisplayValue(empDetails.totalYtdDeduct ?? empDetails.totalDeduction)}</Text>
                            </View>
                        </View>

                        <View style={styles.formulaRow}>
                            <Text style={styles.formulaString} numberOfLines={1} adjustsFontSizeToFit>
                                NET PAY <Text style={{ color: '#7F8C8D', fontWeight: '400' }}>(Gross Earnings - Total Deductions)</Text>
                            </Text>
                            <Text style={styles.formulaValue}>₹ {cleanDisplayValue(empDetails.netpay)}</Text>
                        </View>

                        <View style={styles.payableBanner}>
                            <View style={styles.payableRow}>
                                <Text style={styles.payableLabel}>Total Net Payable</Text>
                                <Text style={styles.payableAmount}>₹ {cleanDisplayValue(empDetails.netpay)}</Text>
                            </View>
                            <Text style={styles.payableWords}> Total Net Payable {empDetails.netpay} ({empDetails.netpayInWords || ""})</Text>
                        </View>

                        <Text style={styles.footerNote}>• This is a system generated payslip •</Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                style={styles.downloadButton} 
                                onPress={downloadPdf} 
                                disabled={downloadLoading || shareLoading}
                            >
                                {downloadLoading ? <ActivityIndicator color="#3F2BB5" size="small" /> : (
                                    <>
                                        <Feather name="download" size={18} color="#3F2BB5" style={{ marginRight: 6 }} />
                                        <Text style={styles.downloadButtonText}>Download PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.shareButton} 
                                onPress={sharePdf} 
                                disabled={downloadLoading || shareLoading}
                            >
                                {shareLoading ? <ActivityIndicator color="#FFF" size="small" /> : (
                                    <>
                                        <Ionicons name="share-social-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.shareButtonText}>Share Payslip</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3F2BB5', 
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 16,
        backgroundColor: '#3F2BB5',
    },
    iconButton: {
        padding: 6,
    },
    appHeaderTitle: {
        flex: 1,
        textAlign: 'center',
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        flexGrow: 1, 
        backgroundColor: '#3F2BB5',
    },
    payslipCard: {
        flex: 1, 
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 36, 
    },
    bankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    bankLogo: {
        width: 110,
        height: 32,
        resizeMode: 'contain',
        marginRight: 12,
    },
    bankTextContainer: {
        flex: 1,
    },
    bankName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F2C59',
        letterSpacing: 0.5,
    },
    bankAddress: {
        fontSize: 10,
        color: '#7F8C8D',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 16,
    },
    payslipMonthTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 16,
    },
    sectionHeaderTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#3F2BB5',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    verticalSummaryBlock: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
    },
    innerCardDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 8,
        borderStyle: 'dashed',
        borderWidth: 0.5,
        borderRadius: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabel: {
        width: 125,
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    infoValue: {
        flex: 1,
        fontSize: 12,
        color: '#1E293B',
        fontWeight: '600',
    },
    netPayCardFullWidth: {
        backgroundColor: '#3F2BB5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    netPayLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    netPayAmount: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '800',
        marginVertical: 4,
    },
    dashDivider: {
        width: '100%',
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginVertical: 8,
    },
    attendanceSummary: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    tableBlock: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tableHeaderCell: {
        fontSize: 11,
        fontWeight: '700',
    },
    tableDataRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFF',
    },
    dataCell: {
        fontSize: 12,
        color: '#334155',
    },
    dataCellBold: {
        fontSize: 12,
        fontWeight: '700',
    },
    grossRow: {
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 0,
    },
    cellLeft: {
        flex: 2,
        textAlign: 'left',
    },
    cellRight: {
        flex: 1,
        textAlign: 'right',
    },
    emptyCenterContainer: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    emptyStateText: {
        fontSize: 12,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    formulaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    formulaString: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1E293B',
    },
    formulaValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    payableBanner: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
    },
    payableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    payableLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    payableAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#3F2BB5',
    },
    payableWords: {
        fontSize: 11,
        color: '#64748B',
        fontStyle: 'italic',
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 11,
        color: '#94A3B8',
        marginBottom: 24,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    downloadButton: {
        flex: 1,
        flexDirection: 'row',
        height: 46,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3F2BB5',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    downloadButtonText: {
        color: '#3F2BB5',
        fontSize: 14,
        fontWeight: '600',
    },
    shareButton: {
        flex: 1,
        flexDirection: 'row',
        height: 46,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3F2BB5',
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});