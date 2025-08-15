// Provider Data Structure
export interface Provider {
  id: string;
  
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  dateOfBirth: string; // ISO format
  ssn: string; // Encrypted
  
  // Professional Information
  npi: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiration: string;
  deaNumber?: string;
  deaExpiration?: string;
  specialties: string[];
  boardCertifications: BoardCertification[];
  
  // Additional Professional Information
  caqhId?: string; // CAQH credentialing ID
  providerType?: string; // Shorthand like CNP, DO, MD, etc.
  taxonomyCodes?: string[]; // Healthcare taxonomy codes
  hireDate?: string; // Employment start date
  medicareApprovalDate?: string; // Medicare enrollment approval
  medicaidApprovalDate?: string; // Medicaid enrollment approval
  
  // Contact Information
  email: string;
  phone: string;
  cellPhone?: string;
  fax?: string;
  
  // Employment/Practice Information
  practiceType: 'solo' | 'group' | 'hospital' | 'other';
  groupName?: string;
  taxId: string; // Encrypted
  medicareNumber?: string;
  medicaidNumber?: string;
  
  // Education
  medicalSchool: MedicalEducation;
  residency?: MedicalEducation;
  fellowship?: MedicalEducation;
  
  // Additional Information
  languages: string[];
  hospitalAffiliations: HospitalAffiliation[];
  malpracticeInsurance: MalpracticeInsurance;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface BoardCertification {
  board: string;
  specialty: string;
  certificationDate: string;
  expirationDate: string;
}

export interface MedicalEducation {
  name?: string;
  institution?: string;
  specialty?: string;
  degree?: string;
  graduationYear?: string;
  completionYear?: string;
}

export interface HospitalAffiliation {
  name: string;
  privilegeStatus: string;
  startDate: string;
}

export interface MalpracticeInsurance {
  carrier: string;
  policyNumber: string;
  coverageAmount: string;
  expirationDate: string;
}

// Office Location Structure
export interface OfficeLocation {
  id: string;
  locationName: string;
  locationType: 'primary' | 'satellite' | 'hospital' | 'clinic';
  
  // Address Information
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  
  // Contact Information
  mainPhone: string;
  fax?: string;
  appointmentPhone?: string;
  
  // Practice Information
  officeHours: OfficeHours;
  
  // Accessibility
  wheelchairAccessible: boolean;
  publicTransportation?: string;
  parkingInformation?: string;
  
  // Associated Providers
  providerIds: string[];
  
  // Billing Information
  billingNPI?: string;
  placeOfServiceCode?: string;
  
  // Metadata
  isActive: boolean;
  effectiveDate: string;
  terminationDate?: string;
  tags?: string[];
}

export interface OfficeHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // 24hr format
  close: string;
  lunchStart?: string;
  lunchEnd?: string;
}

// Mailing Address Structure
export interface MailingAddress {
  id: string;
  addressName: string;
  addressType: 'correspondence' | 'billing' | 'legal' | 'other';
  
  // Address Information
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contact
  attentionTo?: string;
  department?: string;
  phone?: string;
  
  // Associations
  providerIds?: string[];
  officeIds?: string[];
  
  // Metadata
  isPrimary: boolean;
  isActive: boolean;
  effectiveDate: string;
  tags?: string[];
}

// Template System Types
export interface FieldMapping {
  documentFieldId: string;
  documentFieldName: string;
  documentFieldType: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date';
  sourceType: 'provider' | 'provider-slot' | 'office' | 'mailing' | 'custom' | 'static';
  sourcePath?: string; // JSON path like "provider.npi" or "office.addressLine1" - optional for static values
  staticValue?: any; // Static value to use instead of mapping from data
  transformation?: FieldTransformation;
  defaultValue?: any;
  isRequired: boolean;
  
  // Provider slot support for roster mode
  providerSlot?: number; // Which provider position (1, 2, 3, etc.) for roster mode
  slotField?: string; // Which field from the provider (firstName, lastName, npi, etc.)
}

export interface FieldTransformation {
  type: 'format' | 'concatenate' | 'conditional' | 'lookup' | 'boolean' | 'nameFormat' | 'extract';
  config: any;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  documentType: 'pdf' | 'docx' | 'xlsx';
  documentHash?: string;
  mappings: FieldMapping[];
  conditionalRules?: ConditionalRule[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ConditionalRule {
  condition: string;
  action: 'setValue' | 'hideField' | 'showField';
  value?: any;
}

// Excel Configuration Types
export interface ExcelConfiguration {
  headerRow: number
  dataStartRow: number
  columnMappings: ExcelColumnMapping[]
  sheetName?: string
}

export interface ExcelColumnMapping {
  columnIndex: number
  columnLetter: string
  headerText: string
  mappedField: string | null
  providerFieldPath?: string // e.g., "firstName", "npi", etc.
}

// Document Processing Types
export interface DocumentField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date';
  value?: any;
  required: boolean;
  options?: string[]; // Available options for radio and dropdown fields
  position?: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProcessedDocument {
  id: string;
  originalPath: string;
  outputPath: string;
  template: Template;
  providerId: string;
  officeId?: string;
  mailingAddressId?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  processedAt?: string;
}

// Batch Processing Types
export interface BatchJob {
  id: string;
  name: string;
  documents: ProcessedDocument[];
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'paused' | 'error';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Selection Types
export interface SelectionSet {
  providers: string[];
  offices: string[];
  mailingAddresses: string[];
}

// Validation Types
export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'length' | 'custom';
  config: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    customValidator?: string;
  };
  errorMessage: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Application State Types
export interface AppSettings {
  dataDirectory: string;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'onExit';
  encryptionEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultNamingPattern: string;
}

// Audit Types
export interface AuditLog {
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'fill' | 'export';
  entityType: 'provider' | 'office' | 'document' | 'template';
  entityId: string;
  userId: string;
  details: {
    documentName?: string;
    providerName?: string;
    changesSummary?: string;
  };
}