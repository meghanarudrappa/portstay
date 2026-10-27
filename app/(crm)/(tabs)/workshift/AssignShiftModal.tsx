// File: components/workshifts/AssignShiftModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { API_BASE_URL } from "@/app/config/api";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DynamicUser {
  id?: string;
  name: string;
  email: string;
  department?: string;
}

interface DynamicShift {
  id: string;
  name: string;
  timeRange?: string;
}

interface AssignShiftModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignShiftModal({
  visible,
  onClose,
  onSuccess,
}: AssignShiftModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form States
  const [targetType, setTargetType] = useState<"Employees" | "Department">("Employees");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  // Dropdown visibility toggles
  const [shiftDropdownOpen, setShiftDropdownOpen] = useState<boolean>(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEmployees, setSelectedEmployees] = useState<DynamicUser[]>([]);

  // Date Picker States
  const [fromDateObj, setFromDateObj] = useState<Date | null>(null);
  const [toDateObj, setToDateObj] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState<boolean>(false);
  const [showToPicker, setShowToPicker] = useState<boolean>(false);

  const [remarks, setRemarks] = useState<string>("");

  // Dynamic Server Data
  const [employeeOptions, setEmployeeOptions] = useState<DynamicUser[]>([]);
  const [shiftOptions, setShiftOptions] = useState<DynamicShift[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      fetchFormData();
    } else {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setSelectedEmployees([]);
    setSearchQuery("");
    setSelectedShift("");
    setSelectedDepartment("");
    setFromDateObj(null);
    setToDateObj(null);
    setShowFromPicker(false);
    setShowToPicker(false);
    setRemarks("");
    setShiftDropdownOpen(false);
    setDeptDropdownOpen(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const handleFromDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowFromPicker(Platform.OS === "ios");
    if (selectedDate) {
      setFromDateObj(selectedDate);
    }
  };

  const handleToDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowToPicker(Platform.OS === "ios");
    if (selectedDate) {
      setToDateObj(selectedDate);
    }
  };

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/open-assign-shift-form-mobile?type=empShift`,
        {
          credentials: "include",
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // 1. Process Dynamic Shifts from Backend
        if (Array.isArray(data.shiftList)) {
          const dynamicShifts: DynamicShift[] = data.shiftList.map((item: any) => ({
            id: item.id || item._id || item.shiftId || item.taskActivityId || "",
            name: item.taskName || item.shiftName || item.name || "Unnamed Shift",
            timeRange:
              item.formattedCheckIn && item.formattedCheckOut
                ? `(${item.formattedCheckIn} - ${item.formattedCheckOut})`
                : item.startTime && item.endTime
                ? `(${item.startTime} - ${item.endTime})`
                : "",
          }));

          setShiftOptions(dynamicShifts);
          if (dynamicShifts.length > 0) {
            setSelectedShift(dynamicShifts[0].id);
          }
        }

        // 2. Process Dynamic Employees and Extract Departments
        if (Array.isArray(data.teamList)) {
          // Backend Department Mapping (Mirrors your Java controller's teamMap logic)
          const teamMap: Record<string, string> = {
            HumanResources: "Human Resources",
            IT_Helpdesk: "IT Management",
            Support: "Customer Support",
            CRM: "Sales",
            Operations: "Operation",
          };

          const dynamicUsers: DynamicUser[] = data.teamList.map((u: any) => {
            // Check all potential keys: aboutTeam, teamName, department, etc.
            const rawDept =
              u.aboutTeam ||
              u.teamName ||
              (typeof u.department === "string" ? u.department : u.department?.name) ||
              u.dept ||
              u.departmentName ||
              "";

            // Map key to display name if present in teamMap
            const mappedDept = teamMap[rawDept] || rawDept;

            return {
              id: u.id || u.userId || u._id || "",
              name:
                u.name ||
                u.fullName ||
                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                "Unknown User",
              email: u.email || u.userEmail || "",
              department: mappedDept,
            };
          });

          setEmployeeOptions(dynamicUsers);

          // Extract unique non-empty departments dynamically
          let extractedDepts: string[] = [];
          if (Array.isArray(data.departmentList)) {
            extractedDepts = data.departmentList.map((d: any) =>
              typeof d === "string" ? teamMap[d] || d : d.name || d.departmentName || ""
            );
          } else if (Array.isArray(data.departments)) {
            extractedDepts = data.departments.map((d: any) =>
              typeof d === "string" ? teamMap[d] || d : d.name || d.departmentName || ""
            );
          } else {
            extractedDepts = Array.from(
              new Set(
                dynamicUsers
                  .map((u) => u.department)
                  .filter((dept): dept is string => Boolean(dept && String(dept).trim() !== ""))
              )
            );
          }

          setDepartmentOptions(extractedDepts);
          if (extractedDepts.length > 0) {
            setSelectedDepartment(extractedDepts[0]);
          }
        }
      } else {
        Alert.alert("Error", "Failed to retrieve configuration settings from server.");
      }
    } catch (err) {
      console.error("[DEBUG] Error fetching shift assignment data:", err);
      Alert.alert("Connection Error", "Failed to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectEmployee = (emp: DynamicUser) => {
    const exists = selectedEmployees.some((e) => e.email === emp.email);
    if (exists) {
      setSelectedEmployees((prev) => prev.filter((e) => e.email !== emp.email));
    } else {
      setSelectedEmployees((prev) => [...prev, emp]);
    }
  };

  const removeEmployeeChip = (email: string) => {
    setSelectedEmployees((prev) => prev.filter((e) => e.email !== email));
  };

  const filteredEmployees = employeeOptions.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedShift) {
      Alert.alert("Validation Error", "Please select a shift.");
      return;
    }

    if (targetType === "Employees" && selectedEmployees.length === 0) {
      Alert.alert("Validation Error", "Please select at least one employee.");
      return;
    }

    if (targetType === "Department" && !selectedDepartment) {
      Alert.alert("Validation Error", "Please select a department.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shiftId: selectedShift,
        targetType: targetType.toLowerCase(),
        department: targetType === "Department" ? selectedDepartment : undefined,
        employees: targetType === "Employees" ? selectedEmployees.map((e) => e.email) : [],
        effectiveFrom: formatDate(fromDateObj),
        effectiveTo: formatDate(toDateObj),
        remarks,
      };

      const response = await fetch(`${API_BASE_URL}/save-assigned-shift`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", "Shift assigned successfully!");
        onSuccess();
        onClose();
      } else {
        Alert.alert("Submission Error", "Failed to assign shift. Please try again.");
      }
    } catch (err) {
      console.error("[DEBUG] Shift submission error:", err);
      Alert.alert("Error", "Network error occurred while submitting assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentShiftLabel = shiftOptions.find((s) => s.id === selectedShift);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.iconBadge}>
                <Feather name="clock" size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.titleText}>Assign Shift</Text>
                <Text style={styles.subtitleText}>Assign employees to work schedules</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading shift configuration details...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* SHIFT SELECTION */}
              <Text style={styles.sectionHeader}>SHIFT DETAILS</Text>
              <Text style={styles.label}>
                Shift <Text style={styles.required}>*</Text>
              </Text>

              {/* Shift Dropdown */}
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setShiftDropdownOpen(!shiftDropdownOpen)}
              >
                <Text style={styles.dropdownValueText}>
                  {currentShiftLabel
                    ? `${currentShiftLabel.name} ${currentShiftLabel.timeRange || ""}`.trim()
                    : "Select Shift"}
                </Text>
                <Feather
                  name={shiftDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#64748b"
                />
              </TouchableOpacity>

              {shiftDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {shiftOptions.length === 0 ? (
                    <Text style={styles.placeholderText}>No active shifts available.</Text>
                  ) : (
                    shiftOptions.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.dropdownOption,
                          selectedShift === item.id && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedShift(item.id);
                          setShiftDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {item.name} {item.timeRange}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* TARGET SELECTION */}
              <Text style={[styles.sectionHeader, { marginTop: 18 }]}>ASSIGNMENT TARGET</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, targetType === "Employees" && styles.toggleBtnActive]}
                  onPress={() => setTargetType("Employees")}
                >
                  <Feather
                    name="list"
                    size={14}
                    color={targetType === "Employees" ? "#ffffff" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      targetType === "Employees" && styles.toggleBtnTextActive,
                    ]}
                  >
                    Employees
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, targetType === "Department" && styles.toggleBtnActive]}
                  onPress={() => setTargetType("Department")}
                >
                  <Feather
                    name="briefcase"
                    size={14}
                    color={targetType === "Department" ? "#ffffff" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      targetType === "Department" && styles.toggleBtnTextActive,
                    ]}
                  >
                    Department
                  </Text>
                </TouchableOpacity>
              </View>

              {targetType === "Department" ? (
                /* DEPARTMENT DROPDOWN */
                <View>
                  <Text style={styles.label}>Select Department</Text>
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    onPress={() => setDeptDropdownOpen(!deptDropdownOpen)}
                  >
                    <Text style={styles.dropdownValueText}>
                      {selectedDepartment || "No Departments Available"}
                    </Text>
                    <Feather
                      name={deptDropdownOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#64748b"
                    />
                  </TouchableOpacity>

                  {deptDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {departmentOptions.length === 0 ? (
                        <Text style={styles.placeholderText}>No departments found.</Text>
                      ) : (
                        departmentOptions.map((dept) => (
                          <TouchableOpacity
                            key={dept}
                            style={[
                              styles.dropdownOption,
                              selectedDepartment === dept && styles.dropdownOptionActive,
                            ]}
                            onPress={() => {
                              setSelectedDepartment(dept);
                              setDeptDropdownOpen(false);
                            }}
                          >
                            <Text style={styles.dropdownOptionText}>{dept}</Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>
              ) : (
                /* EMPLOYEE SEARCH & LIST */
                <View>
                  <Text style={styles.label}>Select Employees</Text>
                  <View style={styles.searchBox}>
                    <Feather name="search" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search employee by name or email..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.employeeListContainer}>
                    <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                      {filteredEmployees.length === 0 ? (
                        <View style={{ padding: 12, alignItems: "center" }}>
                          <Text style={styles.placeholderText}>No matching records found.</Text>
                        </View>
                      ) : (
                        filteredEmployees.map((emp) => {
                          const isSelected = selectedEmployees.some((e) => e.email === emp.email);
                          return (
                            <TouchableOpacity
                              key={emp.email}
                              style={[styles.employeeRow, isSelected && styles.employeeRowSelected]}
                              onPress={() => toggleSelectEmployee(emp)}
                            >
                              <Text style={styles.employeeNameText}>
                                {emp.name} <Text style={styles.emailSubText}>- ({emp.email})</Text>
                              </Text>
                              {isSelected && <Feather name="check" size={16} color="#3b82f6" />}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>

                  {/* SELECTED CHIPS */}
                  <Text style={styles.label}>Selected Employees</Text>
                  <View style={styles.chipWrapper}>
                    {selectedEmployees.length === 0 ? (
                      <Text style={styles.placeholderText}>No employees selected</Text>
                    ) : (
                      selectedEmployees.map((emp) => (
                        <View key={emp.email} style={styles.selectedChip}>
                          <Text style={styles.selectedChipText}>
                            {emp.name} ({emp.email})
                          </Text>
                          <TouchableOpacity onPress={() => removeEmployeeChip(emp.email)}>
                            <Feather name="x" size={12} color="#ffffff" style={{ marginLeft: 6 }} />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}

              {/* DURATION / DATE PICKERS */}
              <Text style={[styles.sectionHeader, { marginTop: 18 }]}>DURATION</Text>
              <View style={styles.dateRow}>
                {/* EFFECTIVE FROM */}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Effective From</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowFromPicker(true)}
                  >
                    <Text style={fromDateObj ? styles.dateText : styles.datePlaceholder}>
                      {fromDateObj ? formatDate(fromDateObj) : "mm/dd/yyyy"}
                    </Text>
                    <Feather name="calendar" size={16} color="#64748b" />
                  </TouchableOpacity>

                  {showFromPicker && (
                    <DateTimePicker
                      value={fromDateObj || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      onChange={handleFromDateChange}
                    />
                  )}
                </View>

                {/* EFFECTIVE TO */}
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Effective To</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowToPicker(true)}
                  >
                    <Text style={toDateObj ? styles.dateText : styles.datePlaceholder}>
                      {toDateObj ? formatDate(toDateObj) : "mm/dd/yyyy"}
                    </Text>
                    <Feather name="calendar" size={16} color="#64748b" />
                  </TouchableOpacity>

                  {showToPicker && (
                    <DateTimePicker
                      value={toDateObj || new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      onChange={handleToDateChange}
                      minimumDate={fromDateObj || undefined}
                    />
                  )}
                </View>
              </View>

              {/* REMARKS */}
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={styles.textArea}
                multiline={true}
                numberOfLines={3}
                placeholder="Add optional notes..."
                value={remarks}
                onChangeText={setRemarks}
                placeholderTextColor="#94a3b8"
              />
            </ScrollView>
          )}

          {/* Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleSubmit}
              disabled={submitting || loading}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.createText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitleText: {
    fontSize: 12,
    color: "#64748b",
  },
  closeBtn: {
    padding: 6,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748b",
  },
  scrollBody: {
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  required: {
    color: "#ef4444",
  },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
  },
  dropdownValueText: {
    fontSize: 14,
    color: "#1e293b",
  },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    maxHeight: 360,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownOptionActive: {
    backgroundColor: "#eff6ff",
  },
  dropdownOptionText: {
    fontSize: 13,
    color: "#334155",
  },
  placeholderText: {
    fontSize: 13,
    color: "#94a3b8",
    fontStyle: "italic",
    padding: 8,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: "#3b82f6",
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },
  toggleBtnTextActive: {
    color: "#ffffff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f8fafc",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1e293b",
  },
  employeeListContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  employeeRowSelected: {
    backgroundColor: "#eff6ff",
  },
  employeeNameText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
  },
  emailSubText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "400",
  },
  chipWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedChipText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
  },
  dateText: {
    fontSize: 13,
    color: "#1e293b",
  },
  datePlaceholder: {
    fontSize: 13,
    color: "#94a3b8",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    textAlignVertical: "top",
    minHeight: 65,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  closeFooterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  closeFooterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  createBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  createText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});