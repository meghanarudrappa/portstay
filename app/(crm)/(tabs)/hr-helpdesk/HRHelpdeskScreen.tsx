import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronDown,
  X,
  MessageSquare,
  Settings,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
} from 'lucide-react-native';

// Types
export interface Ticket {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  priority: string;
  category: string;
  assignee: string | null;
  closeDate: string | null;
  status: string;
  ticketType?: string;
  raisedBy?: string;
}

export interface TicketReply {
  id: string;
  senderName: string;
  message: string;
  createdAt: string;
}


const BASE_URL = 'http://192.168.1.25:8080';

export default function HRHelpdeskScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Detail & Form States
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 1. Fetch Ticket List
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/resources-ticketList`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (Array.isArray(data?.data)) {
        setTickets(data.data);
      } else if (Array.isArray(data?.tickets)) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 2. Open Ticket Details
  const handleOpenTicketDetail = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
    setLoadingReplies(true);
    try {
      const response = await fetch(`${BASE_URL}/get-helpdesk-HR-ticket-form?ticketId=${ticket.ticketId}`);
      const data = await response.json();
      setReplies(Array.isArray(data?.replies) ? data.replies : []);
    } catch (error) {
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  // 3. Create Ticket
  const handleCreateTicket = async () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${BASE_URL}/raise-HR-ticket-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          ticketType: selectedTicketType,
          subject,
          description,
        }),
      });
      setIsCreateModalOpen(false);
      fetchTickets();
    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter with safe Array Check
  const filteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return tickets.filter(
      (t) =>
        t?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t?.ticketId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER SECTION */}
      <View className="px-4 py-3 bg-white border-b border-slate-200">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-xl font-bold text-blue-700">HR Helpdesk</Text>
            <Text className="text-xs text-slate-500">Manage and track your HR tickets</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCreateModalOpen(true)}
            className="flex-row items-center border border-slate-300 rounded-md px-3 py-1.5 bg-white"
          >
            <Plus size={14} color="#334155" />
            <Text className="text-slate-700 font-medium text-xs ml-1">Create</Text>
            <ChevronDown size={14} color="#334155" className="ml-1" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row justify-end mt-2">
          <View className="flex-row items-center border border-slate-300 rounded px-2 py-1 w-48 bg-white">
            <TextInput
              placeholder="Search tickets"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-xs text-slate-800 p-0"
              placeholderTextColor="#94A3B8"
            />
            <Search size={14} color="#2563EB" />
          </View>
        </View>
      </View>

      {/* HORIZONTAL & VERTICAL SCROLLABLE TABLE VIEW */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} className="flex-1">
          <View className="w-[750] px-3 pt-3">
            {/* TABLE HEADER */}
            <View className="flex-row border-b border-slate-200 py-2 px-2 bg-white">
              <Text className="w-10 text-emerald-600 font-medium text-xs">▢</Text>
              <Text className="w-20 text-emerald-600 font-bold text-xs">Ticket ID</Text>
              <Text className="w-48 text-emerald-600 font-bold text-xs">Subject</Text>
              <Text className="w-24 text-emerald-600 font-bold text-xs">Priority</Text>
              <Text className="w-28 text-emerald-600 font-bold text-xs">Category</Text>
              <Text className="w-24 text-emerald-600 font-bold text-xs">Assignee</Text>
              <Text className="w-24 text-emerald-600 font-bold text-xs">Close Date</Text>
              <Text className="w-20 text-emerald-600 font-bold text-xs text-center">Status</Text>
            </View>

            {/* TABLE BODY */}
            <FlatList
              data={filteredTickets}
              keyExtractor={(item) => item.ticketId || item.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTickets} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleOpenTicketDetail(item)}
                  className="flex-row items-center border border-slate-200 rounded-md my-1.5 p-3 bg-white shadow-xs"
                >
                  <Text className="w-10 text-emerald-600 text-xs">▢</Text>
                  <Text className="w-20 text-slate-800 text-xs font-medium">{item.ticketId}</Text>
                  <View className="w-48 pr-2">
                    <Text className="text-slate-800 text-xs font-semibold" numberOfLines={1}>
                      {item.subject}
                    </Text>
                    <Text className="text-slate-500 text-[10px]" numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  <Text className={`w-24 text-xs font-medium ${item.priority === 'Medium' ? 'text-amber-500' : 'text-slate-400'}`}>
                    {item.priority || '--'}
                  </Text>
                  <Text className="w-28 text-slate-600 text-xs">{item.category || '--'}</Text>
                  <Text className="w-24 text-slate-400 text-xs">{item.assignee || '--'}</Text>
                  <Text className="w-24 text-slate-400 text-xs">{item.closeDate || '--'}</Text>
                  <View className="w-20 items-center">
                    <View className="bg-sky-400 px-2 py-0.5 rounded text-center">
                      <Text className="text-white text-[11px] font-medium capitalize">{item.status || 'Open'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      )}

      {/* ========================================================= */}
      {/* TICKET DETAIL MODAL (Matching Image #3 Web View) */}
      {/* ========================================================= */}
      <Modal visible={isDetailModalOpen} animationType="slide">
        <SafeAreaView className="flex-1 bg-slate-100">
          <View className="px-4 py-3 bg-white flex-row items-center border-b border-slate-200">
            <TouchableOpacity onPress={() => setIsDetailModalOpen(false)}>
              <ChevronLeft size={20} color="#2563EB" />
            </TouchableOpacity>
            <View className="ml-2">
              <Text className="text-base font-bold text-blue-700">HR Helpdesk</Text>
              <Text className="text-[10px] text-slate-500">
                Manage and track your HR tickets • <Text className="font-bold text-slate-700">{selectedTicket?.raisedBy || 'Don Bosko'}</Text> raised the ticket
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 p-3">
            {/* Left Box: Ticket Description Card */}
            <View className="bg-white p-4 rounded-md border border-slate-200 mb-3">
              <Text className="text-[10px] font-bold text-slate-400 mb-2">DESCRIPTION</Text>
              <Text className="text-sm font-bold text-slate-800">{selectedTicket?.subject}</Text>
            </View>

            {/* Ticket Details Controls Card */}
            <View className="bg-white p-4 rounded-md border border-slate-200 mb-3">
              <Text className="text-xs font-bold text-slate-800 mb-3">Ticket Details</Text>
              <View className="flex-row justify-between mb-3">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-bold text-slate-600 mb-1">PRIORITY</Text>
                  <View className="border border-slate-200 rounded p-2 flex-row justify-between items-center">
                    <Text className="text-xs text-slate-700">{selectedTicket?.priority || '--'}</Text>
                    <ChevronDown size={12} color="#64748B" />
                  </View>
                </View>

                <View className="w-[48%]">
                  <Text className="text-[10px] font-bold text-slate-600 mb-1">TICKET TYPE</Text>
                  <View className="border border-slate-200 rounded p-2 flex-row justify-between items-center">
                    <Text className="text-xs text-slate-700">{selectedTicket?.ticketType || 'Request'}</Text>
                    <ChevronDown size={12} color="#64748B" />
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-bold text-slate-600 mb-1">CATEGORY</Text>
                  <View className="border border-slate-200 rounded p-2 flex-row justify-between items-center">
                    <Text className="text-xs text-slate-700">{selectedTicket?.category || 'Benefits'}</Text>
                    <ChevronDown size={12} color="#64748B" />
                  </View>
                </View>

                <View className="w-[48%]">
                  <Text className="text-[10px] font-bold text-slate-600 mb-1">TICKET STATUS</Text>
                  <View className="border border-slate-200 rounded p-2 flex-row justify-between items-center">
                    <Text className="text-xs text-slate-700">{selectedTicket?.status || 'Open'}</Text>
                    <ChevronDown size={12} color="#64748B" />
                  </View>
                </View>
              </View>
            </View>

            {/* Right Side Reply Box */}
            <View className="bg-white p-4 rounded-md border border-slate-200 mb-6">
              <View className="flex-row items-center mb-2">
                <MessageSquare size={14} color="#2563EB" />
                <Text className="text-xs font-bold text-blue-600 ml-1">Reply</Text>
              </View>

              {/* Text Formatting Toolbar */}
              <View className="border border-slate-200 rounded-t-md p-1.5 bg-blue-50/40 flex-row space-x-3 items-center">
                <Bold size={12} color="#334155" />
                <Italic size={12} color="#334155" />
                <Underline size={12} color="#334155" />
                <List size={12} color="#334155" />
                <ListOrdered size={12} color="#334155" />
              </View>

              <TextInput
                placeholder="Reply here"
                value={replyMessage}
                onChangeText={setReplyMessage}
                multiline
                className="border-x border-b border-slate-200 p-2 text-xs h-20 text-top bg-white"
              />

              <View className="flex-row justify-end space-x-2 mt-2">
                <TouchableOpacity className="bg-sky-500 px-3 py-1 rounded">
                  <Text className="text-white text-xs">Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsDetailModalOpen(false)} className="border border-slate-300 px-3 py-1 rounded">
                  <Text className="text-slate-600 text-xs">Close</Text>
                </TouchableOpacity>
              </View>

              {/* No Replies Placeholder */}
              <View className="items-center justify-center pt-6 pb-2">
                <Text className="text-slate-700 text-xs font-semibold">Replies Not Found For This Ticket</Text>
                <Text className="text-[10px] text-slate-400 mt-0.5">
                  Be The First To Reply. Click On 'Reply' Or <Text className="text-blue-600">Click Here</Text> To Reply
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================= */}
      {/* ADD TICKET MODAL (Matching Image #2 Web Side-Drawer View) */}
      {/* ========================================================= */}
      <Modal visible={isCreateModalOpen} animationType="slide">
        <SafeAreaView className="flex-1 bg-slate-100">
          <View className="p-3 bg-white border-b border-slate-200 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-2">
                <Plus size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-900">Add Ticket</Text>
                <Text className="text-[10px] text-slate-500">Create and manage workplace requests</Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-2">
              <TouchableOpacity className="flex-row items-center border border-slate-300 px-2 py-1 rounded">
                <Settings size={12} color="#334155" />
                <Text className="text-[11px] font-medium text-slate-700 ml-1">Ticket Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-3">
            {/* Form Section */}
            <View className="bg-white p-4 rounded-md border border-slate-200">
              <Text className="text-sm font-bold text-blue-600 mb-3">Ticket Details</Text>

              <View className="flex-row justify-between mb-3">
                <View className="w-[48%]">
                  <Text className="text-xs font-medium text-slate-700 mb-1">Category</Text>
                  <View className="border border-slate-300 rounded p-2 flex-row justify-between items-center bg-white">
                    <TextInput
                      placeholder="--"
                      value={selectedCategory}
                      onChangeText={setSelectedCategory}
                      className="text-xs p-0 text-slate-800 flex-1"
                    />
                    <ChevronDown size={12} color="#64748B" />
                  </View>
                </View>

                <View className="w-[48%]">
                  <Text className="text-xs font-medium text-slate-700 mb-1">Ticket Type</Text>
                  <View className="border border-slate-300 rounded p-2 flex-row justify-between items-center bg-white">
                    <TextInput
                      placeholder="--"
                      value={selectedTicketType}
                      onChangeText={setSelectedTicketType}
                      className="text-xs p-0 text-slate-800 flex-1"
                    />
                    <ChevronDown size={12} color="#64748B" />
                  </View>
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-xs font-medium text-slate-700 mb-1">Subject</Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  className="border border-slate-300 rounded p-2 text-xs bg-white text-slate-800"
                />
              </View>

              <View className="mb-3">
                <Text className="text-xs font-medium text-slate-700 mb-1">Description</Text>
                <View className="border border-slate-300 rounded-t p-1 bg-slate-50 flex-row space-x-2">
                  <Bold size={12} color="#334155" />
                  <Italic size={12} color="#334155" />
                  <Underline size={12} color="#334155" />
                </View>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  className="border-x border-b border-slate-300 p-2 text-xs h-24 text-top bg-white"
                />
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Drawer Bar */}
          <View className="p-3 bg-slate-100 border-t border-slate-200 flex-row justify-end space-x-2">
            <TouchableOpacity onPress={() => setIsCreateModalOpen(false)} className="bg-slate-200 px-4 py-2 rounded">
              <Text className="text-xs text-slate-700 font-medium">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateTicket} className="bg-emerald-600 px-4 py-2 rounded">
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-xs text-white font-medium">Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}