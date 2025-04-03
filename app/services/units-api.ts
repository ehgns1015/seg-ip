import { BaseApiService } from "./base-api-service";
import type { Unit, FormData } from "@/app/types";

class UnitsApiService extends BaseApiService {
  async getAllUnits(): Promise<Unit[]> {
    return this.request<Unit[]>("get", "/api/units");
  }

  async getUnitByName(name: string): Promise<Unit> {
    return this.request<Unit>("get", `/api/units/${encodeURIComponent(name)}`);
  }

  async createUnit(data: FormData): Promise<Unit> {
    return this.request<Unit, FormData>("post", "/api/units", data);
  }

  async updateUnit(name: string, data: FormData): Promise<Unit> {
    return this.request<Unit, FormData>(
      "put", 
      `/api/units/${encodeURIComponent(name)}`, 
      data
    );
  }

  async deleteUnit(name: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "delete", 
      `/api/units/${encodeURIComponent(name)}`
    );
  }

  async checkIPAvailability(
    ip: string
  ): Promise<{ available: boolean; message: string }> {
    try {
      const response = await this.request<{ message: string }, { ip: string }>(
        "post", 
        "/api/units/check-ip", 
        { ip }
      );
      return { available: true, message: response.message };
    } catch (error) {
      const errorMessage = this.handleError(error);
      return { available: false, message: errorMessage };
    }
  }
}

export const unitsApiService = new UnitsApiService();