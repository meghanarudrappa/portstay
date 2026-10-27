import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function Form16Screen() {
    const router = useRouter();
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    
    // Tracks localized state of previously grabbed files
    const [downloadedHistory, setDownloadedHistory] = useState<string[]>([]);

    // Mock payload containing financial year availability parameters
    const form16Years = [
        { id: "1", financialYear: "2025 - 2026", status: "Available", size: "1.2 MB", releaseDate: "31 May 2026" },
        { id: "2", financialYear: "2024 - 2025", status: "Available", size: "1.1 MB", releaseDate: "15 June 2025" },
        { id: "3", financialYear: "2023 - 2024", status: "Not Generated", size: "--", releaseDate: "--" }
    ];

    const handleDownload = (id: string, year: string) => {
        setDownloadingId(id);
        
        // Simulating structural local storage write cycles
        setTimeout(() => {
            setDownloadingId(null);
            if (!downloadedHistory.includes(year)) {
                setDownloadedHistory(prev => [year, ...prev]);
            }
            Alert.alert("Success", `Form 16 for Financial Year ${year} downloaded successfully!`);
        }, 1800);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Navigation Header Action Row */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={22} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Form 16 Tax Statements</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                
                {/* Information Callout Banner */}
                <View style={styles.infoBox}>
                    <Feather name="info" size={18} color="#0284C7" style={{ marginTop: 2 }} />
                    <Text style={styles.infoText}>
                        Form 16 is an official certificate issued by your employer listing taxable salary earnings alongside computed TDS deductions.
                    </Text>
                </View>

                <Text style={styles.sectionHeading}>Available Statements</Text>
                
                {form16Years.map((item) => {
                    const isAvailable = item.status === "Available";
                    const hasBeenDownloaded = downloadedHistory.includes(item.financialYear);

                    return (
                        <View key={item.id} style={styles.statementCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconContainer}>
                                    <Feather name="file-text" size={22} color={isAvailable ? "#0284C7" : "#94A3B8"} />
                                </View>
                                <View style={styles.metaContainer}>
                                    <Text style={styles.yearTitle}>FY {item.financialYear}</Text>
                                    <Text style={styles.subMetaText}>
                                        {isAvailable ? `Released: ${item.releaseDate} • ${item.size}` : "Awaiting processing validation"}
                                    </Text>
                                </View>
                                
                                <View style={[styles.statusBadge, !isAvailable && { backgroundColor: '#F1F5F9' }]}>
                                    <Text style={[styles.statusBadgeText, !isAvailable && { color: '#64748B' }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {isAvailable ? (
                                <TouchableOpacity 
                                    style={[styles.downloadButton, hasBeenDownloaded && styles.downloadedButtonSecondary]}
                                    onPress={() => handleDownload(item.id, item.financialYear)}
                                    disabled={downloadingId !== null}
                                >
                                    {downloadingId === item.id ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Feather name={hasBeenDownloaded ? "refresh-cw" : "download"} size={16} color={hasBeenDownloaded ? "#0284C7" : "#FFFFFF"} />
                                            <Text style={[styles.downloadButtonText, hasBeenDownloaded && { color: '#0284C7' }]}>
                                                {hasBeenDownloaded ? "Download Again" : "Download PDF Statement"}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.disabledPlaceholder}>
                                    <Feather name="lock" size={14} color="#94A3B8" />
                                    <Text style={styles.disabledPlaceholderText}>Document under generation sequence</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Local History Tracking Block Section */}
                <Text style={styles.sectionHeading}>Recent Local Downloads</Text>
                {downloadedHistory.length > 0 ? (
                    <View style={styles.historyCardContainer}>
                        {downloadedHistory.map((historyYear, index) => (
                            <View key={index} style={[styles.historyRowItem, index === downloadedHistory.length - 1 && { borderBottomWidth: 0 }]}>
                                <View style={styles.historyMeta}>
                                    <Feather name="check-circle" size={16} color="#10B981" />
                                    <Text style={styles.historyText}>FY {historyYear}_Form16.pdf</Text>
                                </View>
                                <Text style={styles.historyTimestamp}>Just Now</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyHistoryState}>
                        <Feather name="download-cloud" size={28} color="#CBD5E1" />
                        <Text style={styles.emptyHistoryText}>No active files compiled during this app runtime session.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, height: 60, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", elevation: 1 },
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
    headerTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
    contentScroll: { padding: 16 },
    infoBox: { flexDirection: "row", gap: 10, backgroundColor: "#E0F2FE", padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#BAE6FD" },
    infoText: { flex: 1, fontSize: 12, color: "#0369A1", lineHeight: 18, fontWeight: "500" },
    sectionHeading: { fontSize: 15, fontWeight: "700", color: "#334155", marginBottom: 12, marginTop: 4, letterSpacing: 0.3 },
    statementCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center" },
    iconContainer: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center" },
    metaContainer: { flex: 1, paddingHorizontal: 12 },
    yearTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    subMetaText: { fontSize: 11, color: "#64748B", marginTop: 2, fontWeight: "500" },
    statusBadge: { backgroundColor: "#E0F2FE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusBadgeText: { fontSize: 11, fontWeight: "700", color: "#0369A1" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },
    downloadButton: { height: 42, borderRadius: 10, backgroundColor: "#0284C7", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
    downloadedButtonSecondary: { backgroundColor: "#F0F9FF", borderWidth: 1, borderColor: "#0284C7" },
    downloadButtonText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
    disabledPlaceholder: { height: 42, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, backgroundColor: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderStyle: "dashed", borderColor: "#CBD5E1" },
    disabledPlaceholderText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
    historyCardContainer: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 16, marginBottom: 32 },
    historyRowItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    historyMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
    historyText: { fontSize: 13, fontWeight: "500", color: "#334155" },
    historyTimestamp: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
    emptyHistoryState: { padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed", marginBottom: 32 },
    emptyHistoryText: { fontSize: 12, color: "#94A3B8", marginTop: 6, textAlign: "center", fontWeight: "500" }
});