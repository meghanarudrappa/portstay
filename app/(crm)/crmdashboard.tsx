// // import React from 'react';
// // import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { StatusBar } from 'expo-status-bar';

// // export default function CrmDashboardScreen() {
// //   const router = useRouter();

// // const crmModules = [
// //   { id: '1', title: 'Leads', icon: 'people-outline', color: '#4f46e5', route: '/leads/home' },
// //   { id: '2', title: 'Accounts', icon: 'briefcase', color: '#dc2626', route: '/accounts/AccountsModule' },
// //   { id: '3', title: 'Contacts', icon: 'people', color: '#d97706', route: '/contacts/home' },
// //   { id: '4', title: 'Deals', icon: 'briefcase-outline', color: '#059669', route: '/deals/home' },
// // ];
  
// // return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <StatusBar style="dark" />
// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={styles.header}>
// //           <Text style={styles.welcomeText}>CRM 👋</Text>
// //           <Text style={styles.subtitleText}>Manage your pipeline and sales activity</Text>
// //         </View>

// //         {/* Quick Access Modules Grid */}
// //         <View style={styles.gridContainer}>
// //           {crmModules.map((item) => (
// //             <TouchableOpacity 
// //               key={item.id} 
// //               style={styles.card} 
// //               activeOpacity={0.8}
// //               onPress={() => item.route && router.push(item.route as any)}
// //             >
// //               <View style={[styles.iconBadge, { backgroundColor: item.color + '15' }]}>
// //                 <Ionicons name={item.icon as any} size={28} color={item.color} />
// //               </View>
// //               <Text style={styles.cardTitle}>{item.title}</Text>
// //             </TouchableOpacity>
// //           ))}
// //         </View>

// //         {/* Key Performance Metric Overview */}
// //         <View style={styles.summarySection}>
// //           <Text style={styles.sectionTitle}>Overview</Text>
// //           <View style={styles.summaryCard}>
// //             <View style={styles.summaryRow}>
// //               <Text style={styles.summaryLabel}>Active Leads</Text>
// //               <Text style={styles.summaryValue}>--</Text>
// //             </View>
// //             <View style={styles.divider} />
// //             <View style={styles.summaryRow}>
// //               <Text style={styles.summaryLabel}>Total Deals Value</Text>
// //               <Text style={styles.summaryValue}>--</Text>
// //             </View>
// //           </View>
// //         </View>
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safeArea: { flex: 1, backgroundColor: '#f3efff' },
// //   container: { padding: 20 },
// //   header: { marginTop: 10, marginBottom: 24 },
// //   welcomeText: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
// //   subtitleText: { fontSize: 14, color: '#64748b', marginTop: 4 },
// //   gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
// //   card: {
// //     backgroundColor: '#ffffff',
// //     width: '48%',
// //     padding: 20,
// //     borderRadius: 20,
// //     marginBottom: 16,
// //     alignItems: 'center',
// //     elevation: 3,
// //     shadowColor: '#0f172a',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 10,
// //   },
// //   iconBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
// //   cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
// //   summarySection: { marginTop: 10 },
// //   sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
// //   summaryCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, elevation: 2 },
// //   summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
// //   summaryLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
// //   summaryValue: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
// //   divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
// // });

// import React from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width } = Dimensions.get('window');

// interface SalesItem {
//   id: string;
//   title: string;
//   subtitle: string;
//   icon: keyof typeof Ionicons.glyphMap;
//   color: string;
//   gradientColors: [string, string];
//   route: string;
// }

// interface RelationshipItem {
//   id: string;
//   title: string;
//   subtitle: string;
//   icon: keyof typeof Ionicons.glyphMap;
//   color: string;
//   gradientColors: [string, string];
//   route: string;
// }

// export default function EnterpriseCrmScreen() {
//   const router = useRouter();

//   const salesModules: SalesItem[] = [
//     {
//       id: '1',
//       title: 'Leads',
//       subtitle: 'Capture & track potential customers',
//       icon: 'funnel',
//       color: '#007aff',
//       gradientColors: ['#ffffff', '#e0f2fe'],
//       route: '/leads/home',
//     },
//     {
//       id: '2',
//       title: 'Accounts',
//       subtitle: 'Manage your business accounts',
//       icon: 'business',
//       color: '#5856d6',
//       gradientColors: ['#ffffff', '#f3e8ff'],
//       route: '/accounts/AccountsModule',
//     },
//     {
//       id: '3',
//       title: 'Contacts',
//       subtitle: 'Connect with your contacts',
//       icon: 'people',
//       color: '#ff9500',
//       gradientColors: ['#ffffff', '#ffedd5'],
//       route: '/contacts/home',
//     },
//     {
//       id: '4',
//       title: 'Deals',
//       subtitle: 'Track and close your deals',
//       icon: 'cash',
//       color: '#34c759',
//       gradientColors: ['#ffffff', '#dcfce7'],
//       route: '/deals/home',
//     },
//   ];

//   const relationshipModules: RelationshipItem[] = [
//     {
//       id: '10',
//       title: 'Customers',
//       subtitle: 'Manage your customers',
//       icon: 'person',
//       color: '#007aff',
//       gradientColors: ['#ffffff', '#e0f2fe'],
//       route: '/customers/home',
//     },
//     {
//       id: '11',
//       title: 'Partners',
//       subtitle: 'Work with your partners',
//       icon: 'hand-left',
//       color: '#06b6d4',
//       gradientColors: ['#ffffff', '#cff4fc'],
//       route: '/partners/home',
//     },
//     {
//       id: '12',
//       title: 'Distributors',
//       subtitle: 'Manage your distributors',
//       icon: 'bus',
//       color: '#10b981',
//       gradientColors: ['#ffffff', '#d1fae5'],
//       route: '/distributors/home',
//     },
//     {
//       id: '13',
//       title: 'Dealers / Resellers',
//       subtitle: 'Connect with dealers and resellers',
//       icon: 'storefront',
//       color: '#8b5cf6',
//       gradientColors: ['#ffffff', '#f3e8ff'],
//       route: '/dealers/home',
//     },
//     {
//       id: '14',
//       title: 'Suppliers',
//       subtitle: 'Manage your suppliers',
//       icon: 'cube',
//       color: '#f43f5e',
//       gradientColors: ['#ffffff', '#ffe4e6'],
//       route: '/suppliers/home',
//     },
//   ];

//   return (
//     <View style={styles.mainContainer}>
//       <StatusBar style="light" translucent backgroundColor="transparent" />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
//         {/* Curved Deep Blue Hero Header */}
//         <LinearGradient
//           colors={['#0a2372', '#123eb1', '#2862ec']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.heroHeader}
//         >
//           <SafeAreaView>
//             <View style={styles.headerContent}>
//               <View style={styles.headerTitleRow}>
//                 <View style={styles.brandBadgeIcon}>
//                   <Ionicons name="trending-up" size={24} color="#ffffff" />
//                 </View>
//                 <View style={styles.headerTextGroup}>
//                   <Text style={styles.headerTitle}>CRM</Text>
//                   <Text style={styles.headerSubtitle}>Manage Sales & Networks</Text>
//                   <View style={styles.headerUnderline} />
//                 </View>
//               </View>

//               {/* Decorative 3D Analytics Art Placeholder */}
//               <View style={styles.analyticsArtBox}>
//                 <Ionicons name="bar-chart" size={48} color="rgba(255, 255, 255, 0.25)" />
//               </View>
//             </View>
//           </SafeAreaView>
//         </LinearGradient>

//         <View style={styles.bodyContent}>
          
//           {/* SECTION 1: SALES */}
//           <View style={styles.sectionCard}>
//             <View style={styles.sectionHeader}>
//               <View style={styles.sectionHeaderLeft}>
//                 <View style={[styles.sectionIconBadge, { backgroundColor: '#007aff' }]}>
//                   <Ionicons name="trending-up" size={20} color="#ffffff" />
//                 </View>
//                 <View>
//                   <Text style={styles.sectionTitle}>Sales</Text>
//                   <Text style={styles.sectionSubtitle}>Manage leads, accounts, contacts and deals</Text>
//                 </View>
//               </View>

//               <View style={styles.sectionHeaderRight}>
                
//                 <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
//               </View>
//             </View>

//             {/* Horizontal Scroll for Sales */}
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.horizontalGrid}
//             >
//               {salesModules.map((item) => (
//                 <TouchableOpacity
//                   key={item.id}
//                   activeOpacity={0.8}
//                   style={styles.salesCardWrapper}
//                   onPress={() => item.route && router.push(item.route as any)}
//                 >
//                   <LinearGradient
//                     colors={item.gradientColors}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 1 }}
//                     style={styles.salesCard}
//                   >
//                     {/* Left Accent Strip */}
//                     <View style={[styles.accentStrip, { backgroundColor: item.color }]} />

//                     <View style={[styles.cardIconBox, { backgroundColor: item.color }]}>
//                       <Ionicons name={item.icon} size={20} color="#ffffff" />
//                     </View>

//                     <Text style={styles.cardTitle}>{item.title}</Text>
//                     <Text style={styles.cardSubtitle} numberOfLines={2}>
//                       {item.subtitle}
//                     </Text>

//                     <View style={[styles.arrowCircle, { backgroundColor: item.color + '15' }]}>
//                       <Ionicons name="arrow-forward" size={14} color={item.color} />
//                     </View>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>

//           {/* SECTION 2: RELATIONSHIP MANAGEMENT */}
//           <View style={styles.sectionCard}>
//             <View style={styles.sectionHeader}>
//               <View style={styles.sectionHeaderLeft}>
//                 <View style={[styles.sectionIconBadge, { backgroundColor: '#5856d6' }]}>
//                   <Ionicons name="people" size={20} color="#ffffff" />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.sectionTitle}>Relationship Management</Text>
//                   <Text style={styles.sectionSubtitle} numberOfLines={1}>
//                     Build stronger relationships across your network
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.sectionHeaderRight}>
//                 <View style={[styles.countBadge, { backgroundColor: '#5856d6' }]}>
//                   <Text style={styles.countBadgeText}>5</Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
//               </View>
//             </View>

//             {/* Grid Layout for Relationship Management */}
//             <View style={styles.relationshipGrid}>
//               {/* Row 1 (3 items) */}
//               <View style={styles.gridRow}>
//                 {relationshipModules.slice(0, 3).map((item) => (
//                   <TouchableOpacity
//                     key={item.id}
//                     activeOpacity={0.8}
//                     style={styles.relCardWrapperRow1}
//                     onPress={() => item.route && router.push(item.route as any)}
//                   >
//                     <LinearGradient
//                       colors={item.gradientColors}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 1 }}
//                       style={styles.relCard}
//                     >
//                       <View style={[styles.accentStrip, { backgroundColor: item.color }]} />
//                       <View style={[styles.cardIconBox, { backgroundColor: item.color }]}>
//                         <Ionicons name={item.icon} size={20} color="#ffffff" />
//                       </View>
//                       <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
//                       <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>

//                       <View style={[styles.arrowCircle, { backgroundColor: item.color + '15' }]}>
//                         <Ionicons name="arrow-forward" size={14} color={item.color} />
//                       </View>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* Row 2 (2 items wider) */}
//               <View style={styles.gridRow}>
//                 {relationshipModules.slice(3, 5).map((item) => (
//                   <TouchableOpacity
//                     key={item.id}
//                     activeOpacity={0.8}
//                     style={styles.relCardWrapperRow2}
//                     onPress={() => item.route && router.push(item.route as any)}
//                   >
//                     <LinearGradient
//                       colors={item.gradientColors}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 1 }}
//                       style={styles.relCard}
//                     >
//                       <View style={[styles.accentStrip, { backgroundColor: item.color }]} />
//                       <View style={[styles.cardIconBox, { backgroundColor: item.color }]}>
//                         <Ionicons name={item.icon} size={20} color="#ffffff" />
//                       </View>
//                       <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
//                       <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>

//                       <View style={[styles.arrowCircle, { backgroundColor: item.color + '15' }]}>
//                         <Ionicons name="arrow-forward" size={14} color={item.color} />
//                       </View>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           </View>

//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: '#eef2f7',
//   },
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   heroHeader: {
//     paddingTop: Platform.OS === 'android' ? 44 : 10,
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   headerTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   brandBadgeIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 14,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   headerTextGroup: {
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '900',
//     color: '#ffffff',
//     letterSpacing: -0.5,
//   },
//   headerSubtitle: {
//     fontSize: 13,
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontWeight: '500',
//     marginTop: 2,
//   },
//   headerUnderline: {
//     width: 36,
//     height: 3,
//     backgroundColor: '#38bdf8',
//     borderRadius: 2,
//     marginTop: 6,
//   },
//   analyticsArtBox: {
//     width: 70,
//     height: 70,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.08)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bodyContent: {
//     paddingHorizontal: 16,
//     marginTop: -20,
//   },
//   sectionCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 24,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     shadowColor: '#0f172a',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.05,
//     shadowRadius: 16,
//     elevation: 3,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   sectionIconBadge: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#0f172a',
//     letterSpacing: -0.3,
//   },
//   sectionSubtitle: {
//     fontSize: 12,
//     color: '#64748b',
//     fontWeight: '500',
//     marginTop: 1,
//   },
//   sectionHeaderRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   countBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 12,
//     marginRight: 6,
//   },
//   countBadgeText: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#ffffff',
//   },
//   horizontalGrid: {
//     paddingRight: 10,
//   },
//   salesCardWrapper: {
//     width: 140,
//     marginRight: 12,
//   },
//   salesCard: {
//     borderRadius: 18,
//     padding: 14,
//     height: 180,
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: '#f1f5f9',
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   accentStrip: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     bottom: 0,
//     width: 4,
//   },
//   cardIconBox: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#0f172a',
//     letterSpacing: -0.2,
//   },
//   cardSubtitle: {
//     fontSize: 11,
//     color: '#64748b',
//     fontWeight: '400',
//     marginTop: 2,
//     lineHeight: 14,
//   },
//   arrowCircle: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     marginTop: 8,
//   },
//   relationshipGrid: {
//     marginTop: 4,
//   },
//   gridRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   relCardWrapperRow1: {
//     width: (width - 72) / 3,
//   },
//   relCardWrapperRow2: {
//     width: (width - 64) / 2,
//   },
//   relCard: {
//     borderRadius: 18,
//     padding: 12,
//     height: 175,
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: '#f1f5f9',
//     position: 'relative',
//     overflow: 'hidden',
//   },
// });

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CrmModuleItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradientColors: [string, string];
  route: string;
}

export default function EnterpriseCrmScreen() {
  const router = useRouter();

  const salesModules: CrmModuleItem[] = [
    {
      id: '1',
      title: 'Leads',
      subtitle: 'Capture & track potential clients',
      icon: 'funnel',
      color: '#007aff',
      gradientColors: ['#ffffff', '#f0f7ff'],
      route: '/leads/home',
    },
    {
      id: '2',
      title: 'Accounts',
      subtitle: 'Manage your enterprise accounts',
      icon: 'business',
      color: '#5856d6',
      gradientColors: ['#ffffff', '#f5f3ff'],
      route: '/accounts/AccountsModule',
    },
    {
      id: '3',
      title: 'Contacts',
      subtitle: 'Connect with key contacts',
      icon: 'people',
      color: '#ff9500',
      gradientColors: ['#ffffff', '#fff7ed'],
      route: '/contacts/home',
    },
    {
      id: '4',
      title: 'Deals',
      subtitle: 'Track and close revenue deals',
      icon: 'cash',
      color: '#34c759',
      gradientColors: ['#ffffff', '#f0fdf4'],
      route: '/deals/home',
    },
  ];

  const relationshipModules: CrmModuleItem[] = [
    {
      id: '10',
      title: 'Customers',
      subtitle: 'Manage customer relations',
      icon: 'person',
      color: '#007aff',
      gradientColors: ['#ffffff', '#f0f7ff'],
      route: '/customers/home',
    },
    {
      id: '11',
      title: 'Partners',
      subtitle: 'Collaborate with partner network',
      icon: 'hand-left',
      color: '#06b6d4',
      gradientColors: ['#ffffff', '#ecfeff'],
      route: '/partners/home',
    },
    {
      id: '12',
      title: 'Distributors',
      subtitle: 'Manage distribution logistics',
      icon: 'bus',
      color: '#10b981',
      gradientColors: ['#ffffff', '#ecfdf5'],
      route: '/distributors/home',
    },
    {
      id: '13',
      title: 'Dealers & Resellers',
      subtitle: 'Connect with retail channels',
      icon: 'storefront',
      color: '#8b5cf6',
      gradientColors: ['#ffffff', '#f5f3ff'],
      route: '/dealers/home',
    },
    {
      id: '14',
      title: 'Suppliers',
      subtitle: 'Vendor & supply chain management',
      icon: 'cube',
      color: '#f43f5e',
      gradientColors: ['#ffffff', '#fff1f2'],
      route: '/suppliers/home',
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Curved Hero Header */}
        <LinearGradient
          colors={['#123eb1', '#0a2372', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                {/* <View style={styles.brandBadgeIcon}>
                  <Ionicons name="trending-up" size={24} color="#ffffff" />
                </View> */}
                <View style={styles.headerTextGroup}>
                  <Text style={styles.headerTitle}>CRM</Text>
                  <Text style={styles.headerSubtitle}>Manage Sales & Networks</Text>
                  <View style={styles.headerUnderline} />
                </View>
              </View>

              {/* CRM Image Header Illustration */}
              {/* <View style={styles.headerImageContainer}>
                <Image
                  source={require('@/assets/images/crmimage.png')}
                  style={styles.headerImage}
                  resizeMode="cover"
                />
              </View> */}
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.bodyContent}>
          
          {/* SECTION 1: SALES */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#007aff' }]}>
                  <Ionicons name="trending-up" size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Sales</Text>
                  <Text style={styles.sectionSubtitle}>Leads, accounts, contacts & deals</Text>
                </View>
              </View>

              <View style={styles.sectionHeaderRight}>
                {/* <View style={[styles.countBadge, { backgroundColor: '#007aff' }]}>
                  <Text style={styles.countBadgeText}>4</Text>
                </View> */}
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            </View>

            {/* Grid Layout for Sales (2 Columns - No Horizontal Scroll) */}
            <View style={styles.gridContainer}>
              {salesModules.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={styles.halfCardWrapper}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <LinearGradient
                    colors={item.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.moduleCard}
                  >
                    <View style={[styles.accentStrip, { backgroundColor: item.color }]} />

                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.cardIconBox, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon} size={20} color="#ffffff" />
                      </View>
                      <View style={[styles.arrowCircle, { backgroundColor: item.color + '15' }]}>
                        <Ionicons name="arrow-forward" size={14} color={item.color} />
                      </View>
                    </View>

                    <View>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.cardSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SECTION 2: RELATIONSHIP MANAGEMENT */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#5856d6' }]}>
                  <Ionicons name="people" size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Relationship Management</Text>
                  <Text style={styles.sectionSubtitle} numberOfLines={1}>
                    Build stronger network relationships
                  </Text>
                </View>
              </View>

              <View style={styles.sectionHeaderRight}>
                {/* <View style={[styles.countBadge, { backgroundColor: '#5856d6' }]}>
                  <Text style={styles.countBadgeText}>5</Text>
                </View> */}
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            </View>

            {/* Grid Layout for Relationship Management */}
            <View style={styles.gridContainer}>
              {relationshipModules.map((item, index) => {
                // If it's the last item out of 5, span full width
                const isFullWidth = index === relationshipModules.length - 1 && relationshipModules.length % 2 !== 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={isFullWidth ? styles.fullCardWrapper : styles.halfCardWrapper}
                    onPress={() => item.route && router.push(item.route as any)}
                  >
                    <LinearGradient
                      colors={item.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.moduleCard}
                    >
                      <View style={[styles.accentStrip, { backgroundColor: item.color }]} />

                      <View style={styles.cardHeaderRow}>
                        <View style={[styles.cardIconBox, { backgroundColor: item.color }]}>
                          <Ionicons name={item.icon} size={20} color="#ffffff" />
                        </View>
                        <View style={[styles.arrowCircle, { backgroundColor: item.color + '15' }]}>
                          <Ionicons name="arrow-forward" size={14} color={item.color} />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={2}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroHeader: {
    paddingTop: Platform.OS === 'android' ? 44 : 10,
    paddingHorizontal: 20,
    paddingBottom: 44,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
  },
  headerUnderline: {
    width: 32,
    height: 3,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
    marginTop: 6,
  },
  headerImageContainer: {
    width: 150,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  bodyContent: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  halfCardWrapper: {
    width: '48.5%',
    marginBottom: 12,
  },
  fullCardWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 14,
    height: 140,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 14,
  },
});