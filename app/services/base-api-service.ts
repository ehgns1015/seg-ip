import axios, { AxiosRequestConfig } from "axios";

export class BaseApiService {
  protected async request<T, D = unknown>(
    method: string, 
    url: string, 
    data?: D, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url,
        data,
        ...config
      });
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  protected normalizeError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data?.error;
      return new Error(serverError || error.message || "Server error");
    }
    return error instanceof Error ? error : new Error("Unknown error");
  }
  
  handleError(error: unknown): string {
    return this.normalizeError(error).message;
  }
}