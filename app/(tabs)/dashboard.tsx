"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar, 
  Platform, 
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { format } from "date-fns"
import Svg, { G, Circle } from "react-native-svg"
import LeaveModal from "@/components/attendance/LeaveModal"
import { API_BASE_URL } from '@/app/config/api'; 

import DashboardHomeImg from "@/assets/images/DashboardHome.png"

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DashboardData {
  employeeName: string;
  avatarUrl: string;
  todayLog: {
    checkIn: string;
    checkOut: string;
    workingHours: string;
    status: string;
  };
  summary: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
    totalDays: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    dateStr: string;
    dayNum: string;
    monthStr: string;
    type: "Event" | "Holiday" | "Update";
    typeColor: string;
  }>;
}

const parseWorkHoursToNumeric = (hoursStr: string | null | undefined): number => {
  if (!hoursStr || hoursStr.trim() === "-" || hoursStr.includes("--")) return 0;
  const cleaned = hoursStr.toLowerCase().trim();
  let totalHours = 0;
  if (cleaned.includes("hour") || cleaned.includes("minute")) {
    const hourMatch = cleaned.match(/(\d+)\s*hour/);
    const minuteMatch = cleaned.match(/(\d+)\s*minute/);
    if (hourMatch) totalHours += parseInt(hourMatch[1], 10);
    if (minuteMatch) totalHours += parseInt(minuteMatch[1], 10) / 60;
    return totalHours;
  }
  const shorthandMatch = cleaned.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/);
  if (shorthandMatch) {
    if (shorthandMatch[1]) totalHours += parseInt(shorthandMatch[1], 10);
    if (shorthandMatch[2]) totalHours += parseInt(shorthandMatch[2], 10) / 60;
  }
  return totalHours;
};

const parseDashboardCustomDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  try {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const shortMonth = parts[1].toLowerCase();
    const rawYear = parseInt(parts[2], 10);

    // Convert 2-digit year ("26") to 4-digit year (2026)
    const fullYear = parts[2].length <= 2 ? 2000 + rawYear : rawYear;

    const monthsMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const monthIndex = monthsMap[shortMonth.substring(0, 3)];
    if (monthIndex === undefined || isNaN(day) || isNaN(fullYear)) return null;

    return new Date(fullYear, monthIndex, day);
  } catch (e) {
    return null;
  }
};

export default function DashboardScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [profilePicId, setProfilePicId] = useState<string>("")
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')
  
  // Navigation Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    leave: false,
    timeAttendance: true, // Opened by default based on image 1
    payroll: false
  })
  
  const [data, setData] = useState<DashboardData>({
    employeeName: "Employee",
    avatarUrl: "",
    todayLog: { checkIn: "--:--", checkOut: "--:--", workingHours: "00h 00m", status: "-" },
    summary: { present: 0, absent: 0, leave: 0, halfDay: 0, totalDays: 0 },
    upcomingEvents: []
  })

  // Accordion toggle handler
  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }))
  }

  // Helper handling sidebar routing & closing the drawer
  const navigateToRoute = (path:any) => {
    setIsSidebarOpen(false);
    router.push(path);
  }

 const fetchDashboardData = async (forcedProfileName: string) => {
  try {
    console.log("[DEBUG] Starting fetchDashboardData with passed profile name:", forcedProfileName);

    // 1. Fetch Attendance History
    const response = await fetch(`${API_BASE_URL}/fetch-my-attendance-history-mobile`, {
      credentials: 'include',
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // 2. Fetch Time-Off / Leave Requests
    let leaveHistoryArr: any[] = [];
    try {
      const leaveResponse = await fetch(`${API_BASE_URL}/my-time-off-request-list-mobile`, {
        credentials: 'include',
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (leaveResponse.ok) {
        const rawLeaveText = await leaveResponse.text();
        if (!rawLeaveText.trim().startsWith('<')) {
          const leaveData = JSON.parse(rawLeaveText);
          leaveHistoryArr = leaveData.offRequests || leaveData.data || leaveData.leaves || [];
        }
      }
    } catch (err) {
      console.log("[DEBUG] Error checking dashboard leave endpoints:", err);
    }

    if (!response.ok) {
      Alert.alert("Execution Error", "Failed to compile records.");
      return;
    }

    const rawAttendanceText = await response.text();
    if (rawAttendanceText.trim().startsWith('<')) {
      Alert.alert("Session Sync Error", "Server redirected to a web layout view.");
      return;
    }

    const dataPayload = JSON.parse(rawAttendanceText);
    const history = dataPayload.attendanceHistory || dataPayload.history || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let finalizedName = forcedProfileName?.trim() || "Employee";

    // 3. Define Selected Timeframe Date Bounds
    let startDate = new Date();
    let endDate = new Date();

    if (timeframe === 'week') {
      const currentDay = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (timeframe === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (timeframe === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // 4. Flexible Date Parsing Helper
    const parseFlexibleDate = (dateStr: string): Date | null => {
      if (!dateStr || typeof dateStr !== 'string') return null;
      
      // Handle "DD MMM YYYY" or "DD MMM YY" (e.g., "15 Mar 26")
      if (dateStr.includes(' ')) {
        return parseDashboardCustomDate(dateStr);
      }
      
      // Handle standard ISO or slash formats
      if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts[0].length === 4) { // YYYY/MM/DD
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } // DD/MM/YYYY
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }

      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // 5. Pre-parse Approved Leaves Ranges
    const approvedLeaveRanges: Array<{ start: Date; end: Date }> = [];

    leaveHistoryArr.forEach((item: any) => {
      const leaveStatus = (item.status || item.approveStatus || item.approval_status || "").toLowerCase();
      const isApproved = leaveStatus === "approved" || leaveStatus === "leave" || leaveStatus.includes("approved");

      if (isApproved) {
        const targetFromStr = item.from_Follow_Date || item.fromDate || item.from_date || item.start_date;
        const targetToStr = item.to_Follow_Date || item.toDate || item.to_date || item.end_date || targetFromStr;

        if (targetFromStr) {
          const start = parseFlexibleDate(targetFromStr);
          const end = targetToStr ? parseFlexibleDate(targetToStr) : start;

          if (start && end) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            approvedLeaveRanges.push({ start, end });
          }
        }
      }
    });

    // Helper to check if a target date falls inside any approved leave window
    const isDateInApprovedLeaves = (targetDate: Date): boolean => {
      const checkTime = new Date(targetDate);
      checkTime.setHours(12, 0, 0, 0); // Normalized mid-day check
      return approvedLeaveRanges.some(
        range => checkTime >= range.start && checkTime <= range.end
      );
    };

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let halfDayCount = 0;

    const recordedDatesSet = new Set<string>();

   // 6. Process Records from Main Attendance Endpoint (Safe Matcher)
const processedDatesMap = new Map<string, any>();

// Deduplicate by date so double records don't inflate counts
history.forEach((entry: any) => {
  const recordDate = parseFlexibleDate(entry.date);
  if (!recordDate) return;
  const dateKey = `${recordDate.getFullYear()}-${recordDate.getMonth() + 1}-${recordDate.getDate()}`;
  
  if (!processedDatesMap.has(dateKey)) {
    processedDatesMap.set(dateKey, entry);
  } else {
    const existing = processedDatesMap.get(dateKey);
    const existingHours = parseWorkHoursToNumeric(existing.work_hours);
    const currentHours = parseWorkHoursToNumeric(entry.work_hours);
    if (currentHours > existingHours || (entry.start_time && entry.start_time !== "-")) {
      processedDatesMap.set(dateKey, entry);
    }
  }
});

processedDatesMap.forEach((realEntry, dateKey) => {
  const recordDate = parseFlexibleDate(realEntry.date);
  if (!recordDate) return;
  recordDate.setHours(0, 0, 0, 0);

  if (recordDate >= startDate && recordDate <= endDate) {
    recordedDatesSet.add(dateKey);

    const statusStr = (realEntry.status || realEntry.approveStatus || realEntry.attendance_status || "").toString().toLowerCase().trim();
    const hasStartTime = realEntry.start_time && !["-", "--:--", "", "null", "undefined"].includes(realEntry.start_time.trim());
    const hasEndTime = realEntry.end_time && !["-", "--:--", "", "null", "undefined"].includes(realEntry.end_time.trim());
    const numericHours = parseWorkHoursToNumeric(realEntry.work_hours);
    const dayOfWeek = recordDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check 1: Explicit Absent
    if (statusStr === "absent" || statusStr === "a") {
      absentCount++;
    }
    // Check 2: Leave (from backend status or approved leave list)
    else if (
      statusStr.includes("leave") || 
      statusStr.includes("approved") || 
      statusStr === "l" ||
      isDateInApprovedLeaves(recordDate)
    ) {
      leaveCount++;
    }
    // Check 3: Half Day
    else if (statusStr.includes("half") || statusStr === "hd" || (numericHours > 0 && numericHours < 4)) {
      halfDayCount++;
    }
    // Check 4: Present
    // Matches if status says present/active/P OR if valid check-in time exists OR work_hours > 0
    else if (
      statusStr.includes("present") || 
      statusStr.includes("active") || 
      statusStr === "p" ||
      hasStartTime ||
      hasEndTime ||
      numericHours > 0
    ) {
      presentCount++;
    }
    // Check 5: Fallback for empty records on weekdays
    else if (!isWeekend) {
      absentCount++;
    }
  }
});

    // 7. Process Missing Days up to Today
    let iterDate = new Date(startDate);
    const checkLimitDate = today < endDate ? today : endDate;

    while (iterDate <= checkLimitDate) {
      const dayOfWeek = iterDate.getDay();
      const dateKey = `${iterDate.getFullYear()}-${iterDate.getMonth() + 1}-${iterDate.getDate()}`;
      const hasRecord = recordedDatesSet.has(dateKey);

      if (!hasRecord) {
        // Evaluate if missing day was on an approved leave
        if (isDateInApprovedLeaves(iterDate)) {
          leaveCount++;
        } else if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Saturday (6) & Sunday (0)
          absentCount++;
        }
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }

    // 8. Determine Today's Status Log Card
    let todayLog = { checkIn: "--:--", checkOut: "--:--", workingHours: "00h 00m", status: "Absent" };
    const todayFormatted = format(new Date(), "dd/MM/yyyy");
    const todayRecord = history.find((item: any) => item.date === todayFormatted);

    const isTodayOnLeave = isDateInApprovedLeaves(new Date());

    if (todayRecord) {
      todayLog = {
        checkIn: todayRecord.start_time && todayRecord.start_time !== "-" ? todayRecord.start_time.substring(0, 5) : "--:--",
        checkOut: todayRecord.end_time && todayRecord.end_time !== "-" ? todayRecord.end_time.substring(0, 5) : "--:--",
        workingHours: todayRecord.work_hours && todayRecord.work_hours !== "-" ? todayRecord.work_hours : "00h 00m",
        status: todayRecord.start_time && (!todayRecord.end_time || todayRecord.end_time === "-") ? "Active" : "Present"
      };
    } else if (isTodayOnLeave) {
      todayLog.status = "On Leave";
    } else {
      const standardDay = new Date().getDay();
      todayLog.status = (standardDay === 0 || standardDay === 6) ? "Weekend" : "Absent";
    }

    const totalCalculatedDays = presentCount + absentCount + leaveCount + halfDayCount;

    setData(prev => ({
      ...prev,
      employeeName: finalizedName,
      todayLog: todayLog,
      summary: {
        present: presentCount,
        absent: absentCount,
        leave: leaveCount,
        halfDay: halfDayCount,
        totalDays: totalCalculatedDays
      }
    }));

  } catch (error) {
    console.error("[DEBUG] Dashboard engine major breakdown error:", error);
  }
};

  useEffect(() => {
    const prepareDashboard = async () => {
      setLoading(true);
      let officialName = "";
      
      try {
        const response = await fetch(`${API_BASE_URL}/setting-mobile`, { 
          credentials: 'include',
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const settingTypeHeader = response.headers.get("content-type");
        if (settingTypeHeader && settingTypeHeader.includes("text/html")) {
          const rawSettingHtml = await response.clone().text();
          console.log("=== [CRITICAL ERROR] SETTING ENDPOINT RETURNED HTML ===");
          console.log(rawSettingHtml.slice(0, 1500));
          console.log("=======================================================");
        }
        
        if (response.ok) {
          const rawSettingText = await response.text();
          if (!rawSettingText.trim().startsWith('<')) {
            const resBody = JSON.parse(rawSettingText);
            
            const targetPic = resBody.userObj?.profile_pic || resBody.profileData?.profile_pic || resBody.profile_pic || "";
            if (targetPic) {
              setProfilePicId(targetPic);
            }
            
            const realName = 
              resBody.userObj?.name ||
              (resBody.userObj?.firstName && resBody.userObj?.lastName ? `${resBody.userObj.firstName} ${resBody.userObj.lastName}` : "") ||
              resBody.userObj?.firstName ||
              resBody.profileData?.employeeName || 
              resBody.profileData?.name || 
              resBody.employeeName || 
              resBody.name || 
              "";
              
            if (realName && realName.toLowerCase() !== "onleave" && realName.toLowerCase() !== "absent") {
              officialName = realName.replace(/\b\w/g, (char: string) => char.toUpperCase());
            }
          }
        }
      } catch (err) {
        console.log("[DEBUG] Error syncing profile avatar payload maps:", err);
      }
      
      await fetchDashboardData(officialName);
      setLoading(false);
    };

    prepareDashboard();
  }, [timeframe])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b52f6" />
        <Text style={styles.loadingText}>Syncing Database Records...</Text>
      </View>
    )
  }

  const total = data.summary.totalDays || 1
  const presentPct = (data.summary.present / total) * 100
  const absentPct = (data.summary.absent / total) * 100
  const leavePct = (data.summary.leave / total) * 100
  const halfDayPct = (data.summary.halfDay / total) * 100
  
  const radius: number = 40;
  const strokeWidth: number = 10;
  const circumference: number = 2 * Math.PI * radius;

  const presentFraction = data.summary.present / total;
  const halfDayFraction = data.summary.halfDay / total;
  const leaveFraction   = data.summary.leave / total;

  const presentOffset = circumference * (1 - presentFraction);
  const halfDayOffset = circumference * (1 - (presentFraction + halfDayFraction));
  const leaveOffset   = circumference * (1 - (presentFraction + halfDayFraction + leaveFraction));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour === 12) return "Good Noon";
    if (hour > 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false}  />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => setIsSidebarOpen(true)}>
          <Feather name="menu" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRightGroup} />
      </View>

      {/* --- SIDEBAR DRAWER OVERLAY --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSidebarOpen}
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          {/* Dismiss Layer Touch */}
          <TouchableOpacity 
            style={styles.drawerCloseTapArea} 
            activeOpacity={1} 
            onPress={() => setIsSidebarOpen(false)} 
          />
          
          {/* Main Navigation Panel */}
          <View style={styles.drawerContentContainer}>
            <View style={styles.drawerBrandSection}>
              <Text style={styles.brandTitleText}>Hdfc Bank</Text>
              <Text style={styles.brandSubtitleText}>
                <Feather name="briefcase" size={14} /> Workplace
              </Text>
            </View>

            <ScrollView style={styles.drawerScrollableMenu} showsVerticalScrollIndicator={false}>
              {/* Home Link */}
              <TouchableOpacity style={styles.menuItemRow} onPress={() => navigateToRoute("/dashboard")}>
                <Feather name="home" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Home</Text>
              </TouchableOpacity>

              {/* Leave Accordion */}
              <TouchableOpacity style={styles.menuItemRow} onPress={() => toggleSubmenu('leave')}>
                <Feather name="calendar" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Leave</Text>
                <Feather name={expandedMenus.leave ? "chevron-up" : "chevron-down"} size={16} color="#ffffff" />
              </TouchableOpacity>

              {expandedMenus.leave && (
                <View style={styles.nestedSubmenuBlock}>
                  
                  {/* 💡 UPDATED THIS BUTTON BELOW TO MATCH QUICK ACTIONS */}
                  <TouchableOpacity 
                    style={styles.subMenuItemRow} 
                    onPress={() => {
                      setIsSidebarOpen(false);   // 1. Close the sidebar menu drawer
                      setModalVisible(true);     // 2. Open the Apply Leave Modal exactly like quick actions
                    }}
                  >
                    <Text style={styles.subMenuItemLabelText}>Apply Leave</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.subMenuItemRow} onPress={() => navigateToRoute("/attendance/leave")}>
                    <Text style={styles.subMenuItemLabelText}>Leave History</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Time & Attendance Accordion */}
              <TouchableOpacity 
                style={[styles.menuItemRow, expandedMenus.timeAttendance && styles.activeActiveMenuBg]} 
                onPress={() => toggleSubmenu('timeAttendance')}
              >
                <Feather name="clock" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Time & Attendance</Text>
                <Feather name={expandedMenus.timeAttendance ? "chevron-up" : "chevron-down"} size={16} color="#ffffff" />
              </TouchableOpacity>
              {expandedMenus.timeAttendance && (
                <View style={styles.nestedSubmenuBlock}>
                  <TouchableOpacity style={styles.subMenuItemRow} onPress={() => navigateToRoute("/attendance")}>
                    <Feather name="check-square" size={14} color="#ffffff" style={{marginRight: 8}} />
                    <Text style={styles.subMenuItemLabelText}>Check-ins</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.subMenuItemRow} onPress={() => navigateToRoute("/(tabs)/regularization")}>
                    <Feather name="edit" size={14} color="#ffffff" style={{marginRight: 8}} />
                    <Text style={styles.subMenuItemLabelText}>Regularization</Text>
                  </TouchableOpacity>
                
                </View>
              )}

              <TouchableOpacity 
                style={[styles.menuItemRow, expandedMenus.workshift && styles.activeActiveMenuBg]}  
                onPress={() => navigateToRoute("/workshift/shifts")}
              >
                <Feather name="users" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Work Shifts</Text>
              </TouchableOpacity>
             
              {/* Payroll Accordion */}
              <TouchableOpacity 
                style={[styles.menuItemRow, expandedMenus.payroll && styles.activeActiveMenuBg]} 
                onPress={() => toggleSubmenu('payroll')}
              >
                <Feather name="credit-card" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Payroll</Text>
                <Feather name={expandedMenus.payroll ? "chevron-up" : "chevron-down"} size={16} color="#ffffff" />
              </TouchableOpacity>
              {expandedMenus.payroll && (
                <View style={styles.nestedSubmenuBlock}>
                  <TouchableOpacity style={styles.subMenuItemRow} onPress={() => navigateToRoute("/payslip")}>
                    <Feather name="dollar-sign" size={14} color="#ffffff" style={{marginRight: 8}} />
                    <Text style={styles.subMenuItemLabelText}>Salary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.subMenuItemRow} onPress={() => navigateToRoute("/payslip/allPayslips")}>
                    <Feather name="file-text" size={14} color="#ffffff" style={{marginRight: 8}} />
                    <Text style={styles.subMenuItemLabelText}>Payslips</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* HR-Letter Accordion */}
                <TouchableOpacity 
                style={[styles.menuItemRow, expandedMenus.hrLetter && styles.activeActiveMenuBg]}  
                onPress={() => navigateToRoute("/HR-Letters/HRLettersOverviewScreen")}
              >
                <Feather name="mail" size={18} color="#ffffff" style={styles.menuIconPadding} />
                
                <Text style={styles.menuItemLabelText}>HR Letters</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.menuItemRow} onPress={() => navigateToRoute("/it-helpdesk")}>
                <Feather name="database" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>IT Helpdesk</Text>
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.menuItemRow} onPress={() => navigateToRoute("/hr-helpdesk/HRHelpdeskScreen")}>
                <Feather name="smile" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>HR Helpdesk</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItemRow} onPress={() => navigateToRoute("/(tabs)/expenses")}>
                <Feather name="file-minus" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Expenses</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.menuItemRow} onPress={() => navigateToRoute("/company-assets")}>
                <Feather name="package" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Company Assets</Text>
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.menuItemRow} onPress={() => navigateToRoute("/profile")}>
                <Feather name="user" size={18} color="#ffffff" style={styles.menuIconPadding} />
                <Text style={styles.menuItemLabelText}>Profile</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- CONTENT MAIN BLOCK --- */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        
        {/* --- WELCOME HERO --- */}
        <View style={styles.welcomeHeroCard}>
          <View style={styles.heroTextFrame}>
            <Text style={styles.heroSalutation}>
              {getGreeting()}👋, {data?.employeeName || "User"} 
            </Text>
            <Text style={styles.heroHeading}>Welcome Back!</Text>
            <Text style={styles.heroSubtitle}>Have a productive day ahead.</Text>
          </View>
          <Image source={DashboardHomeImg} style={styles.heroImg} resizeMode="contain" />
        </View>

        {/* --- ATTENDANCE SUMMARY HEADER WITH CHIP TOGGLES --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {timeframe === 'week' ? 'Weekly' : timeframe === 'month' ? 'Monthly' : 'Yearly'} Summary
          </Text>
          
          <View style={styles.timeframeButtonContainer}>
            <TouchableOpacity 
              onPress={() => setTimeframe('week')} 
              style={[styles.timeframeChip, timeframe === 'week' && styles.timeframeChipActive]}
            >
              <Text style={[styles.timeframeChipText, timeframe === 'week' && styles.timeframeChipTextActive]}>Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setTimeframe('month')} 
              style={[styles.timeframeChip, timeframe === 'month' && styles.timeframeChipActive]}
            >
              <Text style={[styles.timeframeChipText, timeframe === 'month' && styles.timeframeChipTextActive]}>Month</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setTimeframe('year')} 
              style={[styles.timeframeChip, timeframe === 'year' && styles.timeframeChipActive]}
            >
              <Text style={[styles.timeframeChipText, timeframe === 'year' && styles.timeframeChipTextActive]}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- COUNTER GRID CELLS --- */}
        <View style={styles.metricStatsRow}>
          <View style={styles.metricItemBlock}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Feather name="calendar" size={18} color="#10b981" />
            </View>
            <Text style={styles.metricCountText}>{data.summary.present}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#10b981' }]}>Present</Text>
          </View>
          <View style={styles.metricItemBlock}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
              <Feather name="users" size={18} color="#ef4444" />
            </View>
            <Text style={styles.metricCountText}>{data.summary.absent}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#ef4444' }]}>Absent</Text>
          </View>
          <View style={styles.metricItemBlock}>
            <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
              <Feather name="user" size={18} color="#6366f1" />
            </View>
            <Text style={styles.metricCountText}>{data.summary.leave}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#6366f1' }]}>On Leave</Text>
          </View>
          <View style={[styles.metricItemBlock, { borderRightWidth: 0 }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff7ed' }]}>
              <Feather name="clock" size={18} color="#ff7a00" />
            </View>
            <Text style={styles.metricCountText}>{data.summary.halfDay}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#ff7a00' }]}>Half Day</Text>
          </View>
        </View>

        {/* --- TODAY'S LOGS --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Today's Log Details</Text>
          <TouchableOpacity onPress={() => router.push("/attendance")} style={styles.textActionLink}>
            <Text style={styles.actionLinkText}>View Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionWrapperCard}>
          <View style={styles.logGridRow}>
            <View style={styles.logDetailBlockCell}>
              <View style={[styles.logIconWrapper, { backgroundColor: '#e6f4ea' }]}>
                <Feather name="check-circle" size={16} color="#10b981" />
              </View>
              <Text style={styles.logMetaLabel}>Check In</Text>
              <Text style={styles.logMetaValue}>{data.todayLog.checkIn}</Text>
            </View>

            <View style={styles.logDetailBlockCell}>
              <View style={[styles.logIconWrapper, { backgroundColor: '#fce8e6' }]}>
                <Feather name="log-out" size={16} color="#ef4444" />
              </View>
              <Text style={styles.logMetaLabel}>Check Out</Text>
              <Text style={styles.logMetaValue}>{data.todayLog.checkOut}</Text>
            </View>

            <View style={styles.logDetailBlockCell}>
              <View style={[styles.logIconWrapper, { backgroundColor: '#e8eaf6' }]}>
                <Feather name="watch" size={16} color="#3f51b5" />
              </View>
              <Text style={styles.logMetaLabel}>Working Hours</Text>
              <Text style={styles.logMetaValue}>{data.todayLog.workingHours}</Text>
            </View>

            <View style={styles.logDetailBlockCell}>
              {(() => {
                let dynamicStatus = data.todayLog.status || "Absent";
                let statusColor = "#ef4444"; 
                let bgColor = "#fef2f2";
                let iconName: React.ComponentProps<typeof Feather>['name'] = "info";
                
                if (dynamicStatus === "Active") {
                  statusColor = "#3b82f6"; 
                  bgColor = "#eff6ff";
                  iconName = "activity";
                } else if (dynamicStatus === "Present") {
                  statusColor = "#10b981"; 
                  bgColor = "#f0fdf4";
                  iconName = "check-circle";
                } else if (dynamicStatus === "Half Day") {
                  statusColor = "#ff7a00"; 
                  bgColor = "#fff7ed";
                  iconName = "clock";
                } else if (dynamicStatus === "On Leave") {
                  statusColor = "#6366f1"; 
                  bgColor = "#e0e7ff";
                  iconName = "user-check";
                } else if (dynamicStatus === "Weekend") {
                  statusColor = "#64748b";
                  bgColor = "#f1f5f9";
                  iconName = "calendar";
                } else {
                  dynamicStatus = "Absent";
                  statusColor = "#ef4444";
                  bgColor = "#fef2f2";
                  iconName = "alert-circle";
                }

                return (
                  <>
                    <View style={[styles.logIconWrapper, { backgroundColor: bgColor }]}>
                      <Feather name={iconName} size={16} color={statusColor} />
                    </View>
                    <Text style={styles.logMetaLabel}>Status</Text>
                    <Text style={[styles.logMetaValue, { fontWeight: '700', color: statusColor }]}>
                      {dynamicStatus}
                    </Text>
                  </>
                );
              })()}
            </View>
          </View>
        </View>

        {/* --- ATTENDANCE SUMMARY DONUT CHART --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            This {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}'s Analytics
          </Text>
          <TouchableOpacity style={styles.textActionLink}>
            <Text style={styles.actionLinkText}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartFlexPanelCard}>
          <View style={styles.circleChartWrapper}>
            <View style={styles.svgContainer}>
              <Svg width="100" height="100" viewBox="0 0 100 100">
                <G rotation="-90" origin="50, 50">
                  <Circle 
                    cx="50" 
                    cy="50" 
                    r={radius} 
                    fill="transparent" 
                    stroke="#ef4444" 
                    strokeWidth={strokeWidth} 
                  />
                  {data.summary.leave > 0 && (
                    <Circle 
                      cx="50" 
                      cy="50" 
                      r={radius} 
                      fill="transparent" 
                      stroke="#6366f1" 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={circumference} 
                      strokeDashoffset={leaveOffset} 
                    />
                  )}
                  {data.summary.halfDay > 0 && (
                    <Circle 
                      cx="50" 
                      cy="50" 
                      r={radius} 
                      fill="transparent" 
                      stroke="#ff7a00" 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={circumference} 
                      strokeDashoffset={halfDayOffset} 
                    />
                  )}
                  {data.summary.present > 0 && (
                    <Circle 
                      cx="50" 
                      cy="50" 
                      r={radius} 
                      fill="transparent" 
                      stroke="#10b981" 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={circumference} 
                      strokeDashoffset={presentOffset} 
                    />
                  )}
                </G>
              </Svg>
              <View style={styles.circleInnerCenterMask}>
                <Text style={styles.radialGraphCenterNumber}>{data.summary.totalDays}</Text>
                <Text style={styles.radialGraphCenterSublabel}>Total Days</Text>
              </View>
            </View>

            <View style={styles.chartLegendGridList}>
              <View style={styles.chartLegendItemRow}>
                <View style={[styles.legendIndicatorBoxDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendLabelText}>Present</Text>
                <Text style={styles.legendValueMetricsText}>{data.summary.present} ({presentPct.toFixed(0)}%)</Text>
              </View>
              <View style={styles.chartLegendItemRow}>
                <View style={[styles.legendIndicatorBoxDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendLabelText}>Absent</Text>
                <Text style={styles.legendValueMetricsText}>{data.summary.absent} ({absentPct.toFixed(0)}%)</Text>
              </View>
              <View style={styles.chartLegendItemRow}>
                <View style={[styles.legendIndicatorBoxDot, { backgroundColor: '#6366f1' }]} />
                <Text style={styles.legendLabelText}>On Leave</Text>
                <Text style={styles.legendValueMetricsText}>{data.summary.leave} ({leavePct.toFixed(0)}%)</Text>
              </View>
              <View style={styles.chartLegendItemRow}>
                <View style={[styles.legendIndicatorBoxDot, { backgroundColor: '#ff7a00' }]} />
                <Text style={styles.legendLabelText}>Half Day</Text>
                <Text style={styles.legendValueMetricsText}>{data.summary.halfDay} ({halfDayPct.toFixed(0)}%)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- QUICK ACTIONS --- */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <View style={styles.quickActionsGridBlock}>
          <TouchableOpacity style={styles.actionGridCellButton} onPress={() => setModalVisible(true)}>
            <View style={styles.actionIconWrapperCircle}>
              <Feather name="edit-3" size={20} color="#435ffd" />
            </View>
            <Text style={styles.actionButtonLabelText}>Apply Leave</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionGridCellButton} onPress={() => router.push("/attendance")}>
            <View style={styles.actionIconWrapperCircle}>
              <Feather name="calendar" size={20} color="#435ffd" />
            </View>
            <Text style={styles.actionButtonLabelText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionGridCellButton} onPress={() => router.push("/attendance/leave")}>
            <View style={styles.actionIconWrapperCircle}>
              <Feather name="folder" size={20} color="#435ffd" />
            </View>
            <Text style={styles.actionButtonLabelText}>My Leaves</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionGridCellButton} onPress={() => router.push("/payslip/allPayslips")}>
            <View style={styles.actionIconWrapperCircle}>
              <Feather name="file-text" size={20} color="#435ffd" />
            </View>
            <Text style={styles.actionButtonLabelText}>Payslip</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <LeaveModal visible={modalVisible} onClose={() => setModalVisible(false)} />  
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  header: {
    height: 60,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerIconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  headerRightGroup: {
    width: 32, 
  },
  /* --- DRAWER NATIVE STYLES --- */
 drawerOverlay: {
  flex: 1,
  flexDirection: "row-reverse", // 👈 Places the fallback tap area directly on the right side
  backgroundColor: "rgba(15, 23, 42, 0.4)",
},
  drawerCloseTapArea: {
    flex: 1,
  },
 drawerContentContainer: {
  position: "absolute", // 👈 Locks the container into absolute coordinates
  left: 0,              // 👈 Forces the drawer to snap to the left edge
  top: 0,               // 👈 Align to the top border of the screen
  width: SCREEN_WIDTH * 0.78,
  height: "100%",
  backgroundColor: "#0a257a", 
  paddingTop: Platform.OS === "ios" ? 50 : 20,
  paddingHorizontal: 16,
},
  drawerBrandSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 10,
  },
  brandTitleText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  brandSubtitleText: {
    color: "#cbd5e1",
    fontSize: 15,
    marginTop: 16,
    fontWeight: "600",
  },
  drawerScrollableMenu: {
    flex: 1,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  activeActiveMenuBg: {
    backgroundColor: "#166534" , // Explicit blue highlights for expanded sections
  },
  menuIconPadding: {
    width: 26,
  },
  menuItemLabelText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  nestedSubmenuBlock: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 6,
    marginVertical: 2,
    paddingLeft: 12,
  },
  subMenuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subMenuItemLabelText: {
    color: "#f1f5f9",
    fontSize: 14,
  },
  /* --- MAIN CONTENT STYLES --- */
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  welcomeHeroCard: {
    backgroundColor: '#5046e5',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 110,
    marginBottom: 10,
    marginTop: 20,
  },
  heroTextFrame: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center'
  },
  heroSalutation: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  heroHeading: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  heroSubtitle: { fontSize: 11, color: '#EFF6FF', opacity: 0.8 },
  heroImg: { width: 100, height: 90, marginLeft: 8 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  timeframeButtonContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 2,
  },
  timeframeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeframeChipActive: {
    backgroundColor: "#ffffff",
  },
  timeframeChipText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  timeframeChipTextActive: {
    color: "#1e293b",
    fontWeight: "600",
  },
  metricStatsRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  metricItemBlock: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f1f5f9",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  metricCountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  metricLabelSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  textActionLink: {
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "600",
  },
  sectionWrapperCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  logGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  logDetailBlockCell: {
    width: "50%",
    padding: 8,
    alignItems: "center",
  },
  logIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logMetaLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 2,
  },
  logMetaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  chartFlexPanelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  circleChartWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  svgContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  circleInnerCenterMask: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  radialGraphCenterNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  radialGraphCenterSublabel: {
    fontSize: 9,
    color: "#64748b",
  },
  chartLegendGridList: {
    flex: 1,
    paddingLeft: 16,
  },
  chartLegendItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  legendIndicatorBoxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabelText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },
  legendValueMetricsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  quickActionsGridBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionGridCellButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    width: "23%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconWrapperCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
});