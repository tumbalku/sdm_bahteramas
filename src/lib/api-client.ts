export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Jika body adalah FormData, jangan set Content-Type header agar browser otomatis set boundary
  if (options.body instanceof FormData) {
    delete defaultHeaders["Content-Type"];
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Terjadi kesalahan pada server",
      };
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      message: data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghubungi server",
    };
  }
}
