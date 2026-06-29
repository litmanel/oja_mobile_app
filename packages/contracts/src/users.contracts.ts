// ── Auth: OTP Request ──
export interface OtpRequestBody {
  phone_number: string;
  email: string;
}

export interface OtpRequestResponse {
  success: true;
  data: {
    message: string;
    expires_in: number;
  };
}

// ── Auth: OTP Verify ──
export interface OtpVerifyBody {
  phone_number: string;
  otp: string;
  role: 'vendor' | 'buyer';
}

export interface OtpVerifyResponse {
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
    vendor_id: string;
    is_new_vendor: boolean;
  };
}

// ── Auth: Refresh ──
export interface RefreshBody {
  refresh_token: string;
}

export interface RefreshResponse {
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

// ── Auth: Logout ──
export interface LogoutResponse {
  success: true;
  data: {
    message: string;
  };
}

// ── Auth: Error ──
export interface AuthErrorResponse {
  success: false;
  error: string;
}

// ── User DTO ──
export interface UserDto {
  id: string;
  phone: string;
  display_name: string;
  role: 'vendor' | 'buyer' | 'admin';
}
