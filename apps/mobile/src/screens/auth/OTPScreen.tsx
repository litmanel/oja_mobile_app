import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type AuthStackParamList = {
  PhoneEntry: undefined;
  OTP: { phoneNumber: string; email: string };
};

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OTPScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { phoneNumber, email } = route.params;
  const setAuth = useAuthStore((s) => s.setAuth);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = useCallback(
    (text: string, index: number) => {
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned.length > 1) {
        // Handle paste — spread digits across boxes
        const pasted = cleaned.slice(0, OTP_LENGTH).split('');
        const newDigits = [...digits];
        pasted.forEach((d, i) => {
          if (index + i < OTP_LENGTH) {
            newDigits[index + i] = d;
          }
        });
        setDigits(newDigits);
        const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        return;
      }

      const newDigits = [...digits];
      newDigits[index] = cleaned;
      setDigits(newDigits);
      setError('');

      // Auto-advance
      if (cleaned && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError(t('otp_invalid'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: response } = await apiClient.post('/auth/otp/verify', {
        phone_number: phoneNumber,
        otp,
        role: 'vendor',
      });

      const { access_token, refresh_token, vendor_id, is_new_vendor } = response.data;

      await setAuth({
        accessToken: access_token,
        refreshToken: refresh_token,
        role: 'vendor',
        vendorId: vendor_id,
        isNewVendor: is_new_vendor,
      });

      // Navigation is handled by RootNavigator watching auth state
    } catch (err: any) {
      const serverError = err?.response?.data?.error;
      if (serverError?.toLowerCase().includes('expired')) {
        setError(t('otp_expired'));
      } else if (serverError?.toLowerCase().includes('invalid')) {
        setError(t('otp_invalid'));
      } else {
        setError(t('otp_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      await apiClient.post('/auth/otp/request', {
        phone_number: phoneNumber,
        email,
      });
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError(t('auth_rate_limited'));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('otp_title')}</Text>
        <Text style={styles.helper}>{t('otp_helper', { email })}</Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpBox, error ? styles.otpBoxError : null]}
              keyboardType="number-pad"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              value={digit}
              onChangeText={(text) => handleDigitChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              textContentType="oneTimeCode"
              autoComplete={index === 0 ? 'sms-otp' : 'off'}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyText}>{t('otp_verify')}</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={cooldown > 0}
          style={styles.resendButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
            {cooldown > 0
              ? t('otp_resend_countdown', { time: formatCountdown(cooldown) })
              : t('otp_resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  helper: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 32,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  otpBoxError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
  verifyButton: {
    height: 52,
    backgroundColor: '#059669',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});
