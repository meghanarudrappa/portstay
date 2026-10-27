// import React, { useState, useEffect } from 'react';
// import { View, TouchableOpacity, Text, StyleSheet, Platform, Keyboard, StatusBar } from 'react-native';
// import { useRouter, usePathname } from 'expo-router';
// import { Feather } from '@expo/vector-icons';

// type NavigationItem = {
//   name: string;
//   route: string;
//   iconName: keyof typeof Feather.glyphMap;
// };

// interface CrmBottomLayoutProps {
//   children?: React.ReactNode;
// }

// export function CrmBottomLayout({ children }: CrmBottomLayoutProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);

//   useEffect(() => {
//     const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
//     const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
//     return () => {
//       showListener.remove();
//       hideListener.remove();
//     };
//   }, []);

//   // Dedicated 5-item CRM navigation bar
//   const crmNavItems: NavigationItem[] = [
//     { name: 'CRM', route: '/(crm)/crmdashboard', iconName: 'grid' },
//     { name: 'Home', route: '/(crm)/dashboard', iconName: 'home' },
//     { name: 'Attendance', route: '/(crm)/attendance', iconName: 'calendar' },
//     { name: 'Payroll', route: '/(crm)/payslip', iconName: 'credit-card' },
//     { name: 'Profile', route: '/(crm)/profile', iconName: 'user' },
//   ];

//   const shouldHideNavigation = pathname === '/' || isKeyboardVisible;

//   // Active state checker
//   const isTabActive = (route: string) => {
//     const coreSegment = route.split('/').filter(Boolean).pop() || '';
//     return pathname.includes(coreSegment);
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      
//       {/* Screen view content */}
//       <View style={shouldHideNavigation ? styles.content : styles.screenContent}>
//         {children}
//       </View>

//       {/* CRM Bottom Navigation Bar */}
//       {!shouldHideNavigation && (
//         <View style={styles.bottomNav}>
//           {crmNavItems.map((item) => {
//             const isActive = isTabActive(item.route);

//             return (
//               <TouchableOpacity
//                 key={item.name}
//                 style={styles.navItem}
//                 activeOpacity={0.6}
//                 onPress={() => router.push(item.route as any)}
//               >
//                 <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
//                   <Feather 
//                     name={item.iconName} 
//                     size={20} 
//                     color={isActive ? '#435ffd' : '#94a3b8'} 
//                   />
//                 </View>
//                 <Text style={[styles.navText, isActive && styles.activeNavText]}>
//                   {item.name}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8fafc' },
//   content: { flex: 1, backgroundColor: '#f8fafc' },
//   screenContent: { flex: 1, paddingBottom: 70 },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 70,
//     backgroundColor: '#ffffff',
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//     paddingHorizontal: 4,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000000',
//         shadowOffset: { width: 0, height: -4 },
//         shadowOpacity: 0.05,
//         shadowRadius: 10,
//       },
//       android: { elevation: 20 },
//     }),
//   },
//   navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
//   iconWrapper: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   activeIconWrapper: { backgroundColor: '#eff6ff' },
//   navText: { fontSize: 10, fontWeight: '500', color: '#94a3b8', marginTop: 2 },
//   activeNavText: { color: '#435ffd', fontWeight: '700' },
// });

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Keyboard, StatusBar } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type NavigationItem = {
  name: string;
  route: string;
  iconName: keyof typeof Feather.glyphMap;
};

interface CrmBottomLayoutProps {
  children?: React.ReactNode;
}

export function CrmBottomLayout({ children }: CrmBottomLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Dedicated 5-item CRM navigation bar
  const crmNavItems: NavigationItem[] = [
    { name: 'CRM', route: '/(crm)/crmdashboard', iconName: 'grid' },
    { name: 'Workplace', route: '/(crm)/dashboard', iconName: 'home' },
    { name: 'Attendance', route: '/(crm)/attendance', iconName: 'calendar' },
    { name: 'Payroll', route: '/(crm)/payslip', iconName: 'credit-card' },
    { name: 'Profile', route: '/(crm)/profile', iconName: 'user' },
  ];

  const shouldHideNavigation = pathname === '/' || isKeyboardVisible;

  // Active state checker
  const isTabActive = (route: string) => {
    const currentPath = pathname.toLowerCase();

    // 1. CRM Tab active logic: Matches CRM dashboard AND nested sub-screens (leads, deals, customers, analytics)
    if (route.includes('crmdashboard')) {
      const crmSubRoutes = ['crmdashboard', 'lead', 'deal', 'customer', 'analytic'];
      return crmSubRoutes.some((sub) => currentPath.includes(sub));
    }

    // 2. Home Tab active logic: Strictly matches /dashboard to prevent conflict with crmdashboard
    if (route.includes('/dashboard')) {
      return currentPath.endsWith('/dashboard') || currentPath.endsWith('/dashboard/');
    }

    // 3. Other tabs active logic
    if (route.includes('attendance')) return currentPath.includes('attendance');
    if (route.includes('payslip')) return currentPath.includes('payslip');
    if (route.includes('profile')) return currentPath.includes('profile');

    return false;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      
      {/* Screen view content */}
      <View style={shouldHideNavigation ? styles.content : styles.screenContent}>
        {children}
      </View>

      {/* CRM Bottom Navigation Bar */}
      {!shouldHideNavigation && (
        <View style={styles.bottomNav}>
          {crmNavItems.map((item) => {
            const isActive = isTabActive(item.route);

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
                    size={20} 
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, backgroundColor: '#f8fafc' },
  screenContent: { flex: 1, paddingBottom: 70 },
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
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 20 },
    }),
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  iconWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: { backgroundColor: '#eff6ff' },
  navText: { fontSize: 10, fontWeight: '500', color: '#94a3b8', marginTop: 2 },
  activeNavText: { color: '#435ffd', fontWeight: '700' },
});