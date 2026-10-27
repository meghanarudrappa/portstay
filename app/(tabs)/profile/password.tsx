import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { API_BASE_URL } from '../../config/api'; 

export default function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Dynamic Password Strength Logic (Fixed TypeScript explicit object types)
    const getPasswordStrength = (password: string) => {
        if (!password) return { score: 0, text: 'Empty', color: '#EBEFF6', activeBars: 0 };
        
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 2) return { score, text: 'Weak', color: '#FF4D4D', activeBars: 1 };
        if (score === 3) return { score, text: 'Medium', color: '#FFA500', activeBars: 3 };
        return { score, text: 'Strong', color: '#24A148', activeBars: 4 };
    };

    const strength = getPasswordStrength(newPassword);

    const handleSave = async () => {
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        const formBody = new URLSearchParams({
            old_password: oldPassword,
            new_password: newPassword,
            repeat_password: confirmPassword
        }).toString();

        try {
            const response = await fetch(`${API_BASE_URL}/password-setting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
                credentials: 'include',
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (result.validated) {
                setOldPassword('');
                setNewPassword("");
                setConfirmPassword('');
                Alert.alert('Success', 'Password changed successfully!');
            } else {
                Alert.alert('Error', 'Password change failed.');
            }
        } catch (error) {
            // console.error('Error:', error);
            // Alert.alert('Error', 'Something went wrong.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A5CFA" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
                    
                    {/* Header Banner Section */}
                    <View style={styles.headerBanner}>
                        <View style={styles.leftHeaderBlock}>
                            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.mainTitle}>Change Password</Text>
                                <Text style={styles.subtitle}>Keep your account secure by using a strong password</Text>
                            </View>
                        </View>

                        {/* Shield Display Graphic */}
                        <View style={styles.shieldWrapper}>
                            <MaterialCommunityIcons name="shield-lock" size={90} color="rgba(255,255,255,0.2)" />
                            <Ionicons name="lock-closed" size={32} color="#FFFFFF" style={styles.shieldLockIcon} />
                        </View>
                    </View>

                    {/* Main White Content Card */}
                    <View style={styles.card}>
                        
                        {/* Old Password Input Row */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Old Password</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#4A5CFA" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showOldPassword}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    placeholder="Enter your current password"
                                    placeholderTextColor="#A4A9B8"
                                />
                                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showOldPassword ? "eye" : "eye-outline"} size={20} color="#7E8494" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password Input Row */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#4A5CFA" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter your new password"
                                    placeholderTextColor="#A4A9B8"
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showNewPassword ? "eye" : "eye-outline"} size={20} color="#7E8494" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input Row */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#4A5CFA" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your new password"
                                    placeholderTextColor="#A4A9B8"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showConfirmPassword ? "eye" : "eye-outline"} size={20} color="#7E8494" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Dynamic Password Strength Indicator Block */}
                        <View style={styles.strengthBlock}>
                            <View style={styles.strengthHeaderRow}>
                                <Text style={styles.strengthLabel}>Password Strength</Text>
                                {newPassword.length > 0 && (
                                    <View style={[styles.badge, { backgroundColor: strength.color + '15' }]}>
                                        <Text style={[styles.badgeText, { color: strength.color }]}>{strength.text}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.meterRow}>
                                <View style={[styles.meterSegment, strength.activeBars >= 1 && { backgroundColor: strength.color }]} />
                                <View style={[styles.meterSegment, strength.activeBars >= 2 && { backgroundColor: strength.color }]} />
                                <View style={[styles.meterSegment, strength.activeBars >= 3 && { backgroundColor: strength.color }]} />
                                <View style={[styles.meterSegment, strength.activeBars >= 4 && { backgroundColor: strength.color }]} />
                                <View style={styles.meterSegment} />
                            </View>
                        </View>

                        {/* Security Tips Box Block */}
                        <View style={styles.tipsContainer}>
                            <View style={styles.tipsHeaderRow}>
                                <View style={styles.tipsIconBox}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={22} color="#4A5CFA" />
                                </View>
                                <Text style={styles.tipsHeading}>Security Tips</Text>
                            </View>
                            
                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={newPassword.length >= 8 ? "#24A148" : "#4A5CFA"} />
                                    <Text style={[styles.gridText, newPassword.length >= 8 && { color: '#24A148', fontWeight: '700' }]}>Use at least 8 characters</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={/[^A-Za-z0-9]/.test(newPassword) ? "#24A148" : "#4A5CFA"} />
                                    <Text style={[styles.gridText, /[^A-Za-z0-9]/.test(newPassword) && { color: '#24A148', fontWeight: '700' }]}>Use special characters</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Ionicons name="checkmark-circle" size={16} color={/[0-9]/.test(newPassword) ? "#24A148" : "#4A5CFA"} />
                                    <Text style={[styles.gridText, /[0-9]/.test(newPassword) && { color: '#24A148', fontWeight: '700' }]}>Include numbers</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Ionicons name="checkmark-circle" size={16} color="#4A5CFA" />
                                    <Text style={styles.gridText}>Avoid common passwords</Text>
                                </View>
                            </View>
                        </View>

                        {/* Submit Action Trigger Button */}
                        <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
                            <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.updateButtonText}>Update Password</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#4A5CFA',
    },
    headerBanner: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 25 : 15,
        paddingBottom: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftHeaderBlock: {
        flex: 1,
        paddingRight: 10,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTextContainer: {
        width: '100%',
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 18,
    },
    shieldWrapper: {
        width: 90,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldLockIcon: {
        position: 'absolute',
        top: 26,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E2229',
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EBF0F9',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: '#A3B4D6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    iconContainer: {
        paddingLeft: 14,
        paddingRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 10,
        fontSize: 14,
        color: '#1E2229',
    },
    eyeIcon: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    strengthBlock: {
        backgroundColor: '#F8FAFD',
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#F0F4FA',
    },
    strengthHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        height: 24,
    },
    strengthLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E2229',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    meterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    meterSegment: {
        flex: 1,
        height: 5,
        backgroundColor: '#EBEFF6',
        borderRadius: 3,
        marginHorizontal: 3,
    },
    tipsContainer: {
        backgroundColor: '#F5F8FF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#EBF2FF',
    },
    tipsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipsIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EBF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    tipsHeading: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E2229',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '49%',
        marginBottom: 10,
    },
    gridText: {
        fontSize: 11,
        color: '#5C616F',
        marginLeft: 6,
        fontWeight: '500',
    },
    updateButton: {
        backgroundColor: '#5C6CFF',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5C6CFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.24,
        shadowRadius: 12,
        elevation: 4,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});