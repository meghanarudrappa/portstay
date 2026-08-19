import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Keyboard, StatusBar } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useSession } from '@/context/ContextSession';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type RouteType = 
  | '/(tabs)/dashboard' 
  | '/(tabs)/attendance' 
  | '/(tabs)/payslip' 
  | '/(tabs)/profile';

export function MainStackLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const pathname = usePathname();
    const { sessionData, handleLogout } = useSession();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const navigationItems: { name: string; route: RouteType; iconName: keyof typeof Feather.glyphMap; isCenter?: boolean }[] = [
        {
            name: 'Home',
            route: '/(tabs)/dashboard',
            iconName: 'home',
        },
        {
            name: 'Attendance',
            route: '/(tabs)/attendance',
            iconName: 'calendar',
        },
        
        {
            name: 'Payroll',
            route: '/(tabs)/payslip',
            iconName: 'credit-card',
        },
        {
            name: 'Profile',
            route: '/(tabs)/profile',
            iconName: 'user',
        },
    ];

    const shouldHideNavigation = pathname === '/' || isKeyboardVisible;

    // Matches active state flawlessly even when deep inside child routes like /expenses/create
    const isTabActive = (route: string) => {
        const segments = route.split('/');
        const coreSegment = segments.find(s => s !== '' && s !== '(tabs)') || '';
        return pathname.includes(coreSegment);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            <View style={shouldHideNavigation ? styles.content : styles.screenContent}>
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: Colors[colorScheme ?? 'light'].background,
                        },
                        headerTintColor: Colors[colorScheme ?? 'light'].text,
                        headerShown: false,
                        headerShadowVisible: false, 
                        contentStyle: { 
                            backgroundColor: '#f8fafc' 
                        },
                    }}
                >
                    <Stack.Screen name="dashboard" />
                    <Stack.Screen name="attendance" />
                    <Stack.Screen name="payslip" />
                    <Stack.Screen name="profile" />
                </Stack>
            </View>

            {/* Standard User Dynamic Bar Template */}
            {!shouldHideNavigation && sessionData?.role !== 'Superadmin' && (
                <View style={styles.bottomNav}>
                    {navigationItems.map((item) => {
                        const isActive = isTabActive(item.route);

                        if (item.isCenter) {
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    style={styles.centerButtonContainer}
                                    activeOpacity={0.85}
                                    onPress={() => router.push(item.route as any)}
                                >
                                    <View style={[
                                        styles.floatingCenterButton,
                                        isActive && styles.activeFloatingButton
                                    ]}>
                                        <Feather name={item.iconName} size={26} color="#ffffff" />
                                    </View>
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity
                                key={item.name}
                                style={styles.navItem}
                                activeOpacity={0.6}
                                onPress={() => router.push(item.route as any)}
                            >
                                <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                                    <Feather 
                                        name={item.iconName} 
                                        size={22} 
                                        color={isActive ? '#435ffd' : '#94a3b8'} 
                                    />
                                </View>
                                <Text style={[styles.navText, isActive && styles.activeNavText]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Superadmin Static Utility Control Bar */}
            {!shouldHideNavigation && sessionData?.role === 'Superadmin' && (
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => router.push('/(tabs)/profile/superAdminProfile' as any)}
                    >
                        <View style={[styles.iconWrapper, styles.activeIconWrapper]}>
                            <Feather name="shield" size={22} color="#435ffd" />
                        </View>
                        <Text style={[styles.navText, styles.activeNavText]}>Admin Dashboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
                        <View style={styles.iconWrapper}>
                            <Feather name="log-out" size={22} color="#ef4444" />
                        </View>
                        <Text style={[styles.navText, { color: '#ef4444' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    screenContent: {
        flex: 1,
        paddingBottom: 70, 
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingHorizontal: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconWrapper: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconWrapper: {
        backgroundColor: '#eff6ff',
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#94a3b8',
        marginTop: 2,
    },
    activeNavText: {
        color: '#435ffd', 
        fontWeight: '700',
    },
    centerButtonContainer: {
        width: 68,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingCenterButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#94a3b8',
        justifyContent: 'center',
        alignItems: 'center',
        top: -14, 
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
    },
    activeFloatingButton: {
        backgroundColor: '#435ffd',
        shadowColor: '#435ffd',
        shadowOpacity: 0.3,
    },
});