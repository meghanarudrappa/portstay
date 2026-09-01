import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import your custom AssignShiftModal component
// import AssignShiftModal from "./AssignShiftModal"; // Adjust path as needed

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import { API_BASE_URL } from "@/app/config/api"; // Replace with your actual base URL or import from config

interface TableColumn {
  key: string;
  label: string;
  width: number;
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: "employeeName", label: "EMPLOYEE", width: 180 },
  { key: "department", label: "DEPARTMENT", width: 140 },
  { key: "shiftName", label: "SHIFT", width: 150 },
  { key: "timeRange", label: "TIME", width: 130 },
  { key: "startDate", label: "START DATE", width: 120 },
  { key: "endDate", label: "END DATE", width: 120 },
  { key: "status", label: "STATUS", width: 120 },
];

interface ShiftRecord {
  id: string;
  employeeName: string;
  avatarInitials: string;
  department: string;
  shiftName: string;
  timeRange: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive" | "Upcoming";
}

const FILTER_DATE_OPTIONS = [
  "All",
  "Today",
  "This Week",
  "This Month",
  "Last 3 Months",
  "Last 6 Months",
  "Last 12 Months",
  "This Quarter",
  "Previous Quarter",
  "This Year",
  "Previous Year",
  "Year To Date",
  "Quarter To Date",
];

const SHOW_ENTRIES_OPTIONS = [25, 50, 100];

export default function WorkShiftsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState<boolean>(false);

  // Dropdown States
  const [isDateFilterOpen, setIsDateFilterOpen] = useState<boolean>(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("All");

  const [isShowEntriesOpen, setIsShowEntriesOpen] = useState<boolean>(false);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(SHOW_ENTRIES_OPTIONS[0]);

  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});

  // Dynamic Data States
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    inactive: 0,
  });

  // Helper to format Date -> YYYY-MM-DD for API query params
  const formatApiDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Compute startDate & dueDate strings for API
  const getFilterDateBounds = (filterOption: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let start = new Date(today);
    let end = new Date(today);

    switch (filterOption) {
      case "Today":
        break;
      case "This Week": {
        start.setDate(today.getDate() - today.getDay());
        end.setDate(start.getDate() + 6);
        break;
      }
      case "This Month": {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      }
      case "Last 3 Months": {
        start.setMonth(today.getMonth() - 3);
        break;
      }
      case "Last 6 Months": {
        start.setMonth(today.getMonth() - 6);
        break;
      }
      case "Last 12 Months": {
        start.setFullYear(today.getFullYear() - 1);
        break;
      }
      case "This Quarter": {
        const qMonth = Math.floor(today.getMonth() / 3) * 3;
        start = new Date(today.getFullYear(), qMonth, 1);
        end = new Date(today.getFullYear(), qMonth + 3, 0);
        break;
      }
      case "Previous Quarter": {
        let qYear = today.getFullYear();
        let qMonth = Math.floor(today.getMonth() / 3) * 3 - 3;
        if (qMonth < 0) {
          qMonth = 9;
          qYear -= 1;
        }
        start = new Date(qYear, qMonth, 1);
        end = new Date(qYear, qMonth + 3, 0);
        break;
      }
      case "This Year": {
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      }
      case "Previous Year": {
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      }
      case "Year To Date": {
        start = new Date(today.getFullYear(), 0, 1);
        break;
      }
      case "Quarter To Date": {
        const qMonth = Math.floor(today.getMonth() / 3) * 3;
        start = new Date(today.getFullYear(), qMonth, 1);
        break;
      }
      case "All":
      default: {
        start = new Date(2020, 0, 1);
        end = new Date(2030, 11, 31);
        break;
      }
    }

    return {
      startDate: formatApiDate(start),
      dueDate: formatApiDate(end),
    };
  };

  useEffect(() => {
    fetchShiftRecords();
  }, [selectedDateFilter]);

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "--";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // FETCH DATA ONLY FROM YOUR 2 MOBILE ENDPOINTS
  const fetchShiftRecords = async () => {
    setLoading(true);
    const { startDate, dueDate } = getFilterDateBounds(selectedDateFilter);

    try {
      let endpoint = `${API_BASE_URL}/shift-assign-details-mobile`;
      if (selectedDateFilter !== "All") {
        endpoint = `${API_BASE_URL}/shift-assign-details-date-wise-mobile?startDate=${startDate}&dueDate=${dueDate}`;
      }

      const response = await fetch(endpoint, {
        credentials: "include",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const json = await response.json();
      const userDetails = json?.userDetails || [];

      if (Array.isArray(userDetails)) {
        const transformedShifts: ShiftRecord[] = userDetails.map((item: any, idx: number) => {
          const rawName = item.employeeName || item.name || item.userName || item.user || "";
          const rawStatus = (item.status || item.shiftStatus || "Active").toLowerCase();

          let normalizedStatus: "Active" | "Inactive" | "Upcoming" = "Active";
          if (rawStatus.includes("inactive")) normalizedStatus = "Inactive";
          else if (rawStatus.includes("upcoming")) normalizedStatus = "Upcoming";

          return {
            id: String(item.id || item._id || `shift-${idx}`),
            employeeName: rawName,
            avatarInitials: getInitials(rawName),
            department: item.department || "",
            shiftName: item.shiftName || item.calendarName || item.shift || "",
            timeRange:
              item.timeRange ||
              (item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : ""),
            startDate: item.startDate || item.fromDate || "",
            endDate: item.endDate || item.toDate || "",
            status: normalizedStatus,
          };
        });

        setShifts(transformedShifts);

        setStats({
          total: transformedShifts.length,
          active: transformedShifts.filter((s) => s.status === "Active").length,
          upcoming: transformedShifts.filter((s) => s.status === "Upcoming").length,
          inactive: transformedShifts.filter((s) => s.status === "Inactive").length,
        });
      } else {
        setShifts([]);
        setStats({ total: 0, active: 0, upcoming: 0, inactive: 0 });
      }
    } catch (error) {
      console.error("[DEBUG] Error fetching shift records:", error);
      setShifts([]);
      setStats({ total: 0, active: 0, upcoming: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatDateString = (d: Date): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDateRangeLabel = (filterOption: string): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterOption) {
      case "All":
        return "All Time";
      case "Today": {
        return formatDateString(today);
      }
      case "This Week": {
        const first = new Date(today);
        first.setDate(today.getDate() - today.getDay());
        const last = new Date(first);
        last.setDate(first.getDate() + 6);
        return `${formatDateString(first)} - ${formatDateString(last)}`;
      }
      case "This Month": {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return `${formatDateString(start)} - ${formatDateString(end)}`;
      }
      case "Last 3 Months": {
        const start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        return `${formatDateString(start)} - ${formatDateString(today)}`;
      }
      case "Last 6 Months": {
        const start = new Date(today);
        start.setMonth(today.getMonth() - 6);
        return `${formatDateString(start)} - ${formatDateString(today)}`;
      }
      case "Last 12 Months": {
        const start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        return `${formatDateString(start)} - ${formatDateString(today)}`;
      }
      case "This Quarter": {
        const qMonth = Math.floor(today.getMonth() / 3) * 3;
        const start = new Date(today.getFullYear(), qMonth, 1);
        const end = new Date(today.getFullYear(), qMonth + 3, 0);
        return `${formatDateString(start)} - ${formatDateString(end)}`;
      }
      case "Previous Quarter": {
        let qYear = today.getFullYear();
        let qMonth = Math.floor(today.getMonth() / 3) * 3 - 3;
        if (qMonth < 0) {
          qMonth = 9;
          qYear -= 1;
        }
        const start = new Date(qYear, qMonth, 1);
        const end = new Date(qYear, qMonth + 3, 0);
        return `${formatDateString(start)} - ${formatDateString(end)}`;
      }
      case "This Year": {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        return `${formatDateString(start)} - ${formatDateString(end)}`;
      }
      case "Previous Year": {
        const start = new Date(today.getFullYear() - 1, 0, 1);
        const end = new Date(today.getFullYear() - 1, 11, 31);
        return `${formatDateString(start)} - ${formatDateString(end)}`;
      }
      case "Year To Date": {
        const start = new Date(today.getFullYear(), 0, 1);
        return `${formatDateString(start)} - ${formatDateString(today)}`;
      }
      case "Quarter To Date": {
        const qMonth = Math.floor(today.getMonth() / 3) * 3;
        const start = new Date(today.getFullYear(), qMonth, 1);
        return `${formatDateString(start)} - ${formatDateString(today)}`;
      }
      default:
        return filterOption;
    }
  };

  const filteredShifts = shifts.filter((s) => {
    const matchesSearch =
      s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shiftName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === filteredShifts.length) {
      setSelectedRows({});
    } else {
      const allSelected: { [key: string]: boolean } = {};
      filteredShifts.forEach((s) => (allSelected[s.id] = true));
      setSelectedRows(allSelected);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAssignShiftForm = () => {
    setIsCreateMenuOpen(false);
    setIsAssignModalOpen(true);
  };

  // Helper function for rendering status color indicators
  const renderStatusBadge = (status: "Active" | "Inactive" | "Upcoming") => {
    let dotStyle = styles.statusDotGreen;
    let textStyle = styles.statusTextGreen;

    if (status === "Inactive") {
      dotStyle = styles.statusDotRed;
      textStyle = styles.statusTextRed;
    } else if (status === "Upcoming") {
      dotStyle = styles.statusDotYellow;
      textStyle = styles.statusTextYellow;
    }

    return (
      <TouchableOpacity style={styles.tableStatusPill}>
        <View style={dotStyle} />
        <Text style={textStyle}>{status}</Text>
        <Feather name="chevron-down" size={12} color="#64748b" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color="#1e293b" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Work Shifts</Text>
          <Text style={styles.headerSub}>Manage and track employee shift allotment</Text>
        </View>

        {/* <TouchableOpacity style={styles.createDropdownBtn} onPress={() => setIsCreateMenuOpen(true)}>
          <Text style={styles.createDropdownText}>+ Create</Text>
          <Feather name="chevron-down" size={14} color="#1e293b" />
        </TouchableOpacity> */}
      </View>

      {/* --- FILTER MODAL DROPDOWN --- */}
      <Modal
        visible={isDateFilterOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDateFilterOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDateFilterOpen(false)}
        >
          <View style={styles.modalFilterMenuBox}>
            <Text style={styles.modalTitle}>Select Date Filter</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {FILTER_DATE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownOptionItem,
                    selectedDateFilter === option && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedDateFilter(option);
                    setIsDateFilterOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedDateFilter === option && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedDateFilter === option && (
                    <Feather name="check" size={16} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- SHOW ENTRIES MODAL --- */}
      <Modal
        visible={isShowEntriesOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsShowEntriesOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsShowEntriesOpen(false)}
        >
          <View style={styles.modalCompactMenuBox}>
            <Text style={styles.modalTitle}>Show Entries</Text>
            {SHOW_ENTRIES_OPTIONS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.dropdownOptionItem,
                  entriesPerPage === count && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setEntriesPerPage(count);
                  setIsShowEntriesOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    entriesPerPage === count && styles.dropdownOptionTextActive,
                  ]}
                >
                  {count} entries
                </Text>
                {entriesPerPage === count && <Feather name="check" size={14} color="#2563eb" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MORE ACTIONS MODAL --- */}
      <Modal
        visible={isMoreActionsOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMoreActionsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMoreActionsOpen(false)}
        >
          <View style={styles.modalCompactMenuBox}>
            <Text style={styles.modalTitle}>More Actions</Text>
            <TouchableOpacity
              style={styles.dropdownOptionItem}
              onPress={() => {
                setIsMoreActionsOpen(false);
                Alert.alert("Bulk Export", "Exporting shift records...");
              }}
            >
              <Text style={styles.dropdownOptionText}>Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownOptionItem}
              onPress={() => {
                setIsMoreActionsOpen(false);
                Alert.alert("Bulk Delete", "Selected records deleted.");
              }}
            >
              <Text style={[styles.dropdownOptionText, { color: "#ef4444" }]}>Delete Selected</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- QUICK ACTION DROPDOWN MODAL ---
      <Modal
        visible={isCreateMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlayTap}
          activeOpacity={1}
          onPress={() => setIsCreateMenuOpen(false)}
        >
          <View style={styles.createMenuBox}>
            <TouchableOpacity
              style={styles.menuOptionRow}
              onPress={handleOpenAssignShiftForm}
            >
              <Text style={[styles.menuOptionText, { fontWeight: "700", color: "#2563eb" }]}>
                Assign Shift
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal> */}

      {/* --- MAIN CONTENT --- */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* METRICS CARDS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsContainer}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: "#eff6ff" }]}>
              <Feather name="calendar" size={18} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.statLabel}>TOTAL ALLOTTED SHIFTS</Text>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statSubText}>This period</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: "#f0fdf4" }]}>
              <Feather name="user-check" size={18} color="#10b981" />
            </View>
            <View>
              <Text style={styles.statLabel}>ACTIVE SHIFTS</Text>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statSubText}>Currently active</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: "#fefce8" }]}>
              <Feather name="clock" size={18} color="#eab308" />
            </View>
            <View>
              <Text style={styles.statLabel}>UPCOMING SHIFTS</Text>
              <Text style={styles.statNumber}>{stats.upcoming}</Text>
              <Text style={styles.statSubText}>Starting soon</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: "#fef2f2" }]}>
              <Feather name="slash" size={18} color="#ef4444" />
            </View>
            <View>
              <Text style={styles.statLabel}>INACTIVE SHIFTS</Text>
              <Text style={styles.statNumber}>{stats.inactive}</Text>
              <Text style={styles.statSubText}>Not in active period</Text>
            </View>
          </View>
        </ScrollView>

        {/* --- TOOLBAR / FILTERS SECTION --- */}
        <View style={styles.topToolbarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topToolbarScrollContent}
          >
            <View style={styles.topToolbar}>
              {/* Filter Trigger Group */}
              <View style={styles.filterTriggerGroup}>
                <Text style={styles.filterTitleLabel}>Filter</Text>
                <TouchableOpacity
                  style={styles.filterIconButton}
                  onPress={() => setIsDateFilterOpen(true)}
                >
                  <Feather name="filter" size={14} color="#1e293b" />
                </TouchableOpacity>

                <Feather name="chevron-right" size={14} color="#94a3b8" style={{ marginHorizontal: 2 }} />

                <TouchableOpacity
                  style={[
                    styles.filterIconButton,
                    selectedDateFilter !== "All" && styles.activeFilterBadge,
                  ]}
                  onPress={() => setIsDateFilterOpen(true)}
                >
                  <Feather
                    name="calendar"
                    size={14}
                    color={selectedDateFilter !== "All" ? "#2563eb" : "#1e293b"}
                  />
                  <Text
                    style={[
                      styles.activeFilterText,
                      selectedDateFilter !== "All" && { color: "#2563eb" },
                    ]}
                  >
                    {" "}{getDateRangeLabel(selectedDateFilter)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right Toolbar Options */}
              <View style={styles.toolbarRightGroup}>
                <View style={styles.searchBarBox}>
                  <Feather name="search" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.searchInputText}
                    placeholder="Search by name, depart or shift"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Show Entries Selector */}
                <Text style={styles.showTextLabel}>Show:</Text>
                <TouchableOpacity
                  style={styles.showEntriesSelector}
                  onPress={() => setIsShowEntriesOpen(true)}
                >
                  <Text style={styles.showEntriesText}>{entriesPerPage}</Text>
                  <Feather name="chevron-down" size={14} color="#475569" />
                </TouchableOpacity>

                {/* Total Count Badge */}
                <View style={styles.totalBadgeBox}>
                  <Text style={styles.totalBadgeText}>Total : {filteredShifts.length}</Text>
                </View>

                {/* More Actions Dropdown */}
                <TouchableOpacity
                  style={styles.moreActionsBtn}
                  onPress={() => setIsMoreActionsOpen(true)}
                >
                  <Text style={styles.moreActionsText}>More Actions</Text>
                  <Feather name="chevron-down" size={14} color="#ffffff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* --- HORIZONTAL SCROLL FOR TABLE --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {/* STATIC TABLE HEADER */}
            <View style={styles.tableHeaderRow}>
              <TouchableOpacity style={styles.checkboxCell} onPress={toggleSelectAll}>
                <View
                  style={[
                    styles.checkboxBox,
                    Object.keys(selectedRows).length === filteredShifts.length &&
                      filteredShifts.length > 0 &&
                      styles.checkboxChecked,
                  ]}
                >
                  {Object.keys(selectedRows).length === filteredShifts.length &&
                    filteredShifts.length > 0 && <Feather name="check" size={12} color="#ffffff" />}
                </View>
              </TouchableOpacity>

              {TABLE_COLUMNS.map((col) => (
                <View key={col.key} style={[styles.thCell, { width: col.width }]}>
                  <Text style={styles.thText}>{col.label}</Text>
                  <Feather name="arrow-up" size={10} color="#94a3b8" />
                </View>
              ))}

              <View style={[styles.thCell, { width: 100, justifyContent: "flex-end" }]}>
                <Text style={styles.thText}>ACTIONS</Text>
              </View>
            </View>

            {/* TABLE BODY */}
            {loading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Fetching shift records...</Text>
              </View>
            ) : filteredShifts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="info" size={24} color="#94a3b8" />
                <Text style={styles.emptyText}>No shift records available.</Text>
              </View>
            ) : (
              filteredShifts.slice(0, entriesPerPage).map((item) => (
                <View key={item.id} style={styles.tableBodyRow}>
                  {/* Row Checkbox */}
                  <TouchableOpacity style={styles.checkboxCell} onPress={() => toggleSelectRow(item.id)}>
                    <View
                      style={[styles.checkboxBox, selectedRows[item.id] && styles.checkboxChecked]}
                    >
                      {selectedRows[item.id] && <Feather name="check" size={12} color="#ffffff" />}
                    </View>
                  </TouchableOpacity>

                  {/* Employee Name & Avatar */}
                  <View style={[styles.tdCell, { width: 180, flexDirection: "row", alignItems: "center" }]}>
                    <View style={styles.tableAvatar}>
                      <Text style={styles.tableAvatarText}>{item.avatarInitials}</Text>
                    </View>
                    <Text style={styles.tableEmployeeName}>{item.employeeName || "—"}</Text>
                  </View>

                  {/* Department */}
                  <View style={[styles.tdCell, { width: 140 }]}>
                    <Text style={styles.tdText}>{item.department || "—"}</Text>
                  </View>

                  {/* Shift */}
                  <View style={[styles.tdCell, { width: 150 }]}>
                    <Text style={styles.tdTextBold}>{item.shiftName || "—"}</Text>
                  </View>

                  {/* Time */}
                  <View style={[styles.tdCell, { width: 130 }]}>
                    <Text style={styles.tdText}>{item.timeRange || "—"}</Text>
                  </View>

                  {/* Start Date */}
                  <View style={[styles.tdCell, { width: 120 }]}>
                    <Text style={styles.tdText}>{item.startDate || "—"}</Text>
                  </View>

                  {/* End Date */}
                  <View style={[styles.tdCell, { width: 120 }]}>
                    <Text style={styles.tdText}>{item.endDate || "—"}</Text>
                  </View>

                  {/* Status Dropdown Pill */}
                  <View style={[styles.tdCell, { width: 120 }]}>
                    {renderStatusBadge(item.status)}
                  </View>

                  {/* Actions */}
                  <View
                    style={[styles.tdCell, { width: 100, flexDirection: "row", justifyContent: "flex-end" }]}
                  >
                    <TouchableOpacity 
                      style={styles.tableActionIconBtn}
                      onPress={() => setIsAssignModalOpen(true)}
                    >
                      <Feather name="edit-3" size={13} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tableActionIconBtn, { marginLeft: 6 }]}>
                      <Feather name="trash-2" size={13} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* DYNAMIC ASSIGN SHIFT MODAL */}
      {/* <AssignShiftModal
        visible={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => fetchShiftRecords()}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerSub: { fontSize: 12, color: "#64748b" },
  createDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createDropdownText: { fontSize: 13, fontWeight: "600", color: "#1e293b", marginRight: 4 },
  contentScroll: { flex: 1 },
  metricsContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    minWidth: 170,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#64748b", letterSpacing: 0.5 },
  statNumber: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginVertical: 2 },
  statSubText: { fontSize: 11, color: "#94a3b8" },
  topToolbarWrapper: { backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  topToolbarScrollContent: { paddingHorizontal: 16, paddingVertical: 10 },
  topToolbar: { flexDirection: "row", alignItems: "center", gap: 12 },
  filterTriggerGroup: { flexDirection: "row", alignItems: "center" },
  filterTitleLabel: { fontSize: 13, fontWeight: "600", color: "#475569", marginRight: 6 },
  filterIconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeFilterBadge: { borderColor: "#bfdbfe", backgroundColor: "#eff6ff" },
  activeFilterText: { fontSize: 12, color: "#1e293b" },
  toolbarRightGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 32,
    width: 200,
  },
  searchInputText: { flex: 1, fontSize: 12, color: "#0f172a", paddingVertical: 0 },
  showTextLabel: { fontSize: 12, color: "#64748b" },
  showEntriesSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  showEntriesText: { fontSize: 12, color: "#1e293b", marginRight: 4 },
  totalBadgeBox: { backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  totalBadgeText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  moreActionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  moreActionsText: { fontSize: 12, fontWeight: "600", color: "#ffffff" },
  tableContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  checkboxCell: { width: 32, alignItems: "center", justifyContent: "center" },
  checkboxBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  thCell: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 4 },
  thText: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  tableBodyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tdCell: { paddingHorizontal: 4, justifyContent: "center" },
  tdText: { fontSize: 13, color: "#334155" },
  tdTextBold: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  tableAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  tableAvatarText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  tableEmployeeName: { fontSize: 13, fontWeight: "600", color: "#0f172a", flex: 1 },
  tableStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a", marginRight: 4 },
  statusTextGreen: { fontSize: 12, fontWeight: "600", color: "#16a34a" },
  statusDotRed: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444", marginRight: 4 },
  statusTextRed: { fontSize: 12, fontWeight: "600", color: "#ef4444" },
  statusDotYellow: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#eab308", marginRight: 4 },
  statusTextYellow: { fontSize: 12, fontWeight: "600", color: "#ca8a04" },
  tableActionIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderBox: { padding: 400, alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 13, color: "#64748b" },
  emptyCard: { padding: 400, alignItems: "center" },
  emptyText: { marginTop: 8, fontSize: 13, color: "#94a3b8" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalFilterMenuBox: { width: "80%", backgroundColor: "#ffffff", borderRadius: 8, padding: 16 },
  modalCompactMenuBox: { width: 220, backgroundColor: "#ffffff", borderRadius: 8, padding: 12 },
  modalTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 12 },
  dropdownOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownOptionSelected: { backgroundColor: "#f0f9ff" },
  dropdownOptionText: { fontSize: 13, color: "#334155" },
  dropdownOptionTextActive: { color: "#2563eb", fontWeight: "600" },
  menuOverlayTap: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  createMenuBox: {
    position: "absolute",
    top: 55,
    right: 16,
    width: 150,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 8,
    elevation: 4,
  },
  menuOptionRow: { paddingVertical: 8, paddingHorizontal: 12 },
  menuOptionText: { fontSize: 13 },
});