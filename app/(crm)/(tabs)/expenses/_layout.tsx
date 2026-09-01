import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stack } from 'expo-router';

// --- PRODUCTION FRONTEND DATA CACHE SYSTEM ---
// This context ensures that newly submitted forms are instantly shared with your details screen 
// and dashboard, even before your backend developer's HTML engine re-renders.
export interface TravelExpenseClaim {
  id: string;
  expenseReferenceNo: string;
  employeeName?: string;
  department?: string;
  claimDate?: string;
  expenseCategory?: string;
  billReceiptNo?: string;
  vendorMerchant?: string;
  paymentMode?: string;
  purpose?: string;
  subTotal: number;
  totalTax?: number;
  adjustments?: number;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  attachmentFileName?: string;
  localAttachedFileUri?: string; // Cache local image preview paths here
}

interface ExpensesContextType {
  claims: TravelExpenseClaim[];
  addClaim: (claim: TravelExpenseClaim) => void;
  setClaimsList: (claims: TravelExpenseClaim[]) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export function useExpensesCache() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpensesCache must be utilized cleanly within an ExpensesContext Provider');
  }
  return context;
}

export default function ExpensesSubLayout() {
  const [claims, setClaims] = useState<TravelExpenseClaim[]>([]);

  const addClaim = (newClaim: TravelExpenseClaim) => {
    setClaims((prevClaims) => [newClaim, ...prevClaims]);
  };

  return (
    <ExpensesContext.Provider value={{ claims, addClaim, setClaimsList: setClaims }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#004BCE', // Matching your clean corporate palette selection
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
        }}
      >
        {/* Page 1: Home Dashboard Grid Ledger View */}
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Expenses Dashboard', 
            headerShown: false // Controlled inside layout view natively for exact match
          }} 
        />
        
        {/* Page 2: Create Form Screen View Layout */}
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'New Expense Claim', 
            headerShown: false // Custom form header used for absolute cross-platform parity
          }} 
        />
        
      
        {/* Page 3: Transaction Target Deep Resolution Invoice Display */}
        <Stack.Screen 
          name="details" 
          options={{ 
            title: 'Reimbursement Details',
            headerShown: false, // Visible back-button configuration mapping explicitly back to index
          }} 
        />
      </Stack>
    </ExpensesContext.Provider>
  );
}