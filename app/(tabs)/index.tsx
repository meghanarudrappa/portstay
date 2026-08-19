import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  BackHandler,
  ImageBackground,
  TextStyle, // <-- ADD THIS
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context/ContextSession';
import { StatusBar } from 'expo-status-bar';
import { useDoubleTapToExit } from '@/hooks/useDoubleTapToExit';
import { API_BASE_URL } from '../config/api'; // Adjust the relative folder path as needed

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { getSessionDetails } = useSession();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleExit = () => {
    BackHandler.exitApp();
  };

  useDoubleTapToExit(handleExit);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employee-login-mobile?workinguserName=` + email, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const passwordRes = await fetch(`${API_BASE_URL}/login-user`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await passwordRes.json();
      if (response.ok) {
        if (data.validated) {
          try {
            await fetch(`${API_BASE_URL}/login-user-mobile?username=${encodeURIComponent(email)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            getSessionDetails();
            setShowSuccessPopup(true);
            
            setTimeout(() => {
              setShowSuccessPopup(false);
              router.replace('/dashboard'); 
            }, 1500);
          } catch (err) {
            Alert.alert("Error", "Failed to login. Please try again.");
          }
        } else {
          Alert.alert("Error", "Wrong password!!");
        }
      } else {
        Alert.alert("Error", "Wrong email!!");
      }
    }
    //  catch (error) {
      // Alert.alert("Error", "Failed to login. Please try again.");
      catch (error: any) {
      // CHANGE THIS LINE TEMPORARILY:
      Alert.alert("Actual Network Error", error?.message || JSON.stringify(error));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPasswordSubmit = () => {
    if (!forgotEmail) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    Alert.alert("Success", `Verification code sent to: ${forgotEmail}`);
  };

  const renderForgotPasswordScreen = () => (
    <View style={styles.forgotContentWrapper}>
      <View style={styles.forgotBrandSpacer} />
      <View style={styles.forgotGlassCard}>
        <View style={styles.forgotFloatingShieldBadge}>
          <Ionicons name="shield-checkmark" size={26} color="#4f46e5" />
        </View>

        <Text style={styles.forgotHeadingText}>Forgot Your Password?</Text>
        <Text style={styles.forgotInstructionText}>
          We will send a verification code to the email address associated with your account.
        </Text>

        <View style={styles.inlineFormRow}>
          <View style={styles.inlineInputIconPrefix}>
            <Ionicons name="mail" size={16} color="#4f46e5" />
          </View>
          <TextInput
            style={styles.inlineInputField}
            value={forgotEmail}
            onChangeText={setForgotEmail}
            placeholder="Email address"
            placeholderTextColor="#a0aec0"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.inlineSubmitButton} 
            onPress={handleForgotPasswordSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.inlineSubmitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backToLoginWrapper} 
          onPress={() => { 
            setForgotEmail(''); 
            setCurrentScreen('login'); 
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={14} color="#6366f1" style={{ marginRight: 4 }} />
          <Text style={styles.backToLoginText}>Back to Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderLoginScreen = () => (
    <View style={styles.contentWrapper}>
      <View style={styles.brandSpacer} />

      <View style={styles.heroSection}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.welcomeHeading}>Welcome</Text>
          <Text style={styles.welcomeHeading}>Back! 👋</Text>
          <Text style={styles.loginInstruction}>Login to continue to your account</Text>
        </View>
      </View>

      <View style={styles.formGlassCard}>
        <View style={styles.floatingShieldBadge}>
          <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
        </View>

        {/* Email Field */}
        <View style={styles.inputFieldGroup}>
          <Text style={styles.inputCardLabel}>Email</Text>
          <View style={styles.interactiveInputWrapper}>
            <View style={styles.fieldLeftIconBox}>
              <Ionicons name="mail" size={18} color="#6366f1" />
            </View>
            <TextInput
              style={styles.formInputBox}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#a0aec0"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.inputFieldGroup}>
          <Text style={styles.inputCardLabel}>Password</Text>
          <View style={styles.interactiveInputWrapper}>
            <View style={styles.fieldLeftIconBox}>
              <Ionicons name="lock-closed" size={18} color="#6366f1" />
            </View>
            <TextInput
              style={styles.formInputBox}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#a0aec0"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.fieldRightActionBox}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#a0aec0"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember Me & Forgot Password */}
        <View style={styles.formOptionsRow}>
          <TouchableOpacity 
            style={styles.checkboxActionRow} 
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.customCheckbox, rememberMe && styles.customCheckboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={12} color="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentScreen('forgotPassword')}>
            <Text style={styles.forgotPasswordActionText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.primaryActionButton} onPress={handleLogin} activeOpacity={0.8}>
          <View style={styles.submitBtnInnerRow}>
            <Text style={styles.primaryActionText}>Login</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" style={styles.submitArrowIcon} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.securityMetaFooter}>
        <View style={styles.securityBadgeRow}>
          <Ionicons name="checkmark-circle" size={14} color="#2563eb" style={{ marginRight: 6 }} />
          <Text style={styles.securityMetaText}>Your data is 100% secure</Text>
        </View>
        <Text style={styles.copyrightLabelText}>© 2026 Portstay. All rights reserved.</Text>
        <Text style={styles.versionLabelText}>v 1.0.0</Text>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.screenContainer}>
        <StatusBar style="dark" backgroundColor="transparent" translucent={false}/>
        
        {/* The background is now cleanly anchored utilizing standard CSS properties for web */}
        {/* FIX: Typecast inline as ViewStyle to satisfy the internal wrapper's prop requirements */}
        <ImageBackground 
          source={require('./../../assets/images/login-Homepage.png')}
          style={styles.fixedAbsoluteBackground as ViewStyle}
          resizeMode="cover" 
        />

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollLayoutContent,
              keyboardVisible && { paddingBottom: 40 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Standard responsive container added to preserve mobile view dimensions on wide screens */}
            <View style={styles.responsiveCenterWrapper}>
              {currentScreen === 'login' ? renderLoginScreen() : renderForgotPasswordScreen()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modals */}
        <Modal transparent={true} visible={isLoggingIn} animationType="fade">
          <View style={styles.modalBlurOverlay}>
            <View style={styles.modalDisplayCard}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.modalProgressIndicatorLabel}>Logging in...</Text>
            </View>
          </View>
        </Modal>

        <Modal transparent={true} visible={showSuccessPopup} animationType="fade">
          <View style={styles.modalBlurOverlay}>
            <View style={[styles.modalDisplayCard, styles.successModalCardModifier]}>
              <View style={styles.successCircleGlyphBadge}>
                <Ionicons name="checkmark" size={28} color="#ffffff" />
              </View>
              <Text style={styles.successMessageHeadlineText}>Logged in successfully</Text>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f3efff', 
  },
fixedAbsoluteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      web: {
        width: '100%',
        height: '100%',
      },
      default: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      }
    })
  }, 
  scrollLayoutContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveCenterWrapper: {
    width: '100%',
    maxWidth: 480, // Restricts width on Web browsers so layout looks like a clean application card
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  brandSpacer: {
    height: Platform.OS === 'web' ? 40 : SCREEN_HEIGHT * 0.12, 
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  heroTextContainer: {
    flex: 1,
  },
  welcomeHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 38,
  },
  loginInstruction: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  formGlassCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    paddingTop: 36,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
    marginTop: 15, 
    marginBottom: 20,
  },
  floatingShieldBadge: {
    position: 'absolute',
    top: -26,
    left: '50%',
    marginLeft: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputFieldGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  interactiveInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  fieldLeftIconBox: {
    marginRight: 10,
    backgroundColor: '#f0f3ff',
    padding: 6,
    borderRadius: 8,
  },
  fieldRightActionBox: {
    padding: 4,
  },
formInputBox: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    ...Platform.select({
      web: { outlineStyle: 'none' }
    })
  } as TextStyle, // Type explicitly as TextStyle instead of any,
  formOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  checkboxActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  customCheckboxChecked: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  forgotPasswordActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  primaryActionButton: {
    backgroundColor: '#4f46e5',
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitBtnInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitArrowIcon: {
    position: 'absolute',
    right: 4,
  },
  securityMetaFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  securityMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  copyrightLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  versionLabelText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#cbd5e1',
    marginTop: 2,
  },
  modalBlurOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDisplayCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    minWidth: 160,
  },
  modalProgressIndicatorLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  successModalCardModifier: {
    paddingVertical: 24,
    paddingHorizontal: 36,
  },
  successCircleGlyphBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successMessageHeadlineText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '700',
    textAlign: 'center',
  },
  forgotContentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  forgotBrandSpacer: {
    height: SCREEN_HEIGHT * 0.02, 
  },
  forgotGlassCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    paddingTop: 44,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    alignItems: 'center',
  },
  forgotFloatingShieldBadge: {
    position: 'absolute',
    top: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  forgotHeadingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  forgotInstructionText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  inlineFormRow: {
    flexDirection: 'row',
    width: '100%',
    height: 52, 
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14, 
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  inlineInputIconPrefix: {
    paddingLeft: 14,
    paddingRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineInputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    ...Platform.select({
      web: { outlineStyle: 'none' }
    })
  } as TextStyle, // Type explicitly as TextStyle instead of any,
  inlineSubmitButton: {
    backgroundColor: '#4f46e5', 
    height: '100%',
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineSubmitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  backToLoginWrapper: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '700',
  },
});