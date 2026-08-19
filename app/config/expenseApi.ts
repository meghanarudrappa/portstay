import { API_BASE_URL } from './api';

const handleResponse = async (response: Response) => {
  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP Error Status: ${response.status}\nServer logs: ${rawText.slice(0, 250)}`);
  }
  try {
    return JSON.parse(rawText);
  } catch {
    return rawText; 
  }
};

export const expenseService = {

  /**
   * GET /travel-expenses-formPage
   * Production-grade extraction engine that securely maps active backend user session state properties.
   */
  getFormInitializationMetadata: async (): Promise<{ employeeName: string; department: string }> => {
    const response = await fetch(`${API_BASE_URL}/travel-expenses-formPage`, {
      method: 'GET',
      credentials: 'include', // Mandates mobile layers to propagate JSESSIONID session markers
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      }
    });

    const htmlText = await response.text();
    if (!response.ok) {
      throw new Error(`Failed to synchronize host metadata connection logs. Status: ${response.status}`);
    }

    // Direct Extraction Layer: Scans raw bean values loaded into the JSP form input elements natively
    const nameRegex = /name=["']employeeName["'][^>]*value=["']([^"']+)["']/i;
    const nameRegexReverse = /value=["']([^"']+)["']/i;
    
    let employeeName = '';
    const matchNormal = nameRegex.exec(htmlText);
    const matchReverse = nameRegexReverse.exec(htmlText);

    if (matchNormal) {
      employeeName = matchNormal[1];
    } else if (matchReverse) {
      employeeName = matchReverse[1];
    }

    // Direct Department Pull
    const deptRegex = /<select[^>]*name=["']department["'][^>]*>[\s\S]*?<option[^>]*value=["']([^"']+)["'][^>]*selected/i;
    const deptMatch = deptRegex.exec(htmlText);
    const department = deptMatch ? deptMatch[1] : 'Operations';

    // Protect application state execution from processing un-evaluated JSP literal strings
    if (!employeeName || employeeName.trim() === '' || employeeName.includes('${')) {
      throw new Error('UNAUTHENTICATED_SESSION');
    }

    return { employeeName, department };
  },

  /**
   * POST /save-travel-expenses
   * Compiles flat structures and maps array items precisely to fit Spring's @ModelAttribute parser.
   */
  saveTravelExpenseClaim: async (expenseData: any, attachedFiles: { name: string; uri: string }[]) => {
    const formData = new FormData();

    // 1. Core Model Variable Assignment
    formData.append('expenseReferenceNo', expenseData.expenseReferenceNo || '');
    formData.append('employeeName', expenseData.employeeName || '');
    formData.append('department', expenseData.department || '');
    formData.append('claimDate', expenseData.claimDate || '');
    formData.append('expenseCategory', expenseData.expenseCategory || '');
    formData.append('billNumber', expenseData.billNumber || ''); 
    formData.append('vendorName', expenseData.vendorName || ''); 
    formData.append('paymentMode', expenseData.paymentMode || '');
    formData.append('remarks', expenseData.remarks || '');
    formData.append('Adjustments', String(expenseData.adjustment || '0.00'));

    // 2. Base Financial Balance Properties (Hidden web fields mapping equivalent)
    formData.append('subTotal', String(expenseData.subTotal || '0.00'));
    formData.append('totalTax', String(expenseData.totalTax || '0.00'));
    formData.append('grandTotal', String(expenseData.grandTotal || '0.00')); 

    // 3. Structural Row Conversion: Maps array logs into explicit bracket property paths
    const nestedLines = expenseData.lineItems || [];
    nestedLines.forEach((item: any, index: number) => {
      formData.append(`expenseItems[${index}].expenseDate`, String(item.expenseDate || ''));
      formData.append(`expenseItems[${index}].category`, String(item.category || ''));
      formData.append(`expenseItems[${index}].description`, String(item.description || ''));
      formData.append(`expenseItems[${index}].amount`, String(item.amount || '0.00'));
      formData.append(`expenseItems[${index}].taxAmount`, String(item.taxAmount || '0.00'));
      formData.append(`expenseItems[${index}].totalAmount`, String(item.totalAmount || '0.00'));
    });

    // 4. Multi-media file processing mapped to request parameter "attachmentFiles"
    if (attachedFiles && attachedFiles.length > 0) {
      attachedFiles.forEach((file) => {
        const mimeType = file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        formData.append('attachmentFiles', {
          uri: file.uri,
          name: file.name,
          type: mimeType,
        } as any);
      });
    }

    const response = await fetch(`${API_BASE_URL}/save-travel-expenses`, {
      method: 'POST',
      credentials: 'include', // Transmits session identifiers seamlessly
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
    
    return handleResponse(response);
  },

  /**
   * GET /mobile-travel-expenses-home
   * UPDATED: Targets your clean mobile Spring Boot endpoint mapping and returns the raw Map structure object.
   */
  getTravelExpenseDetailsList: async (): Promise<any> => {
    try {
      console.log(`📡 [API SERVICE] Fetching from: ${API_BASE_URL}/mobile-travel-expenses-home`);
      const response = await fetch(`${API_BASE_URL}/mobile-travel-expenses-home`, {
        method: 'GET',
        credentials: 'include', // Retains cookies / JSESSIONID validation context
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error fetching mobile dashboard layout! Status: ${response.status}`);
      }
      
      const jsonResponse = await response.json();
      return jsonResponse; // Returns your Java Map containing { success: true, travelExpenseClaims: [...] }
    } catch (error) {
      console.error("Error inside getTravelExpenseDetailsList API stream:", error);
      return { success: false, travelExpenseClaims: [] };
    }
  },

  /**
   * GET /get-travelExpense-details?id=...
   * Appends session tokens and maps HTML string outputs back into actionable JSON records.
   */
  getTravelExpenseSingleDetail: async (targetExpenseId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-travelExpense-details?id=${targetExpenseId}`, {
        method: 'GET',
        credentials: 'include', // Transmits session cookies so the server doesn't redirect to login HTML
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const htmlText = await response.text();

      // Look for the embedded JSON structure if the server renders details inside a script variable tag
      const jsonEmbedRegex = /travelExpenseDetails\s*=\s*([^;]+);/i;
      const jsonMatch = jsonEmbedRegex.exec(htmlText);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      try {
        return JSON.parse(htmlText);
      } catch {
        return {
          id: targetExpenseId,
          rawHtmlContent: htmlText,
          isHtmlWrapped: true
        };
      }
    } catch (error) {
      console.error(`Error fetching expense details for ID ${targetExpenseId}:`, error);
      throw error;
    }
  }
};