import { Platform } from 'react-native';

// Your secure global tunnel route pointing to the backend machine
const DEV_API_URL = 'http://192.168.1.25:8080';
const PROD_API_URL = 'https://portstay.com/'; 
// Replace with the explicit IP address of your workstation on the local network

// Global Simulation Variables matching your Spring Boot Session rules
export const SESSION_MOCK = {
  orgId: 'ORG100234',
  userId: 'USR992834',
  service: 'Operations',
  teamId: 'TEAM0042'
};

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;