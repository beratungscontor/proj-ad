import axios, { AxiosInstance } from 'axios';
import { Employee, EmployeeUpdate, GraphAPIError } from './types';

export class GraphClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(accessToken: string) {
    this.baseURL = process.env.GRAPH_API_ENDPOINT || 'https://graph.microsoft.com/v1.0';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async searchUsers(query: string): Promise<Employee[]> {
    try {
      const response = await this.client.get('/users', {
        params: {
          $filter: `startswith(userPrincipalName,'${query}') or startswith(displayName,'${query}')`,
          $select:
            'id,userPrincipalName,displayName,givenName,surname,mail,mobilePhone,officeLocation,businessPhones,jobTitle,department,companyName,streetAddress,city,state,postalCode,country',
        },
      });
      return response.data.value;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(userId: string): Promise<Employee> {
    try {
      const response = await this.client.get(`/users/${userId}`, {
        params: {
          $select:
            'id,userPrincipalName,displayName,givenName,surname,mail,mobilePhone,officeLocation,businessPhones,jobTitle,department,companyName,streetAddress,city,state,postalCode,country',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(userId: string, updates: EmployeeUpdate): Promise<void> {
    try {
      const payload: any = {};
      
      if (updates.givenName) payload.givenName = updates.givenName;
      if (updates.surname) payload.surname = updates.surname;
      if (updates.displayName) payload.displayName = updates.displayName;
      if (updates.mail) payload.mail = updates.mail;
      if (updates.mobilePhone) payload.mobilePhone = updates.mobilePhone;
      if (updates.businessPhones) payload.businessPhones = updates.businessPhones;
      if (updates.officeLocation) payload.officeLocation = updates.officeLocation;
      if (updates.jobTitle) payload.jobTitle = updates.jobTitle;
      if (updates.department) payload.department = updates.department;
      if (updates.companyName) payload.companyName = updates.companyName;
      if (updates.streetAddress) payload.streetAddress = updates.streetAddress;
      if (updates.city) payload.city = updates.city;
      if (updates.state) payload.state = updates.state;
      if (updates.postalCode) payload.postalCode = updates.postalCode;
      if (updates.country) payload.country = updates.country;

      await this.client.patch(`/users/${userId}`, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setManager(userId: string, managerId: string): Promise<void> {
    try {
      const managerRef = {
        '@odata.id': `${this.baseURL}/users/${managerId}`,
      };
      await this.client.put(`/users/${userId}/manager/$ref`, managerRef);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeManager(userId: string): Promise<void> {
    try {
      await this.client.delete(`/users/${userId}/manager/$ref`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateUserExists(upn: string): Promise<boolean> {
    try {
      const response = await this.client.get('/users', {
        params: {
          $filter: `userPrincipalName eq '${upn}'`,
          $select: 'id',
        },
      });
      return response.data.value.length > 0;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      const graphError: GraphAPIError = error.response.data;
      return new Error(
        `Graph API Error: ${graphError.error.code} - ${graphError.error.message}`
      );
    }
    return new Error(`Graph API Error: ${error.message}`);
  }
}