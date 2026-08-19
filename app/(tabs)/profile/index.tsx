import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TextInput,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    StatusBar,
    Alert,
} from 'react-native';
import {
    ChevronRight,
    User,
    Briefcase,
    MapPin,
    GraduationCap,
    FileText,
    CreditCard,
    KeyRound,
    Shield,
    Moon,
    Sun,
    LogOut,
    Bell,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useSession } from '@/context/ContextSession';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../config/api'; 

const BASE_URL = `${API_BASE_URL}`;
const DEFAULT_AVATAR = `${BASE_URL}/resources/img/Profile/default_user_image.png`;

interface PersonalInfoProps {
    profileData: any;
    setProfileData: (d: any) => void;
    onBack: () => void;
    onSave: () => void;
    loading: boolean;
}

function PersonalInfoScreen({
    profileData,
    setProfileData,
    onBack,
    onSave,
    loading,
}: PersonalInfoProps) {
    return (
        <View style={styles.subScreen}>
            {/* Header Navigation */}
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                    <ChevronRight size={22} color="#3B82F6" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.subTitle}>Personal Information</Text>
            </View>

            <ScrollView contentContainerStyle={styles.subScrollContent} showsVerticalScrollIndicator={false}>
                {/* Gender Picker Selection */}
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                    {['Male', 'Female'].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[
                                styles.genderPill,
                                profileData?.gender === g && styles.genderPillActive,
                            ]}
                            onPress={() => setProfileData({ ...profileData, gender: g })}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.genderPillText,
                                    profileData?.gender === g && styles.genderPillTextActive,
                                ]}
                            >
                                {g}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

            
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.fieldBox}>
                    <Text style={styles.fieldValue}>{profileData?.email || '—'}</Text>
                </View>

                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                    style={styles.fieldBox}
                    value={profileData?.phone ?? ''}
                    onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                    placeholder="Enter phone number"
                    placeholderTextColor="#ADB5BD"
                    keyboardType="phone-pad"
                />

                <Text style={styles.fieldLabel}>Address</Text>
                <TextInput
                    style={styles.fieldBox}
                    value={profileData?.address?.area ?? ''}
                    onChangeText={(text) =>
                        setProfileData({
                            ...profileData,
                            address: { ...profileData.address, area: text },
                        })
                    }
                    placeholder="Enter address"
                    placeholderTextColor="#ADB5BD"
                />

                <View style={styles.rowFields}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Country</Text>
                        <TextInput
                            style={styles.fieldBox}
                            value={profileData?.address?.country ?? ''}
                            onChangeText={(text) =>
                                setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, country: text },
                                })
                            }
                            placeholder="Country"
                            placeholderTextColor="#ADB5BD"
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>State</Text>
                        <TextInput
                            style={styles.fieldBox}
                            value={profileData?.address?.state ?? ''}
                            onChangeText={(text) =>
                                setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, state: text },
                                })
                            }
                            placeholder="State"
                            placeholderTextColor="#ADB5BD"
                        />
                    </View>
                </View>

                <View style={styles.rowFields}>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>City</Text>
                        <TextInput
                            style={styles.fieldBox}
                            value={profileData?.address?.city ?? ''}
                            onChangeText={(text) =>
                                setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, city: text },
                                })
                            }
                            placeholder="City"
                            placeholderTextColor="#ADB5BD"
                        />
                    </View>
                    <View style={styles.halfField}>
                        <Text style={styles.fieldLabel}>Zip Code</Text>
                        <TextInput
                            style={styles.fieldBox}
                            value={profileData?.address?.zipcode ?? ''}
                            onChangeText={(text) =>
                                setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, zipcode: text },
                                })
                            }
                            placeholder="Zip Code"
                            placeholderTextColor="#ADB5BD"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
               

                {/* Save Execution Button */}
                <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={loading} activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
// ─────────────────────────────────────────────────────────────────────────────
// BankingScreen
// ─────────────────────────────────────────────────────────────────────────────
function BankingScreen({
    profileData,
    setProfileData,
    onBack,
    onSave,
    loading,
}: {
    profileData: any;
    setProfileData: (d: any) => void;
    onBack: () => void;
    onSave: () => void;
    loading: boolean;
}) {
    const fields: {
        label: string;
        key: string;
        placeholder: string;
        numeric?: boolean;
        caps?: 'none' | 'characters' | 'words' | 'sentences';
    }[] = [
        { label: 'Account Holder Name', key: 'acHolderName', placeholder: 'Enter account holder name' },
        { label: 'Bank Name', key: 'bankName', placeholder: 'Enter bank name' },
        { label: 'IFSC Code', key: 'ifscCode', placeholder: 'Enter IFSC code', caps: 'characters' },
        { label: 'Account Number', key: 'accNo', placeholder: 'Enter account number', numeric: true },
        { label: 'Tax Regime', key: 'taxRegime', placeholder: 'Enter tax regime' },
        { label: 'PAN Number', key: 'panNumber', placeholder: 'Enter PAN number', caps: 'characters' },
    ];

    return (
        <View style={styles.subScreen}>
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <ChevronRight size={22} color="#3B5BDB" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.subTitle}>Bank Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.subScrollContent}>
                {fields.map((field) => (
                    <View key={field.key}>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                        <TextInput
                            style={styles.fieldBox}
                            value={profileData?.[field.key] ?? ''}
                            onChangeText={(text) =>
                                setProfileData({ ...profileData, [field.key]: text })
                            }
                            placeholder={field.placeholder}
                            placeholderTextColor="#ADB5BD"
                            keyboardType={field.numeric ? 'numeric' : 'default'}
                            autoCapitalize={field.caps ?? 'none'}
                        />
                    </View>
                ))}

                <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
interface FullProfileProps {
    profileData: any;
    onBack: () => void;
    onNavigateToEdit: (screen: 'personal' | 'employee' | 'contact' | 'banking') => void;
}

function FullProfileScreen({ profileData, onBack, onNavigateToEdit }: FullProfileProps) {
    const locationText = profileData?.address?.city && profileData?.address?.country
        ? `${profileData.address.city}, ${profileData.address.country}`
        : profileData?.address?.city || profileData?.address?.country || '—';

    return (
        <View style={styles.subScreen}>
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                    <ChevronRight size={22} color="#3B5BDB" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.subTitle}>Full Profile Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.subScrollContent} showsVerticalScrollIndicator={false}>
                
                {/* SECTION 1: PERSONAL */}
                <View style={styles.detailSectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionBlockTitle}>Personal Details</Text>
                        <TouchableOpacity onPress={() => onNavigateToEdit('personal')}>
                            <Text style={styles.inlineEditLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Gender</Text><Text style={styles.detailGridValue}>{profileData?.gender || '—'}</Text></View>
                    </View>
                    <View style={styles.singleDetailBlock}><Text style={styles.detailGridLabel}>Phone Number</Text><Text style={styles.detailGridValue}>{profileData?.phone || '—'}</Text></View>
                    <View style={styles.singleDetailBlock}><Text style={styles.detailGridLabel}>Street Address</Text><Text style={styles.detailGridValue}>{profileData?.address?.area || '—'}</Text></View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Location</Text><Text style={styles.detailGridValue}>{locationText}</Text></View>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Zip Code</Text><Text style={styles.detailGridValue}>{profileData?.address?.zipcode || '—'}</Text></View>
                    </View>
                </View>
                

                {/* SECTION 2: EMPLOYMENT */}
                <View style={styles.detailSectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionBlockTitle}>Employment Details</Text>
                        <TouchableOpacity onPress={() => onNavigateToEdit('employee')}>
                            <Text style={styles.inlineEditLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Employee ID</Text><Text style={styles.detailGridValue}>{profileData?.empNumber || '—'}</Text></View>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Type</Text><Text style={styles.detailGridValue}>{profileData?.empType || '—'}</Text></View>
                    </View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Department</Text><Text style={styles.detailGridValue}>{profileData?.aboutTeam || '—'}</Text></View>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Joining Date</Text><Text style={styles.detailGridValue}>{profileData?.doj || '—'}</Text></View>
                    </View>
                </View>

               

                {/* SECTION 4: BANKING */}
                <View style={styles.detailSectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionBlockTitle}>Financial & Bank Details</Text>
                        <TouchableOpacity onPress={() => onNavigateToEdit('banking')}>
                            <Text style={styles.inlineEditLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Holder Name</Text><Text style={styles.detailGridValue}>{profileData?.acHolderName || '—'}</Text></View>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Bank Name</Text><Text style={styles.detailGridValue}>{profileData?.bankName || '—'}</Text></View>
                    </View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Account Number</Text><Text style={styles.detailGridValue}>{profileData?.accNo || '—'}</Text></View>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>IFSC Code</Text><Text style={styles.detailGridValue}>{profileData?.ifscCode || '—'}</Text></View>
                    </View>
                    <View style={styles.detailGridRow}>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>PAN Card</Text><Text style={styles.detailGridValue}>{profileData?.panNumber || '—'}</Text></View>
                        <View style={styles.detailGridItem}><Text style={styles.detailGridLabel}>Tax Regime</Text><Text style={styles.detailGridValue}>{profileData?.taxRegime || '—'}</Text></View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

// 
// --------------------------
// employeeScreen
// ---------------------
interface EmploymentInfoProps {
    profileData: any;
    setProfileData: (d: any) => void;
    onBack: () => void;
    onSave: () => void;
    loading: boolean;
}
function EmploymentInfoScreen({
    profileData,
    setProfileData,
    onBack,
    onSave,
    loading,
}: EmploymentInfoProps) {
    return (
        <View style={styles.subScreen}>
            {/* Header Navigation */}
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                    <ChevronRight size={22} color="#3B82F6" style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.subTitle}>Employment Information</Text>
            </View>

            <ScrollView contentContainerStyle={styles.subScrollContent} showsVerticalScrollIndicator={false}>
                {/* Employee ID - Read Only Box */}
                <Text style={styles.fieldLabel}>Employee ID</Text>
                <View style={[styles.fieldBox, styles.disabledBox]}>
                    <Text style={styles.disabledFieldValue}>{profileData?.empNumber || '—'}</Text>
                </View>

                {/* Department Info Unit - Read Only Box */}
                <Text style={styles.fieldLabel}>Department</Text>
                <View style={[styles.fieldBox, styles.disabledBox]}>
                    <Text style={styles.disabledFieldValue}>{profileData?.aboutTeam || '—'}</Text>
                </View>

                {/* Date of Joining Display Frame */}
                <Text style={styles.fieldLabel}>Date of Joining</Text>
                <View style={[styles.fieldBox, styles.disabledBox]}>
                    <Text style={styles.disabledFieldValue}>{profileData?.doj || '—'}</Text>
                </View>

                {/* Employee Allocation Framework Picker */}
                <Text style={styles.fieldLabel}>Employee Type</Text>
                {profileData?.empType && profileData.empType !== '' && profileData.empType !== 'null' ? (
                    <View style={[styles.fieldBox, styles.disabledBox]}>
                        <Text style={styles.disabledFieldValue}>{profileData.empType}</Text>
                    </View>
                ) : (
                    <View style={[styles.fieldBox, styles.pickerFieldBox]}>
                        <Picker
                            selectedValue={profileData?.empType ?? null}
                            onValueChange={(value) =>
                                setProfileData({ ...profileData, empType: value })
                            }
                            style={styles.picker}
                            dropdownIconColor="#3B82F6"
                        >
                            <Picker.Item label="Select employee type" value={null} color="#94A3B8" />
                            <Picker.Item label="Full Time" value="Full Time" />
                            <Picker.Item label="Part Time" value="Part Time" />
                            <Picker.Item label="Contract" value="Contract" />
                        </Picker>
                    </View>
                )}

                {/* Save Changes button only enabled if fields can be altered */}
                <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={loading} activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
// Update this line right above your main component
type ActiveScreen = 'main' | 'personal' | 'employee' | 'contact' | 'banking' | 'fullProfile';

export default function ProfileScreen() {
    const router = useRouter();
    const { sessionData } = useSession();

    const [profileData, setProfileData] = useState<any>({
        phone: '',
        address: {
            area: '',
            country: '',
            state: '',
            city: '',
            zipcode: '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [activeScreen, setActiveScreen] = useState<ActiveScreen>('main');
    // Android doesn't support defaultSource on <Image>; track error state for fallback
    const [avatarError, setAvatarError] = useState(false);

    // logout handle logic
     const handleLogout = () => {
       Alert.alert("Logout", "Are you sure you want to log out?", [
           { text: "Cancel", style: "cancel" },
           { text: "Logout", style: "destructive", onPress: () => router.replace("/(tabs)") }
         ]);
   };

    // ── Data loading ──────────────────────────────────────────────────────────
    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/setting-mobile`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setProfileData(data.userObj);
                setAvatarError(false); // reset avatar error on fresh load
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // ── Image upload ──────────────────────────────────────────────────────────
    const uploadProfileImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : 'image';

            const formData = new FormData();
            formData.append('file', { uri: localUri, name: filename, type } as any);

            try {
                const response = await fetch(`${BASE_URL}/user-update-profile-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    body: formData,
                    credentials: 'include',
                });
                if (response.ok) {
                    const imagePath = await response.text();
                    setProfileData({ ...profileData, profile_pic: imagePath });
                    setAvatarError(false);
                } else {
                    console.error('Upload failed with status:', response.status);
                }
            } catch (err) {
                console.error('Error uploading image:', err);
            }
        }
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setLoading(true);
        const formData = new FormData();

        formData.append('doj', profileData.doj ?? '');
        formData.append('gender', profileData.gender ?? '');
        formData.append('empNumber', profileData.empNumber ?? '');
        formData.append('empType', profileData.empType ?? '');
        formData.append('dob', profileData.dob ?? '');
        formData.append('aboutTeam', profileData.aboutTeam ?? '');
        formData.append('phone', profileData.phone ?? '');
        formData.append('accNo', profileData.accNo ?? '');
        formData.append('panNumber', profileData.panNumber ?? '');
        formData.append('bankName', profileData.bankName ?? '');
        formData.append('taxRegime', profileData.taxRegime ?? '');
        formData.append('ifscCode', profileData.ifscCode ?? '');
        formData.append('acHolderName', profileData.acHolderName ?? '');
        formData.append('address.zipcode', profileData.address?.zipcode ?? '');
        formData.append('address.city', profileData.address?.city ?? '');
        formData.append('address.state', profileData.address?.state ?? '');
        formData.append('address.country', profileData.address?.country ?? '');
        formData.append('address.area', profileData.address?.area ?? '');
        formData.append('email', profileData.email ?? '');

        try {
            const response = await fetch(`${BASE_URL}/update-profile`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            });
            await response.json();
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        } catch {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Avatar URI ────────────────────────────────────────────────────────────
    const avatarUri =
        !avatarError && profileData?.profile_pic
             ? `${BASE_URL}/imageController/${profileData.profile_pic}.do`
             : DEFAULT_AVATAR;

    // ── Sub-screen navigation ─────────────────────────────────────────────────
    const subScreenProps = {
        profileData,
        setProfileData,
        onBack: () => setActiveScreen('main'),
        onSave: handleSave,
        loading,
    };

   // Find these lines in your main ProfileScreen component:
    if (activeScreen === 'personal') return <PersonalInfoScreen {...subScreenProps} onBack={() => setActiveScreen('fullProfile')} />;
    if (activeScreen === 'employee') return <EmploymentInfoScreen {...subScreenProps} onBack={() => setActiveScreen('fullProfile')} />;
    // if (activeScreen === 'contact') return <ContactScreen {...subScreenProps} onBack={() => setActiveScreen('fullProfile')} />;
    if (activeScreen === 'banking') return <BankingScreen {...subScreenProps} onBack={() => setActiveScreen('fullProfile')} />;

    // ADD THIS NEW INTERCEPTOR LINE HERE:
    if (activeScreen === 'fullProfile') {
        return (
            <FullProfileScreen 
                profileData={profileData} 
                onBack={() => setActiveScreen('main')} 
                onNavigateToEdit={(targetEditScreen) => setActiveScreen(targetEditScreen)}
            />
        );
    }
    // ── Menu items (only for non-Superadmin) ──────────────────────────────────
    const menuItems =
        sessionData?.role !== 'Superadmin'
            ? [
                  {
                      icon: <User size={18} color="#3B5BDB" />,
                      label: 'Personal Information',
                      sub: 'View and edit your personal details',
                      bg: '#EEF2FF',
                      onPress: () => setActiveScreen('personal'),
                  },
                  {
                      icon: <Briefcase size={18} color="#0CA678" />,
                      label: 'Employment Information',
                      sub: 'View your job details and employment history',
                      bg: '#E6FCF5',
                      onPress: () => setActiveScreen('employee'),
                  },
                //   {
                //       icon: <MapPin size={18} color="#F59F00" />,
                //       label: 'Address',
                //       sub: 'Manage your address details',
                //       bg: '#FFF9DB',
                //       onPress: () => setActiveScreen('contact'),
                //   },

                

                  {
                      icon: <CreditCard size={18} color="#1098AD" />,
                      label: 'Bank Details',
                      sub: 'View and update your bank information',
                      bg: '#E3FAFC',
                      onPress: () => setActiveScreen('banking'),
                  },
                  {
                      icon: <KeyRound size={18} color="#F76707" />,
                      label: 'Change Password',
                      sub: 'Update your account password',
                      bg: '#FFF4E6',
                      onPress: () => router.push('/(tabs)/profile/password'),
                  },
                  
             
              ]
            : [];

    // ── Render location text ──────────────────────────────────────────────────
    const locationText =
        profileData?.address?.city && profileData?.address?.country
            ? `${profileData.address.city}, ${profileData.address.country}`
            : profileData?.address?.city || profileData?.address?.country || '—';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#3B5BDB" translucent={false}/>

            {/* ── Success toast ── */}
            {showSuccessToast && (
                <View style={styles.toast}>
                    <Text style={styles.toastText}>✓  Profile updated successfully</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                {/* ══ Blue header band ══ */}
                <View style={styles.headerBand}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>Profile</Text>
                            <Text style={styles.headerSub}>Manage your profile and preferences</Text>
                        </View>
                        {/* <TouchableOpacity style={styles.bellBtn}>
                            <Bell size={20} color="#fff" />
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* ══ Profile card (overlaps blue band) ══ */}
                <View style={styles.cardWrapper}>
                    <View style={styles.profileCard}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#3B5BDB" style={{ paddingVertical: 32 }} />
                        ) : (
                            <>
                                {/* Avatar + name row */}
                                <View style={styles.profileCardRow}>
                                    <View style={styles.avatarWrap}>
                                        <Image
                                            source={{ uri: avatarUri }}
                                            style={styles.avatar}
                                            onError={() => setAvatarError(true)}
                                        />
                                        <TouchableOpacity
                                            style={styles.cameraBtn}
                                            onPress={uploadProfileImage}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.cameraBtnText}>📷</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.profileInfo}>
                                        <Text style={styles.profileName} numberOfLines={1}>
                                            {profileData?.name || '—'}
                                        </Text>
                                        <Text style={styles.profileRole} numberOfLines={1}>
                                            {profileData?.aboutMe || '—'}
                                        </Text>
                                        {!!profileData?.aboutTeam && (
                                            <View style={styles.deptBadge}>
                                                <Text style={styles.deptText}>🏢 {profileData.aboutTeam}</Text>
                                            </View>
                                        )}
                                        {!!profileData?.empNumber && (
                                            <Text style={styles.empId}>🪪 {profileData.empNumber}</Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.viewProfileBtn}
                                        onPress={() => setActiveScreen('fullProfile')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.viewProfileText}>View Profile</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Contact chips */}
                                <View style={styles.chipRow}>
                                    <View style={styles.chip}>
                                        <Text style={styles.chipIcon}>✉️</Text>
                                        <View style={styles.chipTextCol}>
                                            <Text style={styles.chipValue} numberOfLines={1}>
                                                {profileData?.email || '—'}
                                            </Text>
                                            <Text style={styles.chipLabel}>Email</Text>
                                        </View>
                                    </View>

                                    <View style={styles.chipDivider} />

                                    <View style={styles.chip}>
                                        <Text style={styles.chipIcon}>📱</Text>
                                        <View style={styles.chipTextCol}>
                                            <Text style={styles.chipValue} numberOfLines={1}>
                                                {profileData?.phone || '—'}
                                            </Text>
                                            <Text style={styles.chipLabel}>Mobile</Text>
                                        </View>
                                    </View>

                                    <View style={styles.chipDivider} />

                                    <View style={styles.chip}>
                                        <Text style={styles.chipIcon}>📍</Text>
                                        <View style={styles.chipTextCol}>
                                            <Text style={styles.chipValue} numberOfLines={1}>
                                                {locationText}
                                            </Text>
                                            <Text style={styles.chipLabel}>Location</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* ══ Menu list ══ */}
                    {menuItems.length > 0 && (
                        <View style={styles.menuCard}>
                            {menuItems.map((item, i) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.menuRow,
                                        i < menuItems.length - 1 && styles.menuRowBorder,
                                    ]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                                        {item.icon}
                                    </View>
                                    <View style={styles.menuTextCol}>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        <Text style={styles.menuSub}>{item.sub}</Text>
                                    </View>
                                    <ChevronRight size={18} color="#CBD5E1" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {/* ══ Logout ══ */}
                    <View style={[styles.menuCard, styles.lastCard]}>
                    <TouchableOpacity style={styles.logoutButtonWrapper} onPress={handleLogout} activeOpacity={0.8}>
                        <LogOut size={18} color="#EF4444" style={{ marginRight: 8 }} />
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                    </View>

                    <Text style={styles.versionText}>Version 2.5.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const BLUE = '#3B5BDB';
const BG = '#F1F3F9';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },

    // ── Header band ──────────────────────────────────────────────────────────
    headerBand: {
        backgroundColor: BLUE,
        // tall enough so the card can overlap without exposing the white BG
        paddingBottom: 60,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.72)',
        marginTop: 3,
    },
  

    // ── Card wrapper (pulls up over the blue band) ────────────────────────────
    cardWrapper: {
        marginTop: -52,
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    // ── Profile card ──────────────────────────────────────────────────────────
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    profileCardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarWrap: {
        position: 'relative',
        marginRight: 14,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: '#E7EEFF',
        backgroundColor: '#E9ECEF', // placeholder colour while loading
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    cameraBtnText: {
        fontSize: 11,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    profileRole: {
        fontSize: 13,
        color: BLUE,
        fontWeight: '500',
        marginTop: 2,
    },
    deptBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    deptText: {
        fontSize: 11,
        color: BLUE,
    },
    empId: {
        fontSize: 12,
        color: '#868E96',
        marginTop: 4,
    },
    viewProfileBtn: {
        backgroundColor: '#EEF2FF',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    viewProfileText: {
        fontSize: 12,
        color: BLUE,
        fontWeight: '600',
    },

    // ── Chips ─────────────────────────────────────────────────────────────────
    chipRow: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F1F3F9',
    },
    chip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    chipDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E9ECEF',
        marginHorizontal: 4,
    },
    chipIcon: {
        fontSize: 14,
    },
    chipTextCol: {
        flex: 1,
    },
    chipValue: {
        fontSize: 11,
        color: '#1A1A2E',
        fontWeight: '600',
    },
    chipLabel: {
        fontSize: 10,
        color: '#ADB5BD',
        marginTop: 1,
    },

    // ── Menu card ─────────────────────────────────────────────────────────────
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    lastCard: {
        marginBottom: 4,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    menuIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTextCol: {
        flex: 1,
        marginLeft: 14,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
    },
    menuSub: {
        fontSize: 12,
        color: '#ADB5BD',
        marginTop: 1,
    },

    // ── Theme toggle ──────────────────────────────────────────────────────────
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    themeOptionInactive: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeOptionActive: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeAutoText: {
        fontSize: 12,
        color: '#868E96',
        marginLeft: 4,
    },

    // ── Logout ────────────────────────────────────────────────────────────────
    logoutRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FA5252',
    },
    logoutButtonWrapper: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 16,
        marginHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoutBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#EF4444',
    },

    // ── Version ───────────────────────────────────────────────────────────────
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#ADB5BD',
        marginTop: 8,
    },

    // ── Success toast ─────────────────────────────────────────────────────────
    toast: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        right: 20,
        zIndex: 999,
        backgroundColor: '#2F9E44',
        borderRadius: 10,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    toastText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },

    // ── Modernized Sub-screens Shared Styles ──────────────────────────────────
subScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Modern slate tint for crisp contrast
},
subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24, // Subtle elegant curve at the bottom of the header
    borderBottomRightRadius: 24,
    // Premium soft elevation profiles
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 10,
},
backBtn: {
    width: 42, // Slightly larger touch target
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9', // Clean neutral gray instead of saturated blue tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
},
subTitle: {
    fontSize: 20,
    fontWeight: '800', // Thicker, punchier dynamic hierarchy
    color: '#0F172A',
    letterSpacing: -0.3,
},
subScrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
},


// ── Modernized Form Fields ────────────────────────────────────────────────
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        marginTop: 18,
        textTransform: 'uppercase', 
        letterSpacing: 0.6,
        paddingLeft: 4,
    },
    fieldBox: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5, 
        borderColor: '#E2E8F0',
        borderRadius: 16, 
        paddingHorizontal: 16,
        height: 54, 
        justifyContent: 'center',
        fontSize: 15,
        color: '#0F172A',
        fontWeight: '500',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.01,
        shadowRadius: 2,
    },
    // Dynamically apply this style array style when a TextInput gets focused
    fieldBoxFocused: {
        borderColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    pickerFieldBox: {
        paddingHorizontal: 4,
    },
    picker: {
        height: Platform.OS === 'ios' ? 180 : 54,
        width: '100%',
        color: '#0F172A',
    },
    fieldValue: {
        fontSize: 15,
        color: '#0F172A',
        fontWeight: '500',
    },
    fieldPlaceholder: {
        fontSize: 15,
        color: '#94A3B8',
    },
    disabledBox: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        opacity: 0.8,
    },
    disabledFieldValue: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: '500',
    },
    rowFields: {
        flexDirection: 'row',
        gap: 14,
    },
    halfField: {
        flex: 1,
    },

    // ── Modernized Gender Selectors ───────────────────────────────────────────
    genderRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    genderPill: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    genderPillActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    genderPillText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '600',
    },
    genderPillTextActive: {
        color: '#3B82F6',
        fontWeight: '700',
    },

    // ── Modernized Profile Detail Cards ───────────────────────────────────────
    detailSectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 12,
        marginBottom: 16,
    },
    sectionBlockTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    inlineEditLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3B82F6',
    },
    detailGridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        gap: 12,
    },
    detailGridItem: {
        flex: 1,
    },
    singleDetailBlock: {
        marginBottom: 14,
    },
    detailGridLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailGridValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },

    // ── Premium Primary Save Button ───────────────────────────────────────────
    saveBtn: {
        backgroundColor: '#1E40AF', 
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 36,
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});