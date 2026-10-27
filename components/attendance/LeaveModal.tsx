// import React, { useState, useEffect } from 'react';
// import {
//     StyleSheet,
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     Modal,
//     TouchableWithoutFeedback,
//     Keyboard,
//     Platform, 
//     Pressable,
//     Alert,
//     Image,
//     ScrollView
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import { Ionicons } from '@expo/vector-icons';
// import { useSession } from '@/context/ContextSession';
// import { API_BASE_URL } from '../../app/config/api';

// type LeaveModalProps = {
//     visible: boolean;
//     onClose: () => void;
// };

// export default function LeaveModal({ visible, onClose }: LeaveModalProps) {
//     const [reason, setReason] = useState('');
//     const [comment, setComment] = useState('');
//     const [showCalendar, setShowCalendar] = useState(false);
//     const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [dateText, setDateText] = useState('Start and end date');
//     const [markedDates, setMarkedDates] = useState({});
//     const [calendarKey, setCalendarKey] = useState(1);
//     const { sessionData } = useSession();

//     const getTodayString = () => {
//         const today = new Date();
//         return today.toISOString().split('T')[0];
//     };

//     const isDateBeforeToday = (date: any) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const compareDate = new Date(date);
//         return compareDate < today;
//     };
// const handleDayPress = (day: any) => {
//     if (isDateBeforeToday(day.dateString)) {
//         return;
//     }

//     // 1. "FROM DATE" CALENDAR: ONLY sets the start date. Does not change or create ranges.
//     if (activeDateField === 'from') {
//         setStartDate(day.dateString);
        
//         // If an end date exists and it conflicts (is before the new start date), clear it
//         if (endDate && day.dateString > endDate) {
//             setEndDate('');
//             updateMarkedDates(day.dateString, '');
//         } else {
//             // Otherwise, keep the existing To Date exactly as it was
//             updateMarkedDates(day.dateString, endDate);
//         }
        
//         setShowCalendar(false);
//         setActiveDateField(null);
        
//     // 2. "TO DATE" CALENDAR: ONLY sets the end date. Completely optional.
//     } else if (activeDateField === 'to') {
//         // If they click a To Date that is before the From Date, ignore it or reset it safely
//         if (startDate && day.dateString < startDate) {
//             // Reverts to single day by setting start date to this click and clearing to date
//             setStartDate(day.dateString);
//             setEndDate('');
//             updateMarkedDates(day.dateString, '');
//         } else {
//             // Strictly sets the To Date only
//             setEndDate(day.dateString);
//             updateMarkedDates(startDate, day.dateString);
//         }
        
//         setShowCalendar(false);
//         setActiveDateField(null);
        
//     // 3. FALLBACK
//     } else {
//         setStartDate(day.dateString);
//         updateMarkedDates(day.dateString, endDate);
//         setTimeout(() => setShowCalendar(false), 300);
//     }
// };
//         const updateMarkedDates = (start: string, end: string) => {
//             if (!start) return;
//             if (!end || start === end) {
//                 setMarkedDates({
//                     [start]: { selected: true, startingDay: true, endingDay: true, color: '#6366f1' }
//                 });
//                 setDateText(formatDate(start));
//             } else {
//                 const range = getDateRange(start, end);
//                 setMarkedDates(range);
//                 setDateText(`${formatDate(start)} - ${formatDate(end)}`);
//             }
//         };

//     const formatDate = (dateString: any) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric',
//             year: 'numeric'
//         });
//     };

//     type DateRangeValue = {
//         selected: boolean;
//         startingDay?: boolean;
//         endingDay?: boolean;
//         color: string;
//     };
//     const getDateRange = (start: any, end: any) => {
//         const range: Record<string, DateRangeValue> = {};
//         let currentDate = new Date(start);
//         const endDate = new Date(end);

//         while (currentDate <= endDate) {
//             const dateString = currentDate.toISOString().split('T')[0];

//             if (dateString === start) {
//                 range[dateString] = {
//                     selected: true,
//                     startingDay: true,
//                     color: '#6366f1'
//                 };
//             } else if (dateString === end) {
//                 range[dateString] = {
//                     selected: true,
//                     endingDay: true,
//                     color: '#6366f1'
//                 };
//             } else {
//                 range[dateString] = {
//                     selected: true,
//                     color: '#a5b4fc'
//                 };
//             }

//             currentDate.setDate(currentDate.getDate() + 1);
//         }

//         return range;
//     };

//     const resetForm = () => {
//         setReason('');
//         setComment('');
//         setStartDate('');
//         setEndDate('');
//         setDateText('Start and end date');
//         setMarkedDates({});
//         setActiveDateField(null);
//         setCalendarKey(prevKey => prevKey + 1);
//     };

//     function formatDateRange(start: string | Date, end: string | Date): string {
//         const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
//         const startFormatted = new Date(start).toLocaleDateString('en-GB', options);
//         const endFormatted = new Date(end).toLocaleDateString('en-GB', options);
//         return `${startFormatted} - ${endFormatted}`;
//     }

//         const handleSubmit = async () => {
//             if (!reason.trim()) {
//                 Alert.alert('Error', 'Please enter a reason for leave');
//                 return;
//             }

//             // HERE IS THE UPDATE: 
//             // If endDate is empty, it seamlessly uses the startDate value behind the scenes.
//             const finalEndDate = endDate || startDate;

//             const formData = new FormData();
//             formData.append('taskType', "timeOff");
//             formData.append('taskName', reason);
//             formData.append('status', "pending");
//             formData.append('teamId', sessionData?.teamId);
            
//             // It passes 'finalEndDate' here so the API receives a valid single day
//             formData.append('follow_Date', formatDateRange(startDate, finalEndDate));
//             formData.append('description', comment);
            
   
        
//         try {
//             const response = await fetch(`${API_BASE_URL}/add-holidays-list`, {
//                 method: 'POST',
//                 credentials: "include",
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//                 body: formData,
//             });
//             const result = await response.json();
//         } catch (error) {
//         }
//         resetForm();
//         onClose();
//     };

//     useEffect(() => {
//         if (!visible) {
//             resetForm();
//         }
//     }, [visible]);

//     const openCalendarFor = (field: 'from' | 'to') => {
//     setActiveDateField(field);
    
//     // Auto-select today's date ONLY if no date has been picked yet
//     if (!startDate) {
//         const todayStr = getTodayString();
//         setStartDate(todayStr);
//         setEndDate('');
//         setMarkedDates({
//             [todayStr]: { selected: true, startingDay: true, endingDay: true, color: '#6366f1' }
//         });
//         setDateText(formatDate(todayStr));
//     }
    
//     setShowCalendar(true);
// };

//     return (
//         <Modal
//             visible={visible}
//             transparent
//             animationType="slide"
//             onRequestClose={onClose}
//         >
//             <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContainer}>
                        
//                         {/* Header Bar */}
//                         <View style={styles.headerBar}>
//                             <TouchableOpacity onPress={onClose} style={styles.backButton}>
//                                 <Ionicons name="arrow-back" size={24} color="#6366f1" />
//                             </TouchableOpacity>
//                             <Text style={styles.headerTitle}>Apply Leave</Text>
//                             <View style={{ width: 24 }} />
//                         </View>

//                         {/* Scroll View for Form Content */}
//                         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            
//                             {/* Top Banner Image */}
//                             <Image 
//                                 source={require('@/assets/images/leave_illustration.png')} 
//                                 style={styles.bannerImage}
//                                 resizeMode="contain"
//                             />

//                             {/* Main Typography Block */}
//                             <View style={styles.textContainer}>
//                                 <Text style={styles.mainHeading}>Apply for Leave</Text>
//                                 <Text style={styles.subHeading}>
//                                     Request time off for rest, relaxation or personal reasons.
//                                 </Text>
//                             </View>

//                             {/* White Card Container for Form Fields */}
//                             <View style={styles.formCard}>
                                
//                                 {/* Leave Type (Reason State Mapping) Field */}
//                                 <View style={styles.inputGroup}>
//                                     <Text style={styles.label}>Leave Type</Text>
//                                     <View style={styles.inputWrapper}>
//                                         <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
//                                             <Ionicons name="calendar-outline" size={20} color="#a855f7" />
//                                         </View>
//                                         <TextInput
//                                             style={styles.input}
//                                             placeholder="Select Leave Type"
//                                             placeholderTextColor="#94a3b8"
//                                             value={reason}
//                                             onChangeText={setReason}
//                                         />
//                                         {/* <Ionicons name="chevron-down" size={20} color="#64748b" style={styles.rightChevron} /> */}
//                                     </View>
//                                 </View>

//                                 {/* From Date Field */}
//                                 <View style={styles.inputGroup}>
//                                     <Text style={styles.label}>From Date</Text>
//                                     <TouchableOpacity
//                                         style={styles.inputWrapper}
//                                         onPress={() => openCalendarFor('from')}
//                                     >
//                                         <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
//                                             <Ionicons name="calendar-outline" size={20} color="#a855f7" />
//                                         </View>
//                                         <Text style={[styles.dateText, startDate ? styles.dateTextActive : null]}>
//                                             {startDate ? formatDate(startDate) : "Select From Date"}
//                                         </Text>
//                                         <Ionicons name="calendar-clear-outline" size={20} color="#64748b" style={styles.rightChevron} />
//                                     </TouchableOpacity>
//                                 </View>

//                                 {/* To Date Field */}
//                                 <View style={styles.inputGroup}>
//                                     <Text style={styles.label}>To Date</Text>
//                                     <TouchableOpacity
//                                         style={styles.inputWrapper}
//                                         onPress={() => openCalendarFor('to')}
//                                     >
//                                         <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
//                                             <Ionicons name="calendar-outline" size={20} color="#a855f7" />
//                                         </View>
//                                         <Text style={[styles.dateText, endDate ? styles.dateTextActive : null]}>
//                                             {endDate ? formatDate(endDate) : "Select To Date (Optional)"}
//                                         </Text>
//                                         <Ionicons name="calendar-clear-outline" size={20} color="#64748b" style={styles.rightChevron} />
//                                     </TouchableOpacity>
//                                 </View>

//                                 {/* Reason/Comment Field */}
//                                 <View style={styles.inputGroup}>
//                                     <Text style={styles.label}>Reason</Text>
//                                     <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12, height: 100 }]}>
//                                         <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff', marginTop: -2 }]}>
//                                             <Ionicons name="document-text-outline" size={20} color="#a855f7" />
//                                         </View>
//                                         <TextInput
//                                             style={[styles.input, { height: '100%', textAlignVertical: 'top', paddingTop: 0 }]}
//                                             placeholder="Enter reason here..."
//                                             placeholderTextColor="#94a3b8"
//                                             value={comment}
//                                             onChangeText={setComment}
//                                             multiline
//                                             numberOfLines={4}
//                                         />
//                                     </View>
//                                 </View>
//                             </View>

//                             {/* Submit Button placed cleanly inside scrollable view */}
//                             <TouchableOpacity
//                                 style={styles.submitButton}
//                                 onPress={handleSubmit}
//                             >
//                                 <Text style={styles.submitButtonText}>Submit Request</Text>
//                             </TouchableOpacity>

//                         </ScrollView>
//                     </View>
//                 </View>
//             </TouchableWithoutFeedback>

//             {/* Calendar Modal */}
//             <Modal
//                 visible={showCalendar}
//                 animationType="slide"
//                 transparent={true}
//                 onRequestClose={() => setShowCalendar(false)}
//             >
//                 <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
//                     <View style={styles.modalBackdrop}>
//                         <Pressable onPress={() => { }} style={styles.calendarModalContent}>
//                             <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.modelCloseButton}>
//                                 <Ionicons name="close" size={24} color="white" />
//                             </TouchableOpacity>

//                             <Calendar
//                                 key={calendarKey}
//                                 minDate={getTodayString()}
//                                 markedDates={markedDates}
//                                 markingType="period"
//                                 onDayPress={handleDayPress}
//                                 theme={{
//                                     todayTextColor: '#6366f1',
//                                     selectedDayBackgroundColor: '#6366f1',
//                                     selectedDayTextColor: '#ffffff',
//                                     textDisabledColor: '#d9e1e8',
//                                     arrowColor: '#6366f1',
//                                 }}
//                             />
//                         </Pressable>
//                     </View>
//                 </TouchableWithoutFeedback>
//             </Modal>
//         </Modal>
//     );
// }

// const styles = StyleSheet.create({
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: '#f8fafc',
//     },
//     modalContainer: {
//         flex: 1,
//         backgroundColor: '#f8fafc',
//     },
//     headerBar: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 16,
//         backgroundColor: '#f8fafc',
//     },
//     backButton: {
//         padding: 4,
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#0f172a',
//         textAlign: 'center',
//     },
//     scrollContent: {
//         paddingHorizontal: 20,
//         paddingBottom: 40,
//     },
//     bannerImage: {
//         width: '100%',
//         height: 180,
//         alignSelf: 'center',
//     },
//     textContainer: {
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         marginBottom: 24,
//     },
//     mainHeading: {
//         fontSize: 24,
//         fontWeight: '800',
//         color: '#0f172a',
//         marginBottom: 6,
//         textAlign: 'center',
//     },
//     subHeading: {
//         fontSize: 14,
//         color: '#64748b',
//         textAlign: 'center',
//         lineHeight: 20,
//     },
//     formCard: {
//         backgroundColor: '#ffffff',
//         borderRadius: 24,
//         padding: 20,
//         shadowColor: '#0f172a',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.04,
//         shadowRadius: 12,
//         elevation: 2,
//         marginBottom: 24,
//     },
//     inputGroup: {
//         marginBottom: 16,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: '700',
//         marginBottom: 8,
//         color: '#0f172a',
//     },
//     inputWrapper: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#f1f5f9',
//         borderRadius: 16,
//         paddingHorizontal: 12,
//         height: 56,
//         backgroundColor: '#ffffff',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.02,
//         shadowRadius: 4,
//         elevation: 1,
//     },
//     iconContainer: {
//         width: 36,
//         height: 36,
//         borderRadius: 10,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     input: {
//         flex: 1,
//         fontSize: 14,
//         color: '#0f172a',
//         fontWeight: '500',
//     },
//     rightChevron: {
//         marginLeft: 8,
//     },
//     dateText: {
//         flex: 1,
//         fontSize: 14,
//         color: '#94a3b8',
//         fontWeight: '500',
//     },
//     dateTextActive: {
//         color: '#0f172a',
//     },
//     submitButton: {
//         backgroundColor: '#6366f1',
//         height: 54,
//         borderRadius: 16,
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#6366f1',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.2,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     submitButtonText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '700',
//     },
//     modalBackdrop: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.4)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     calendarModalContent: {
//         width: '90%',
//         backgroundColor: '#fff',
//         padding: 20,
//         borderRadius: 20,
//         elevation: 5,
//     },
//     modelCloseButton: {
//         alignSelf: 'flex-end',
//         marginBottom: 10,
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         backgroundColor: '#333',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Platform, 
    Pressable,
    Alert,
    Image,
    ScrollView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context/ContextSession';
import { API_BASE_URL } from '../../app/config/api';

// Updated to include the optional onSuccess prop mapping
type LeaveModalProps = {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => Promise<void>; 
};

export default function LeaveModal({ visible, onClose, onSuccess }: LeaveModalProps) {
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateText, setDateText] = useState('Start and end date');
    const [markedDates, setMarkedDates] = useState({});
    const [calendarKey, setCalendarKey] = useState(1);
    const { sessionData } = useSession();

    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const isDateBeforeToday = (date: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        return compareDate < today;
    };

    const handleDayPress = (day: any) => {
        if (isDateBeforeToday(day.dateString)) {
            return;
        }

        if (activeDateField === 'from') {
            setStartDate(day.dateString);
            if (endDate && day.dateString > endDate) {
                setEndDate('');
                updateMarkedDates(day.dateString, '');
            } else {
                updateMarkedDates(day.dateString, endDate);
            }
            setShowCalendar(false);
            setActiveDateField(null);
        } else if (activeDateField === 'to') {
            if (startDate && day.dateString < startDate) {
                setStartDate(day.dateString);
                setEndDate('');
                updateMarkedDates(day.dateString, '');
            } else {
                setEndDate(day.dateString);
                updateMarkedDates(startDate, day.dateString);
            }
            setShowCalendar(false);
            setActiveDateField(null);
        } else {
            setStartDate(day.dateString);
            updateMarkedDates(day.dateString, endDate);
            setTimeout(() => setShowCalendar(false), 300);
        }
    };

    const updateMarkedDates = (start: string, end: string) => {
        if (!start) return;
        if (!end || start === end) {
            setMarkedDates({
                [start]: { selected: true, startingDay: true, endingDay: true, color: '#6366f1' }
            });
            setDateText(formatDate(start));
        } else {
            const range = getDateRange(start, end);
            setMarkedDates(range);
            setDateText(`${formatDate(start)} - ${formatDate(end)}`);
        }
    };

    const formatDate = (dateString: any) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    type DateRangeValue = {
        selected: boolean;
        startingDay?: boolean;
        endingDay?: boolean;
        color: string;
    };

    const getDateRange = (start: any, end: any) => {
        const range: Record<string, DateRangeValue> = {};
        let currentDate = new Date(start);
        const endDateObj = new Date(end);

        while (currentDate <= endDateObj) {
            const dateString = currentDate.toISOString().split('T')[0];

            if (dateString === start) {
                range[dateString] = { selected: true, startingDay: true, color: '#6366f1' };
            } else if (dateString === end) {
                range[dateString] = { selected: true, endingDay: true, color: '#6366f1' };
            } else {
                range[dateString] = { selected: true, color: '#a5b4fc' };
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return range;
    };

    const resetForm = () => {
        setReason('');
        setComment('');
        setStartDate('');
        setEndDate('');
        setDateText('Start and end date');
        setMarkedDates({});
        setActiveDateField(null);
        setCalendarKey(prevKey => prevKey + 1);
    };

    function formatDateRange(start: string | Date, end: string | Date): string {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
        const startFormatted = new Date(start).toLocaleDateString('en-GB', options);
        const endFormatted = new Date(end).toLocaleDateString('en-GB', options);
        return `${startFormatted} - ${endFormatted}`;
    }

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Error', 'Please enter a reason for leave');
            return;
        }
        if (!startDate) {
            Alert.alert('Error', 'Please select at least a start date');
            return;
        }

        const finalEndDate = endDate || startDate;
        const formData = new FormData();
        formData.append('taskType', "timeOff");
        formData.append('taskName', reason);
        formData.append('status', "pending");
        formData.append('teamId', sessionData?.teamId || '');
        formData.append('follow_Date', formatDateRange(startDate, finalEndDate));
        formData.append('description', comment);
        
        try {
            const response = await fetch(`${API_BASE_URL}/add-holidays-list`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            
            if (response.ok) {
                // If the submission succeeds, fire the async callback to refresh metrics on parent UI
                if (onSuccess) {
                    await onSuccess();
                }
            }
        } catch (error) {
            console.error("Failed to submit leave request:", error);
        }
        
        resetForm();
        onClose();
    };

    useEffect(() => {
        if (!visible) {
            resetForm();
        }
    }, [visible]);

    const openCalendarFor = (field: 'from' | 'to') => {
        setActiveDateField(field);
        if (!startDate) {
            const todayStr = getTodayString();
            setStartDate(todayStr);
            setEndDate('');
            setMarkedDates({
                [todayStr]: { selected: true, startingDay: true, endingDay: true, color: '#6366f1' }
            });
            setDateText(formatDate(todayStr));
        }
        setShowCalendar(true);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        
                        {/* Header Bar */}
                        <View style={styles.headerBar}>
                            <TouchableOpacity onPress={onClose} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#6366f1" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Apply Leave</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Scroll View for Form Content */}
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            
                            {/* Top Banner Image */}
                            <Image 
                                source={require('@/assets/images/leave_illustration.png')} 
                                style={styles.bannerImage}
                                resizeMode="contain"
                            />

                            {/* Main Typography Block */}
                            <View style={styles.textContainer}>
                                <Text style={styles.mainHeading}>Apply for Leave</Text>
                                <Text style={styles.subHeading}>
                                    Request time off for rest, relaxation or personal reasons.
                                </Text>
                            </View>

                            {/* White Card Container for Form Fields */}
                            <View style={styles.formCard}>
                                
                                {/* Leave Type Field */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Leave Type</Text>
                                    <View style={styles.inputWrapper}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                                            <Ionicons name="calendar-outline" size={20} color="#a855f7" />
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Select Leave Type"
                                            placeholderTextColor="#94a3b8"
                                            value={reason}
                                            onChangeText={setReason}
                                        />
                                    </View>
                                </View>

                                {/* From Date Field */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>From Date</Text>
                                    <TouchableOpacity
                                        style={styles.inputWrapper}
                                        onPress={() => openCalendarFor('from')}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                                            <Ionicons name="calendar-outline" size={20} color="#a855f7" />
                                        </View>
                                        <Text style={[styles.dateText, startDate ? styles.dateTextActive : null]}>
                                            {startDate ? formatDate(startDate) : "Select From Date"}
                                        </Text>
                                        <Ionicons name="calendar-clear-outline" size={20} color="#64748b" style={styles.rightChevron} />
                                    </TouchableOpacity>
                                </View>

                                {/* To Date Field */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>To Date</Text>
                                    <TouchableOpacity
                                        style={styles.inputWrapper}
                                        onPress={() => openCalendarFor('to')}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
                                            <Ionicons name="calendar-outline" size={20} color="#a855f7" />
                                        </View>
                                        <Text style={[styles.dateText, endDate ? styles.dateTextActive : null]}>
                                            {endDate ? formatDate(endDate) : "Select To Date (Optional)"}
                                        </Text>
                                        <Ionicons name="calendar-clear-outline" size={20} color="#64748b" style={styles.rightChevron} />
                                    </TouchableOpacity>
                                </View>

                                {/* Reason/Comment Field */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Reason</Text>
                                    <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12, height: 100 }]}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff', marginTop: -2 }]}>
                                            <Ionicons name="document-text-outline" size={20} color="#a855f7" />
                                        </View>
                                        <TextInput
                                            style={[styles.input, { height: '100%', textAlignVertical: 'top', paddingTop: 0 }]}
                                            placeholder="Enter reason here..."
                                            placeholderTextColor="#94a3b8"
                                            value={comment}
                                            onChangeText={setComment}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>Submit Request</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* Calendar Modal */}
            <Modal
                visible={showCalendar}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCalendar(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
                    <View style={styles.modalBackdrop}>
                        <Pressable onPress={() => { }} style={styles.calendarModalContent}>
                            <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.modelCloseButton}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>

                            <Calendar
                                key={calendarKey}
                                minDate={getTodayString()}
                                markedDates={markedDates}
                                markingType="period"
                                onDayPress={handleDayPress}
                                theme={{
                                    todayTextColor: '#6366f1',
                                    selectedDayBackgroundColor: '#6366f1',
                                    selectedDayTextColor: '#ffffff',
                                    textDisabledColor: '#d9e1e8',
                                    arrowColor: '#6366f1',
                                }}
                            />
                        </Pressable>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: '#f8fafc' },
    modalContainer: { flex: 1, backgroundColor: '#f8fafc' },
    headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#f8fafc' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    bannerImage: { width: '100%', height: 180, alignSelf: 'center' },
    textContainer: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
    mainHeading: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 6, textAlign: 'center' },
    subHeading: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
    formCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 12, height: 56, backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    iconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    input: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
    rightChevron: { marginLeft: 8 },
    dateText: { flex: 1, fontSize: 14, color: '#94a3b8', fontWeight: '500' },
    dateTextActive: { color: '#0f172a' },
    submitButton: { backgroundColor: '#6366f1', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    calendarModalContent: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5 },
    modelCloseButton: { alignSelf: 'flex-end', marginBottom: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
});