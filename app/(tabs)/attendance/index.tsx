"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { router } from "expo-router"
import LeaveModal from "@/components/attendance/LeaveModal"
import { API_BASE_URL } from '../../config/api'; 

type RealEntry = {
  date: string; 
  start_time: string;
  end_time: string;
  name: string;
  username: string;
  work_hours: string;
  status?: string;
  approveStatus?: string;
}

type LeaveEntry = {
  startDate: string; 
  endDate: string;   
  status: string;    
}

const generateAttendanceData = (month: number, year: number, realData: RealEntry[], leaveData: any[] = []) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const data = []

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cleanLeaveArray = Array.isArray(leaveData) ? leaveData : [];

  const parseBackendCustomDate = (dateStr: string): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    try {
      const parts = dateStr.trim().split(/\s+/); 
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const shortMonth = parts[1].toLowerCase();
      const fullYear = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);

      const monthsMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };

      const monthIndex = monthsMap[shortMonth.substring(0, 3)];
      if (monthIndex === undefined || isNaN(day)) return null;

      return new Date(fullYear, monthIndex, day);
    } catch (e) {
      return null;
    }
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    date.setHours(0, 0, 0, 0)
    const dayOfWeek = date.getDay()

    const abbrevDay = dayNames[dayOfWeek].substring(0, 3)
    const dateString = `${day} ${monthNames[month - 1].substring(0, 3)}`
    
    const paddedDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
    const unpaddedDate = `${day}/${month}/${year}`

    const realEntry = realData.find((item: RealEntry) => 
      item.date === paddedDate || item.date === unpaddedDate
    )

    let status = "-"
    const checkIn = realEntry && realEntry.start_time !== "-" ? realEntry.start_time : ""
    const checkOut = realEntry && realEntry.end_time !== "-" ? realEntry.end_time : ""
    const hours = realEntry && realEntry.work_hours !== "-" ? realEntry.work_hours : ""
    
    const isDateOnApprovedLeave = cleanLeaveArray.some((item) => {
      const leaveStatus = (item.status || "").toLowerCase();
      const isApproved = leaveStatus === "approved" || leaveStatus === "leave" || leaveStatus.includes("approved");
      
      if (!isApproved) return false;

      const targetFromStr = item.from_Follow_Date || item.startDate;
      const targetToStr = item.to_Follow_Date || item.endDate || targetFromStr;

      if (targetFromStr) {
        const start = parseBackendCustomDate(targetFromStr);
        const end = targetToStr ? parseBackendCustomDate(targetToStr) : start;

        if (start && end) {
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          return date >= start && date <= end;
        }
      }
      return false;
    });

    if (realEntry) {
      const hasStartTime = realEntry.start_time && realEntry.start_time.trim() !== "-"
      const hasEndTime = realEntry.end_time && realEntry.end_time.trim() !== "-"
      const backendStatus = (realEntry.status || realEntry.approveStatus || "").toLowerCase()

      if (backendStatus.includes("leave") || backendStatus.includes("approved") || isDateOnApprovedLeave) {
        status = "Leave"
      } else if (backendStatus.includes("absent")) {
        status = "Absent"
      } else if (!hasStartTime && !hasEndTime) {
        status = "Leave"
      } else {
        const totalSeconds = parseWorkHoursToSeconds(hours)
        const totalHours = totalSeconds / 3600
        status = (totalHours > 0 && totalHours < 4) ? "Half Day" : "Present"
      }
    } else {
      if (isDateOnApprovedLeave) {
        status = "Leave"; 
      } else if (date > today) {
        status = "-"; 
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = "Weekend"; 
      } else {
        status = "Absent"; 
      }
    }

    data.push({
      id: `${year}-${month}-${day}`,
      date: dateString,
      day: abbrevDay,
      checkIn,
      checkOut,
      status,
      hours,
      rawDate: day, 
      fullDateObject: date 
    })
  }

  return data.reverse()
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Present": return { color: "#10b981", bg: "#f0fdf4" }
    case "Absent": return { color: "#ef4444", bg: "#fef2f2" }
    case "Leave": case "On Leave": return { color: "#6366f1", bg: "#e0e7ff" }
    case "Half Day": return { color: "#ff7a00", bg: "#fff7ed" }
    case "Weekend": return { color: "#9ca3af", bg: "#f3f4f6" }
    default: return { color: "#6b7280", bg: "#f9fafb" }
  }
}

const parseWorkHoursToSeconds = (workHoursStr: string): number => {
  if (!workHoursStr || workHoursStr === "-" || workHoursStr.trim() === "") return 0;
  
  if (workHoursStr.includes(":")) {
    const parts = workHoursStr.split(":").map(Number)
    if (parts.some(isNaN)) return 0
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60
    return 0
  }

  let hours = 0, minutes = 0, seconds = 0
  const lowerStr = workHoursStr.toLowerCase()

  const hourMatch = lowerStr.match(/(\d+)\s*hour/)
  const minMatch = lowerStr.match(/(\d+)\s*min/)
  const secMatch = lowerStr.match(/(\d+)\s*sec/)

  if (hourMatch) hours = parseInt(hourMatch[1], 10)
  if (minMatch) minutes = parseInt(minMatch[1], 10)
  if (secMatch) seconds = parseInt(secMatch[1], 10)

  return (hours * 3600) + (minutes * 60) + seconds
}

interface Attend {
  id: string;
  checkIn: string;
  date: string;
  day: string;
  checkOut: string;
  hours: string;
  status: string;
  rawDate: number;
  fullDateObject: Date;
}

export default function AttendanceScreen() {
  const monthNamesArray = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const [view, setView] = useState("list")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [attendanceData, setAttendanceData] = useState<Attend[]>([])
  const [empAttendance, setEmpAttendance] = useState<RealEntry[]>([])
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]) 
  const [modalVisible, setModalVisible] = useState(false)

  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTimeDisplay, setCheckInTimeDisplay] = useState<string>("--:--:--")
  const [hasCompletedDay, setHasCompletedDay] = useState(false) 
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [summary, setSummary] = useState({ present: 0, absent: 0, leave: 0, halfDay: 0 })
  const [showAllRecords, setShowAllRecords] = useState(false)
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false)

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    if (isCheckedIn) {
      intervalId = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isCheckedIn])

  const formatWorkDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60 
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
  }

  const formatWorkDurationShort = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`
  }

  const handleCheckInOut = async() => {
    if (hasCompletedDay) {
      Alert.alert("Attendance Locked", "You have already completed your schedule for today.")
      return
    }

    if (!isCheckedIn) {
      setIsCheckedIn(true)
      setCheckInTimeDisplay(format(new Date(), "HH:mm"))
      try {
        const response = await fetch(`${API_BASE_URL}/mobile-checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
        if (response.ok) {
          Alert.alert("Success", "Checked-in successfully!")
          loadSalary()
        } else {
          setIsCheckedIn(false)
          Alert.alert("Error", "Check-in failed on the server side.")
        }
      } catch (err) {
        setIsCheckedIn(false)
        Alert.alert("Network Error", "Could not connect to the backend server.")
      }
    } else {
      Alert.alert(
        "Confirm Action",
        "Do you want to Check-Out?",
        [
          { text: "Dismiss", style: "cancel" },
          { 
            text: "Yes, Check-Out", 
            style: "destructive",
            onPress: async() => {
              try {
                const response = await fetch(`${API_BASE_URL}/mobile-checkout`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                })
                if (response.ok) {
                  setIsCheckedIn(false);
                  setHasCompletedDay(true);
                  Alert.alert("Success", "Checked-out successfully!")
                  loadSalary()
                } else {
                  Alert.alert("Error", "Check-out failed on the server side.")
                }
              } catch (err) {
                Alert.alert("Network Error", "Could not connect to the backend server.")
              }
            } 
          }
        ]
      )
    }
  }

  const loadSalary = async () => {
    try {
      console.log("================ [FETCH START] ================");
      
      const response = await fetch(`${API_BASE_URL}/fetch-my-attendance-history-mobile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      
      if (response.ok) {
        const data = await response.json();
        const history = data.attendanceHistory || [];
        setEmpAttendance(history)

        const todayStr = format(new Date(), "dd/MM/yyyy")
        const todayRecord = history.find((item: RealEntry) => item.date === todayStr);

        if (todayRecord) {
          const hasStart = todayRecord.start_time && todayRecord.start_time !== "-";
          const hasEnd = todayRecord.end_time && todayRecord.end_time !== "-";

          if (hasStart) {
            setCheckInTimeDisplay(todayRecord.start_time);
            
            if (!hasEnd || todayRecord.work_hours === "00h 00m" || todayRecord.work_hours === "-") {
              setIsCheckedIn(true)
              setHasCompletedDay(false)
              
              const now = new Date()
              const cleanTimeStr = todayRecord.start_time.replace(/[^\d:]/g, '');
              const timeParts = cleanTimeStr.split(":")
              
              let sHour = parseInt(timeParts[0], 10) || 0
              const sMin = parseInt(timeParts[1], 10) || 0
              const sSec = parseInt(timeParts[2], 10) || 0

              if (todayRecord.start_time.toLowerCase().includes("pm") && sHour < 12) {
                sHour += 12;
              } else if (todayRecord.start_time.toLowerCase().includes("am") && sHour === 12) {
                sHour = 0;
              }

              const checkInTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sHour, sMin, sSec);
              const diffInSeconds = Math.max(0, Math.floor((now.getTime() - checkInTime.getTime()) / 1000));
              setSecondsElapsed(diffInSeconds)
            } else {
              setIsCheckedIn(false)
              setHasCompletedDay(true)
              const finalSeconds = parseWorkHoursToSeconds(todayRecord.work_hours);
              setSecondsElapsed(finalSeconds);
            }
          }
        } else {
          setIsCheckedIn(false)
          setHasCompletedDay(false)
          setSecondsElapsed(0)
          setCheckInTimeDisplay("--:--:--")
        }
      }

      const leaveResponse = await fetch(`${API_BASE_URL}/my-time-off-request-list-mobile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (leaveResponse.ok) {
        const leaveData = await leaveResponse.json();
        const activeLeaves = leaveData.offRequests || []; 
        setLeaveHistory(activeLeaves);
      }
      console.log("================ [FETCH END] ================");
    } catch (error) {
      console.log("Error pulling attendance live data records:", error)
    }
  }

  useEffect(() => {
    loadSalary()
  }, [])

  useEffect(() => {
    if (!empAttendance.length && !leaveHistory.length) return

    const data = generateAttendanceData(currentMonth, currentYear, empAttendance, leaveHistory)
    setAttendanceData(data)

    const present = data.filter((item) => item.status === "Present").length
    const absent = data.filter((item) => item.status === "Absent").length
    const leave = data.filter((item) => item.status === "Leave" || item.status === "On Leave").length
    const halfDay = data.filter((item) => item.status === "Half Day").length

    setSummary({ present, absent, leave, halfDay })
  }, [currentMonth, currentYear, empAttendance, leaveHistory])

  const goToPreviousMonth = () => {
    setShowAllRecords(false)
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    setShowAllRecords(false)
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const selectDirectMonth = (monthIndex: number) => {
    setShowAllRecords(false)
    setCurrentMonth(monthIndex + 1)
    setIsMonthPickerVisible(false)
  }

  const getFilteredAttendanceData = () => {
    if (showAllRecords) {
      return attendanceData; 
    }

    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) 
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 }) 

    return attendanceData.filter((item) => {
      const isCurrentWeek = isWithinInterval(item.fullDateObject, {
        start: startOfCurrentWeek,
        end: endOfCurrentWeek,
      })
      return isCurrentWeek && item.status !== "Weekend" && item.status !== "-";
    })
  }

  const renderAttendanceItem = ({ item }: { item: Attend }) => {
    const config = getStatusConfig(item.status)
    const isSpecialStatus = item.status === "Absent" || item.status === "Leave" || item.status === "On Leave" || item.status === "Weekend" || item.status === "-"

    return (
      <View style={styles.attendanceItem}>
        <View style={styles.dateColumn}>
          <Text style={styles.dayText}>{item.day}</Text>
          <Text style={styles.dateNumberText}>{item.date.split(' ')[0]}</Text>
          <Text style={styles.monthText}>{item.date.split(' ')[1]}</Text>
        </View>
        
        <View style={styles.detailsColumn}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: config.color }]} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {item.status === "Leave" ? "On Leave" : item.status}
            </Text>
          </View>
          
          {!isSpecialStatus && (
            <Text style={styles.timeRangeText}>
              {item.checkIn ? item.checkIn : "--:--"} - {item.checkOut ? item.checkOut : "--:--"}
            </Text>
          )}
        </View>

        <View style={styles.hoursColumn}>
          <Text style={[styles.durationHoursText, isSpecialStatus && { color: '#94a3b8' }]}>
            {isSpecialStatus ? "-" : (item.hours || "--")}
          </Text>
        </View>
      </View>
    )
  }

  const renderCalendarView = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => (
      <View key={`empty-${i}`} style={styles.calendarDate} />
    ))

    const dateCells = Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1
      const parsedDate = (rawDate: string) => {
        const match = rawDate.match(/(\d+)\s*/)
        return match ? parseInt(match[1], 10) : -1
      }

      const dateData = attendanceData.find((item) => parsedDate(item.date) === date)
      const status = dateData?.status || "Unknown"

      return (
        <View key={`date-${date}`} style={[styles.calendarDate, status === "Weekend" && styles.calendarWeekend]}>
          <Text style={styles.calendarDateText}>{date}</Text>
          {status !== "Unknown" && status !== "-" && status !== "Weekend" && (
            <View style={[styles.calendarStatusDot, { backgroundColor: getStatusConfig(status).color }]} />
          )}
        </View>
      )
    })

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarGrid}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <View key={`day-${index}`} style={styles.calendarDay}>
              <Text style={styles.calendarDayText}>{day}</Text>
            </View>
          ))}
          {emptyCells}
          {dateCells}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#10b981' }]} /><Text style={styles.legendText}>Present</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Absent</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} /><Text style={styles.legendText}>On Leave</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#9ca3af' }]} /><Text style={styles.legendText}>Weekend</Text></View>
        </View>
      </View>
    )
  }

  const todayFormatted = format(new Date(), "dd/MM/yyyy")
  const targetedTodayObj = empAttendance.find((x: RealEntry) => x.date === todayFormatted)
  const displayRecords = getFilteredAttendanceData()
  
  const currentDayOfMonth = new Date().getDate();
  const calculatedTodayRow = attendanceData.find(item => item.rawDate === currentDayOfMonth);

  let todayStatusLabel = "Absent"
  const backendTodayStatus = targetedTodayObj?.status || targetedTodayObj?.approveStatus || ""
  
  if (isCheckedIn) {
    todayStatusLabel = "Active"
  } else if (calculatedTodayRow?.status === "Leave") {
    todayStatusLabel = "On Leave"
  } else if (calculatedTodayRow?.status && calculatedTodayRow.status !== "-") {
    todayStatusLabel = calculatedTodayRow.status === "Leave" ? "On Leave" : calculatedTodayRow.status
  } else if (backendTodayStatus.toLowerCase().includes("leave")) {
    todayStatusLabel = "On Leave"
  } else if (hasCompletedDay) {
    const activeTodayHours = parseWorkHoursToSeconds(targetedTodayObj?.work_hours || "") / 3600
    todayStatusLabel = (activeTodayHours > 0 && activeTodayHours < 4) ? "Half Day" : "Present"
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.headerIconButton, isMonthPickerVisible && { backgroundColor: '#f1f5f9' }]}
          onPress={() => setIsMonthPickerVisible(!isMonthPickerVisible)}
        >
          <Feather name="calendar" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
       
      </View>

      {isMonthPickerVisible && (
        <View style={styles.dropdownPickerCard}>
          <Text style={styles.pickerTitleLabel}>Select Reference Target Month</Text>
          <View style={styles.pickerGridContainer}>
            {monthNamesArray.map((mName, mIdx) => (
              <TouchableOpacity 
                key={mName}
                style={[
                  styles.pickerGridItem,
                  (currentMonth === mIdx + 1) && styles.pickerGridItemActive
                ]}
                onPress={() => selectDirectMonth(mIdx)}
              >
                <Text style={[
                  styles.pickerItemText,
                  (currentMonth === mIdx + 1) && styles.pickerItemTextActive
                ]}>
                  {mName.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={{ backgroundColor: '#f8fafc' }} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.monthPaginationRow}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.paginationArrow}>
            <Feather name="chevron-left" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.monthDisplayLabel}>{monthNamesArray[currentMonth - 1]} {currentYear}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.paginationArrow}>
            <Feather name="chevron-right" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.checkInBannerCard}>
          <View style={styles.timerLabelsGroup}>
            <Text style={styles.hoursCardLabel}>Working Hours</Text>
            
            <Text style={styles.hoursTimerString}>
              {isCheckedIn 
                ? formatWorkDuration(secondsElapsed) 
                : formatWorkDurationShort(secondsElapsed)
              }
            </Text>
            
            <Text style={styles.checkedInSubtitle}>
              {isCheckedIn 
                ? `Checked in at ${checkInTimeDisplay}` 
                : (hasCompletedDay ? "Day Completed" : (backendTodayStatus.toLowerCase().includes("leave") ? "On Leave" : "Not Checked In"))
              }
            </Text>
          </View>
  
          <View style={styles.radialAccentDecoration}>
            <View style={styles.pulseRingOuter} />
            <View style={styles.pulseRingInner} />
            <TouchableOpacity 
              disabled={hasCompletedDay || backendTodayStatus.toLowerCase().includes("leave")}
              style={[
                styles.checkInMainActionButton,
                { backgroundColor: '#10b981' },
                (hasCompletedDay || backendTodayStatus.toLowerCase().includes("leave")) && { backgroundColor: '#e2e8f0' }
              ]}
              onPress={handleCheckInOut}
            >
              <Text style={[styles.checkInButtonText, (hasCompletedDay || backendTodayStatus.toLowerCase().includes("leave")) && { color: '#94a3b8' }]}>
                {isCheckedIn ? "Check-Out" : "Check-In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Attendance Summary</Text>
        <View style={styles.metricStatsRow}>
          
          <View style={styles.metricItemBlock}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Feather name="calendar" size={18} color="#10b981" />
            </View>
            <Text style={styles.metricCountText}>{summary.present}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#10b981' }]}>Present</Text>
          </View>

          <View style={styles.metricItemBlock}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
              <Feather name="users" size={18} color="#ef4444" />
            </View>
            <Text style={styles.metricCountText}>{summary.absent}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#ef4444' }]}>Absent</Text>
          </View>

          <View style={styles.metricItemBlock}>
            <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
              <Feather name="user" size={18} color="#6366f1" />
            </View>
            <Text style={styles.metricCountText}>{summary.leave}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#6366f1' }]}>On Leave</Text>
          </View>

          <View style={[styles.metricItemBlock, { borderRightWidth: 0 }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff7ed' }]}>
              <Feather name="clock" size={18} color="#ff7a00" />
            </View>
            <Text style={styles.metricCountText}>{summary.halfDay}</Text>
            <Text style={[styles.metricLabelSubtitle, { color: '#ff7a00' }]}>Half Day</Text>
          </View>

        </View>

        <View style={styles.tabToggleRow}>
          <TouchableOpacity 
            style={[styles.toggleButton, view === "list" && styles.activeToggleButton]}
            onPress={() => {
              setView("list")
              setShowAllRecords(false) 
            }}
          >
            <Text style={[styles.toggleButtonText, view === "list" && styles.activeToggleButtonText]}>List View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, view === "calendar" && styles.activeToggleButton]}
            onPress={() => setView("calendar")}
          >
            <Text style={[styles.toggleButtonText, view === "calendar" && styles.activeToggleButtonText]}>Calendar View</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          {view === "list" && !showAllRecords ? "This Week's Attendance Records" : "Attendance Records"}
        </Text>
        
        {view === "list" ? (
          <View style={styles.sectionWrapperCard}>
            <View style={styles.listContainerBox}>
              {displayRecords.length === 0 ? (
                <Text style={styles.emptyTextMessage}>No tracking logs for this period.</Text>
              ) : (
                displayRecords.map((item) => (
                  <View key={item.id}>
                    {renderAttendanceItem({ item })}
                  </View>
                ))
              )}
            </View>
            <TouchableOpacity 
              style={styles.viewAllRecordsRow}
              onPress={() => setShowAllRecords(!showAllRecords)}
            >
              <Text style={styles.viewAllRecordsText}>
                {showAllRecords ? "Show Less" : "View All Records"}
              </Text>
              <Feather 
                name={showAllRecords ? "chevron-up" : "arrow-right"} 
                size={16} 
                color="#435ffd" 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionWrapperCard}>
            {renderCalendarView()}
          </View>
        )}

        <Text style={styles.sectionTitle}>Today's Log</Text>
        <View style={styles.sectionWrapperCard}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={styles.logSubCard}>
              <View style={[styles.logIndicatorIconCircle, { backgroundColor: '#e6f4ea' }]}>
                <Feather name="check-circle" size={16} color="#10b981" />
              </View>
              <View style={styles.logDetailMetaGroup}>
                <Text style={styles.logTimeHeaderLabel}>Check-In</Text>
                <Text style={styles.logTimeTimestampString}>
                  {targetedTodayObj?.start_time && targetedTodayObj.start_time !== "-" ? targetedTodayObj.start_time.substring(0, 5) : "--:--"}
                </Text>
              </View>
            </View>
            
            <View style={styles.logSubCard}>
              <View style={[styles.logIndicatorIconCircle, { backgroundColor: '#fce8e6' }]}>
                <Feather name="log-out" size={16} color="#ef4444" />
              </View>
              <View style={styles.logDetailMetaGroup}>
                <Text style={styles.logTimeHeaderLabel}>Check-Out</Text>
                <Text style={styles.logTimeTimestampString}>
                  {targetedTodayObj?.end_time && targetedTodayObj.end_time !== "-" ? targetedTodayObj.end_time.substring(0, 5) : "--:--"}
                </Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

     <LeaveModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafbfe" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafbfe' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b', fontWeight: '600' },
  header: {
  flexDirection: "row",
  justifyContent: "center", // Keeps title perfectly centered horizontally
  alignItems: "center",     // Vertically centers items
  paddingHorizontal: 20,
  paddingTop: Platform.OS === "ios" ? 55 : 16,
  paddingBottom: 16,
  backgroundColor: "#ffffff",
  borderBottomWidth: 1,
  borderColor: '#f1f5f9',
  position: 'relative',    // Allows absolute positioning inside
},
headerIconButton: {
  position: 'absolute',    // Takes icon out of normal flex layout so title stays centered
  left: 16,                // Positions icon at the start (left edge)
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',    // Changed to center so the calendar icon rests nicely in the button
  justifyContent: 'center',
},
headerTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#1e293b",
  textAlign: 'center',     // Ensures text alignment is centered
},
  scrollContent: { 
        flexGrow: 1,       
        paddingHorizontal: 16, 
        paddingBottom: 32,
        backgroundColor: '#f8fafc' 
    },
  dropdownPickerCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'absolute',
    top: Platform.OS === "ios" ? 105 : 66,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  pickerTitleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  pickerGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between', // Spreads the 4 columns evenly
  },
  pickerGridItem: {
    width: '22%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  pickerGridItemActive: {
    backgroundColor: '#435ffd',
    borderColor: '#435ffd',
  },
  pickerItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: '#ffffff',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monthPaginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  paginationArrow: {
    padding: 8,
  },
  monthDisplayLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginHorizontal: 24,
  },
  checkInBannerCard: {
    backgroundColor: '#3b52f6',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  timerLabelsGroup: {
    flex: 1,
    zIndex: 2,
  },
  hoursCardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  hoursTimerString: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  checkedInSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  radialAccentDecoration: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  checkInMainActionButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  checkInButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 24,
    marginBottom: 12,
  },
  metricStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricItemBlock: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCountText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  metricLabelSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginTop: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggleButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeToggleButtonText: {
    color: '#435ffd',
  },
  sectionWrapperCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  listContainerBox: {
    marginTop: 4,
  },
  emptyTextMessage: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 24,
    fontWeight: '500',
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateColumn: {
    width: '20%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dateNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 24,
    marginVertical: 2,
  },
  monthText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  detailsColumn: {
    width: '55%',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeRangeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  hoursColumn: {
    width: '25%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  durationHoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  viewAllRecordsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  viewAllRecordsText: {
    color: '#435ffd',
    fontSize: 14,
    fontWeight: '600',
  },
  logSubCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logIndicatorIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logDetailMetaGroup: {
    flex: 1,
  },
  logTimeHeaderLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  logTimeTimestampString: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d2939',
    marginTop: 2,
  },
  logBottomStatsBlock: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
  },
  leaveButtonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  leaveButton: {
    flex: 1,
    backgroundColor: '#435ffd',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarContainer: {
    paddingVertical: 12,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    paddingVertical: 8,
    alignItems: "center",
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  calendarDate: {
    width: "14.28%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
    borderRadius: 8,
  },
  calendarWeekend: {
    backgroundColor: "#f8fafc",
  },
  calendarDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: "#1d2939",
  },
  calendarStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
 
  // ADD THESE TWO BLOCKS RIGHT HERE:
  pulseRingOuter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pulseRingInner: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
})
