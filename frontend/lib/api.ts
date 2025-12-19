import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Prevent automatic redirects
  maxRedirects: 0,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login/register pages
    const isAuthPage = typeof window !== 'undefined' && 
      (window.location.pathname === '/login' || window.location.pathname === '/register');
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401 && !isAuthPage) {
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Taxpayer {
  id: string;
  name: string;
  cnic: string;
  contact: string;
  incomeEntries?: IncomeEntry[];
}

export interface IncomeEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  taxpayerId: string;
}

export interface TaxSlab {
  id: number;
  fromAmount: number;
  toAmount: number;
  ratePercent: number;
}

export interface TaxCalculation {
  id: string;
  taxpayerId: string;
  totalIncome: number;
  taxAmount: number;
  calculatedAt: string;
  taxpayer?: Taxpayer;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const url = `${API_BASE_URL}/api/Auth/login`;
      console.log('Making login request to:', url);
      console.log('Request data:', { email: data.email, password: '***' });
      
      const response = await apiClient.post<AuthResponse>('/api/Auth/login', {
        email: data.email,
        password: data.password
      });
      
      console.log('Login response received:', response.status, response.data);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response: token not found');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('Making register request to:', `${API_BASE_URL}/api/Auth/register`);
      const response = await apiClient.post<AuthResponse>('/api/Auth/register', {
        email: data.email,
        password: data.password,
        role: data.role
      });
      console.log('Register response:', response.data);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response: token not found');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Register API error:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  },
};

// Taxpayers API
export const taxpayersApi = {
  getAll: async (): Promise<Taxpayer[]> => {
    const response = await apiClient.get<Taxpayer[]>('/api/taxpayers');
    return response.data;
  },
  getById: async (id: string): Promise<Taxpayer> => {
    const response = await apiClient.get<Taxpayer>(`/api/taxpayers/${id}`);
    return response.data;
  },
  create: async (data: Omit<Taxpayer, 'id' | 'incomeEntries'>): Promise<Taxpayer> => {
    const response = await apiClient.post<Taxpayer>('/api/taxpayers', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Taxpayer>): Promise<void> => {
    await apiClient.put(`/api/taxpayers/${id}`, data);
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/taxpayers/${id}`);
  },
};

// Income Entries API
export const incomeEntriesApi = {
  getByTaxpayerId: async (taxpayerId: string): Promise<IncomeEntry[]> => {
    const response = await apiClient.get<IncomeEntry[]>(`/api/taxpayers/${taxpayerId}/incomes`);
    return response.data;
  },
  create: async (taxpayerId: string, data: Omit<IncomeEntry, 'id' | 'taxpayerId'>): Promise<IncomeEntry> => {
    const response = await apiClient.post<IncomeEntry>(`/api/taxpayers/${taxpayerId}/incomes`, data);
    return response.data;
  },
  update: async (taxpayerId: string, incomeId: string, data: Partial<IncomeEntry>): Promise<void> => {
    await apiClient.put(`/api/taxpayers/${taxpayerId}/incomes/${incomeId}`, data);
  },
  delete: async (taxpayerId: string, incomeId: string): Promise<void> => {
    await apiClient.delete(`/api/taxpayers/${taxpayerId}/incomes/${incomeId}`);
  },
};

// Tax Slabs API
export const taxSlabsApi = {
  getAll: async (): Promise<TaxSlab[]> => {
    const response = await apiClient.get<TaxSlab[]>('/api/taxslabs');
    return response.data;
  },
  create: async (data: Omit<TaxSlab, 'id'>): Promise<TaxSlab> => {
    const response = await apiClient.post<TaxSlab>('/api/taxslabs', data);
    return response.data;
  },
  update: async (id: number, data: Partial<TaxSlab>): Promise<void> => {
    await apiClient.put(`/api/taxslabs/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/taxslabs/${id}`);
  },
};

// Tax Calculations API
export const taxCalculationsApi = {
  calculate: async (taxpayerId: string): Promise<TaxCalculation> => {
    const response = await apiClient.post<TaxCalculation>(`/api/taxpayers/${taxpayerId}/calculate`);
    return response.data;
  },
  getReport: async (taxpayerId: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/taxpayers/${taxpayerId}/report`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

