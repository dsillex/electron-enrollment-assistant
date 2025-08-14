# Healthcare Provider Enrollment Document Automation System

## Project Overview
Build a comprehensive Electron desktop application that automates the filling of PDF, Word (.docx), and Excel (.xlsx) files for healthcare provider enrollment. The system should read provider and office location data from JSON files and intelligently map this data to various insurance company forms and documents.

## Core Requirements

### 1. Document Processing Capabilities
- **PDF Support**: Read, analyze, and fill both form-fillable and non-fillable PDFs
- **Word Support**: Process .docx files with content controls, bookmarks, and plain text replacement
- **Excel Support**: Read and write to specific cells, handle multiple sheets, preserve formatting
- **Auto-detection**: Automatically identify document type and available fields/regions

### 2. Data Management
- **Provider Data**: Maintain a comprehensive JSON structure for all provider information
- **Office Locations**: Separate JSON structure for physical office addresses
- **Mailing Addresses**: Separate JSON structure for correspondence addresses
- **Flexible Selection**: Allow users to select:
  - Single provider
  - Multiple specific providers (with checkbox selection)
  - All providers at once
  - Single address
  - Multiple addresses
  - All addresses
  - Any combination of providers × addresses

### 3. Template System
- **Visual Field Mapper**: Drag-and-drop interface to map JSON fields to document fields
- **Template Storage**: Save mapping configurations as reusable templates
- **Smart Suggestions**: Auto-suggest mappings based on field names and previous mappings
- **Conditional Logic**: Support if/then rules (e.g., "if provider.type === 'MD' then use field X")
- **Default Values**: Allow setting default values for unmapped fields
- **Field Transformations**: Support data formatting (dates, phone numbers, SSN, etc.)

## Technical Stack

### Core Technologies
```
- Electron: Latest stable version (v28+)
- Frontend Framework: React 18+ with TypeScript
- Build Tool: Vite
- UI Library: Shadcn/ui with Tailwind CSS
- State Management: Zustand
- Form Handling: React Hook Form with Zod validation
```

### Document Processing Libraries
```
- PDF: pdf-lib, pdfjs-dist, pdf-parse
- Word: docxtemplater, mammoth, pizzip
- Excel: exceljs, xlsx (sheetjs)
- OCR (for non-fillable PDFs): tesseract.js
```

### Additional Libraries
```
- File handling: chokidar (file watching), fs-extra
- Data: lodash, date-fns
- Validation: zod
- Drag & Drop: react-dnd
- Virtual scrolling: react-window (for large provider lists)
- JSON editing: monaco-editor or @uiw/react-json-view
```

## Project Structure

```
provider-enrollment-app/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts
│   │   ├── ipc-handlers/      # IPC communication handlers
│   │   ├── document-processors/
│   │   │   ├── pdf-processor.ts
│   │   │   ├── word-processor.ts
│   │   │   └── excel-processor.ts
│   │   ├── database/
│   │   │   ├── providers.ts
│   │   │   └── templates.ts
│   │   └── utils/
│   ├── renderer/              # React app (renderer process)
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── DocumentViewer/
│   │   │   ├── FieldMapper/
│   │   │   ├── ProviderSelector/
│   │   │   ├── AddressSelector/
│   │   │   ├── TemplateManager/
│   │   │   └── BatchProcessor/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── shared/                # Shared types and utilities
│   │   └── types/
│   └── preload/              # Preload scripts
├── data/                      # User data directory
│   ├── providers.json
│   ├── offices.json
│   ├── mailing-addresses.json
│   └── templates/
├── electron-builder.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Data Schema

### Provider Data Structure (providers.json)
```typescript
interface Provider {
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
  boardCertifications: Array<{
    board: string;
    specialty: string;
    certificationDate: string;
    expirationDate: string;
  }>;
  
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
  medicalSchool: {
    name: string;
    graduationYear: string;
    degree: string;
  };
  residency?: {
    institution: string;
    specialty: string;
    completionYear: string;
  };
  fellowship?: {
    institution: string;
    specialty: string;
    completionYear: string;
  };
  
  // Additional Information
  languages: string[];
  hospitalAffiliations: Array<{
    name: string;
    privilegeStatus: string;
    startDate: string;
  }>;
  malpracticeInsurance: {
    carrier: string;
    policyNumber: string;
    coverageAmount: string;
    expirationDate: string;
  };
  
  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // For custom categorization
}

### Office Location Structure (offices.json)
```typescript
interface OfficeLocation {
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
  officeHours: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: {
      open: string; // 24hr format
      close: string;
      lunchStart?: string;
      lunchEnd?: string;
    };
  };
  
  // Accessibility
  wheelchairAccessible: boolean;
  publicTransportation?: string;
  parkingInformation?: string;
  
  // Associated Providers
  providerIds: string[]; // Links to provider.id
  
  // Billing Information
  billingNPI?: string;
  placeOfServiceCode?: string;
  
  // Metadata
  isActive: boolean;
  effectiveDate: string;
  terminationDate?: string;
  tags?: string[];
}

### Mailing Address Structure (mailing-addresses.json)
```typescript
interface MailingAddress {
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
```

## Key Features Implementation

### 1. Data Management Interface

#### Provider Management
```typescript
interface ProviderManagementFeatures {
  // CRUD Operations
  create: () => void; // Add new provider with form validation
  edit: (providerId: string) => void; // Edit existing provider
  duplicate: (providerId: string) => void; // Clone provider as template
  delete: (providerId: string) => void; // Soft delete with confirmation
  archive: (providerId: string) => void; // Archive inactive providers
  
  // Bulk Operations
  importFromCSV: (file: File) => void;
  exportToCSV: (providerIds: string[]) => void;
  bulkEdit: (providerIds: string[], changes: Partial<Provider>) => void;
  
  // Data Validation
  validateNPI: (npi: string) => boolean;
  validateDEA: (dea: string) => boolean;
  validateLicense: (license: string, state: string) => boolean;
}
```

#### Office & Address Management
```typescript
interface LocationManagementFeatures {
  // Office Management
  addOffice: () => void;
  editOffice: (officeId: string) => void;
  linkProvidersToOffice: (officeId: string, providerIds: string[]) => void;
  unlinkProvidersFromOffice: (officeId: string, providerIds: string[]) => void;
  
  // Address Management  
  addMailingAddress: () => void;
  editMailingAddress: (addressId: string) => void;
  setAsPrimary: (addressId: string) => void;
  
  // Bulk Operations
  importLocations: (file: File) => void;
  mergeDBuplicateLocations: () => void;
}
```

#### Data Editor UI Components
```typescript
// Provider Editor Modal/Panel
interface ProviderEditorProps {
  mode: 'create' | 'edit' | 'duplicate';
  provider?: Provider;
  onSave: (provider: Provider) => void;
  onCancel: () => void;
}

// Features:
- Tabbed interface for different sections (Personal, Professional, Education, etc.)
- Real-time validation with error messages
- Auto-formatting for phone numbers, SSN, dates
- Dropdown lists for states, specialties, degrees
- Add/remove dynamic fields (languages, hospital affiliations)
- Unsaved changes warning
- Auto-save draft capability
```

#### Data Grid View
```
┌─────────────────────────────────────────────────────────────┐
│  Provider Data Management                                   │
├─────────────────────────────────────────────────────────────┤
│  [+ Add Provider] [Import CSV] [Export] [Bulk Edit]         │
│  Search: [_______________] Filter: [Active ▼] [All Specialties ▼] │
├─────────────────────────────────────────────────────────────┤
│  ☐ | Name ↓ | NPI | License | Specialty | Status | Actions │
├─────────────────────────────────────────────────────────────┤
│  ☐ | Dr. John Smith | 1234567890 | CA12345 | Cardiology | Active | ✏️ 📋 🗑️ │
│  ☐ | Dr. Jane Doe | 0987654321 | NY54321 | Pediatrics | Active | ✏️ 📋 🗑️ │
│  ☐ | Dr. Bob Johnson | 1122334455 | TX11111 | Surgery | Inactive | ✏️ 📋 🗑️ │
└─────────────────────────────────────────────────────────────┘
✏️ = Edit, 📋 = Duplicate, 🗑️ = Delete/Archive
```

### 2. Provider & Address Selection UI
```typescript
// Component should support:
- Search/filter providers by name, NPI, specialty, tags
- Bulk selection with "Select All", "Select None", "Select by Tag"
- Individual checkboxes for each provider
- Similar functionality for office and mailing addresses
- Cross-reference view showing which providers work at which locations
- Export selected combinations as "selection sets" for reuse
```

### 2. Template Mapping Engine
```typescript
interface FieldMapping {
  documentFieldId: string;
  documentFieldName: string;
  documentFieldType: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date';
  sourceType: 'provider' | 'office' | 'mailing' | 'custom' | 'static';
  sourcePath: string; // JSON path like "provider.npi" or "office.addressLine1"
  transformation?: {
    type: 'format' | 'concatenate' | 'conditional' | 'lookup';
    config: any;
  };
  defaultValue?: any;
  isRequired: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  documentType: 'pdf' | 'docx' | 'xlsx';
  documentHash?: string; // To verify document compatibility
  mappings: FieldMapping[];
  conditionalRules?: ConditionalRule[];
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### 3. Batch Processing System
- Queue management for processing multiple documents
- Progress tracking with estimated time remaining
- Error handling with retry logic
- Partial completion support (continue after errors)
- Export location configuration
- Naming convention templates (e.g., `{provider.lastName}_{provider.firstName}_{documentName}_{date}.pdf`)

### 4. Document Preview & Field Detection
- Real-time preview of documents with highlighted fields
- OCR for non-fillable PDFs with region selection tool
- Field type auto-detection
- Confidence scoring for OCR results
- Manual field addition for missed fields
- Support for multi-page documents

### 5. Data Validation & Quality Checks
```typescript
interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'length' | 'custom';
  config: {
    pattern?: string; // Regex
    minLength?: number;
    maxLength?: number;
    customValidator?: string; // Function name
  };
  errorMessage: string;
}

// Pre-fill validation
- Check for missing required data
- Validate data formats (NPI, DEA, SSN, etc.)
- Verify date logic (expiration dates in future, etc.)
- Cross-reference validation (provider must have at least one office)

// Post-fill validation
- Verify all required fields were filled
- Check for truncated data
- Validate calculations (if any)
```

## User Interface Design

### Main Window Layout
```
┌─────────────────────────────────────────────────────────────┐
│  File  Edit  View  Templates  Data  Tools  Help             │
├──────────────────────────────────────────────────────────────┤
│  Tabs: [Document Processing] [Provider Management] [Offices] [Addresses] │
├─────────────┬───────────────────────┬───────────────────────┤
│             │                       │                       │
│  Provider   │   Document Preview    │   Field Mapping      │
│  & Address  │                       │                       │
│  Selection  │   [PDF/Word/Excel     │   Source: [Dropdown]  │
│             │    Preview Area]      │                       │
│  ┌────────┐ │                       │   Field: [____]      │
│  │Search..│ │                       │   ↓                  │
│  └────────┘ │                       │   Maps to:           │
│             │                       │   [Provider Data ▼]  │
│  Providers: │                       │   └─ firstName       │
│  ☑ Dr. Smith│   Page: [1] of [5]    │   └─ lastName       │
│  ☑ Dr. Jones│   Zoom: [100%]        │   └─ npi            │
│  ☐ Dr. Brown│                       │                       │
│  [✏️ Edit Selected]                 │                       │
│             │                       │   Transformation:    │
│  Offices:   │   Detected Fields:    │   [None ▼]          │
│  ☑ Main St. │   • Patient Name      │                       │
│  ☑ Oak Ave. │   • Date of Birth     │   Default Value:     │
│  ☐ Elm Dr.  │   • Provider NPI      │   [___________]      │
│  [✏️ Edit Selected]                 │                       │
│             │                       │                       │
│  [Generate] │                       │   [Save Template]    │
└─────────────┴───────────────────────┴───────────────────────┘
```

### Provider Management Tab
```
┌─────────────────────────────────────────────────────────────┐
│  Provider Management                                        │
├──────────────────────────────────────────────────────────────┤
│  [+ Add Provider] [Import CSV] [Export] [Bulk Edit] [Merge Duplicates] │
│                                                              │
│  Search: [_______________] Filters: [Active ▼] [All Specialties ▼] [All Tags ▼] │
├──────────────────────────────────────────────────────────────┤
│  ☐ | Name | NPI | License | Specialty | Office | Status | Actions │
├──────────────────────────────────────────────────────────────┤
│  ☐ | Dr. John Smith | 1234567890 | CA12345 | Cardiology | Main St | ✓ | [Edit][Clone][Archive] │
│  ☐ | Dr. Jane Doe | 0987654321 | NY54321 | Pediatrics | Oak Ave | ✓ | [Edit][Clone][Archive] │
│                                                              │
│  Showing 2 of 156 providers | [First][Previous][1][2][3][Next][Last] │
└──────────────────────────────────────────────────────────────┘
```

### Provider Edit Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Edit Provider - Dr. John Smith                    [X]      │
├──────────────────────────────────────────────────────────────┤
│  [Personal] [Professional] [Contact] [Education] [Insurance] [Offices] │
├──────────────────────────────────────────────────────────────┤
│  Personal Information                                       │
│  ─────────────────────                                     │
│  First Name: [John_______] Middle: [M___] Last: [Smith____] │
│  DOB: [01/15/1975_] SSN: [***-**-6789] (🔒 Encrypted)      │
│                                                              │
│  Professional Information                                   │
│  ───────────────────────                                   │
│  NPI: [1234567890_____] [Validate]                         │
│  License #: [CA12345___] State: [California ▼] Exp: [12/2025] │
│  DEA #: [BS1234567_____] DEA Exp: [06/2026___]             │
│                                                              │
│  Specialties: [+ Add]                                       │
│  • Cardiology [Remove]                                      │
│  • Internal Medicine [Remove]                               │
│                                                              │
│  Board Certifications: [+ Add Certification]                │
│  ┌─────────────────────────────────────────────┐           │
│  │ ABIM - Cardiology - Cert: 01/2010 - Exp: 12/2025 [✏️][🗑️] │
│  └─────────────────────────────────────────────┘           │
│                                                              │
│  [Cancel] [Save Draft] [Save & Close] [Save & Next]        │
└──────────────────────────────────────────────────────────────┘
```

### Processing View
```
┌─────────────────────────────────────────────────────────────┐
│  Batch Processing - 15 documents queued                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Current: Filling Medicare Enrollment for Dr. Smith...      │
│  ████████████████████░░░░░░░░░░░  65%                      │
│                                                              │
│  Queue:                                                      │
│  ✓ Dr. Smith - BCBS Credentialing.pdf                      │
│  ✓ Dr. Smith - Aetna Provider Form.docx                    │
│  ⟳ Dr. Smith - Medicare Enrollment.pdf (current)           │
│  ○ Dr. Jones - BCBS Credentialing.pdf                      │
│  ○ Dr. Jones - Aetna Provider Form.docx                    │
│                                                              │
│  Completed: 2 | In Progress: 1 | Remaining: 12              │
│  Estimated time: 5 minutes                                  │
│                                                              │
│  [Pause] [Cancel] [Skip Current]                            │
└──────────────────────────────────────────────────────────────┘
```

## Security & Compliance

### Data Protection
- Implement AES-256 encryption for sensitive fields (SSN, Tax ID)
- Use Electron's safeStorage API for credential management
- Secure IPC communication between main and renderer processes
- No cloud storage - all data remains local
- Optional password protection for app launch

### Audit Trail
```typescript
interface AuditLog {
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'fill' | 'export';
  entityType: 'provider' | 'office' | 'document' | 'template';
  entityId: string;
  userId: string; // From OS user
  details: {
    documentName?: string;
    providerName?: string;
    changesSummary?: string;
  };
}
```

### HIPAA Considerations
- Implement automatic logout after inactivity
- Secure deletion of temporary files
- Encrypted backups
- Access controls (if multi-user support added)
- Data integrity checks

## Advanced Features

### 1. Smart Field Recognition
- Machine learning model for field name matching
- Learn from user corrections
- Build a field name synonym database
- Fuzzy matching with confidence scores

### 2. Data Import/Export
- Import from CSV for bulk provider updates
- Export to various formats (JSON, CSV, XML)
- API integration capabilities for EHR systems
- Scheduled data sync from external sources

### 3. Document Intelligence
- Auto-detect document version changes
- Alert when templates need updating
- Compare filled documents for accuracy
- Extract requirements from document instructions

### 4. Workflow Automation
- Create enrollment workflows (sequence of documents)
- Set up approval chains
- Email notifications for completed batches
- Integration with document management systems

### 5. Data Management Features
#### Change Tracking
```typescript
interface DataChangeLog {
  entityId: string;
  entityType: 'provider' | 'office' | 'address';
  fieldName: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  changeReason?: string;
}
```

#### Data Validation Rules
- Real-time NPI validation via NPPES API
- DEA number checksum validation
- State license verification (if API available)
- Address validation via USPS API
- Phone number formatting and validation
- Email validation with DNS checking
- Insurance policy expiration warnings

#### Duplicate Detection
```typescript
interface DuplicateDetection {
  checkDuplicateProvider: (provider: Provider) => {
    exact: Provider[];
    possible: Array<{provider: Provider; similarity: number}>;
  };
  mergeProviders: (keepId: string, mergeIds: string[]) => void;
  smartMerge: boolean; // AI-assisted field selection during merge
}
```

#### Bulk Operations
- Find and replace across all records
- Bulk update expiration dates
- Mass assignment of providers to offices
- Batch tag application
- Global data formatting (standardize phone numbers, addresses)

#### Data Backup & Restore
```typescript
interface BackupSystem {
  autoBackup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'onExit';
    retentionDays: number;
    location: string;
  };
  manualBackup: () => void;
  restore: (backupFile: string) => void;
  exportSnapshot: () => void; // Full data export with version info
}
```

## Development Phases

### Phase 1: Core Functionality (Weeks 1-3)
- Set up Electron + React + TypeScript project
- Implement basic provider/office data management
- Create document viewing for PDF, Word, Excel
- Build simple field mapping interface
- Implement basic fill functionality for each document type

### Phase 2: Template System (Weeks 4-5)
- Design and implement template storage
- Create visual mapping interface
- Add field transformation capabilities
- Build template management UI

### Phase 3: Batch Processing (Week 6)
- Implement provider/address selection UI
- Create batch processing queue
- Add progress tracking
- Implement error handling and recovery

### Phase 4: Advanced Features (Weeks 7-8)
- Add OCR for non-fillable PDFs
- Implement smart field suggestions
- Create validation system
- Build audit logging

### Phase 5: Polish & Optimization (Week 9)
- Performance optimization
- UI/UX improvements
- Comprehensive testing
- Documentation

### Phase 6: Security & Deployment (Week 10)
- Implement encryption
- Add security features
- Create installers for Windows/Mac/Linux
- Write user documentation

## Testing Strategy

### Unit Tests
- Document processors (PDF, Word, Excel)
- Data transformations
- Validation rules
- Template matching algorithms

### Integration Tests
- IPC communication
- File system operations
- Document generation pipeline
- Batch processing

### E2E Tests
- Complete workflow from data import to document export
- Template creation and application
- Error scenarios and recovery
- Performance with large datasets

## Performance Targets
- Load 1000+ providers in < 2 seconds
- Process single document in < 3 seconds
- Batch process 100 documents in < 5 minutes
- App startup time < 3 seconds
- Memory usage < 500MB for typical workload

## Error Handling

### User-Friendly Error Messages
```typescript
enum ErrorType {
  DOCUMENT_LOCKED = "Document is locked or in use",
  INVALID_FORMAT = "Document format not supported",
  MISSING_FIELD = "Required field missing in data",
  OCR_FAILED = "Could not read text from document",
  TEMPLATE_MISMATCH = "Template doesn't match document structure"
}
```

### Recovery Strategies
- Auto-save progress during batch processing
- Retry failed operations with exponential backoff
- Skip and continue option for batch operations
- Detailed error logs for debugging

## Deployment & Distribution

### Build Configuration
```json
{
  "productName": "Provider Enrollment Assistant",
  "appId": "com.healthcare.enrollment",
  "directories": {
    "output": "dist"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target": ["dmg", "zip"]
  },
  "win": {
    "target": ["nsis", "portable"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

### Auto-Update System
- Implement electron-updater
- Staged rollouts
- Rollback capability
- Update notifications

## Monitoring & Analytics (Optional)
- Anonymous usage statistics
- Error reporting (with user consent)
- Performance metrics
- Feature usage tracking

## Documentation Requirements
- User manual with screenshots
- Video tutorials for common workflows
- API documentation for potential integrations
- Template creation guide
- Troubleshooting guide

## Success Metrics
- 90% reduction in time to complete enrollment forms
- < 1% error rate in document filling
- Support for 95% of common enrollment forms
- User satisfaction score > 4.5/5

## Notes for Claude Code

### Priority Order
1. Get basic document viewing and data management working
2. Implement PDF filling as the first document type
3. Add template creation and saving
4. Implement batch processing with provider selection
5. Add Word and Excel support
6. Implement advanced features based on user feedback

### Key Decisions Needed
- Specific UI component library preferences
- Preferred state management approach
- Database choice (SQLite, LowDB, or JSON files)
- Whether to include cloud sync capabilities
- Multi-user support requirements

### Testing Data
Create sample data sets including:
- 10-20 mock providers with complete information
- 5-10 office locations
- 3-5 mailing addresses
- Sample PDFs, Word docs, and Excel files for testing
- Various insurance company forms for template creation

This system should be built with extensibility in mind, allowing for easy addition of new document types, data sources, and workflow automation features in the future.