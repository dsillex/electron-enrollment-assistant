# Healthcare Provider Enrollment Document Automation System

## Project Overview
Build a comprehensive Electron desktop application that automates the filling of PDF, Word (.docx), and Excel (.xlsx) files for healthcare provider enrollment. The system should read provider and office location data from JSON files and intelligently map this data to various insurance company forms and documents.

## Current Implementation Status (as of 2025-08-15)

### ✅ Completed Features

#### PDF Support
- **Field Detection**: Automatically detects text, checkbox, radio, and dropdown fields
- **Multi-Provider Support**: Provider slots system for roster PDFs (Provider1_, Provider2_, etc.)
- **Interactive Field Mapping**: Radio/dropdown fields with direct value selection
- **Pattern Detection**: Intelligent detection of provider slot patterns
- **Template System**: Save/load field mappings with provider-slot support

#### Excel Support
- **Grid Viewer**: Scrollable preview with 50+ row minimum display
- **Row Configuration**: User-selectable header and data start rows
- **Field Mapping**: Maps actual Excel headers to provider fields
- **Large File Support**: Handles rosters up to 1.2MB+ (Humana Standard Apex)
- **Split View**: Document preview alongside field mapping interface
- **Roster Generation**: Creates properly formatted Excel files with provider data

#### Template System
- **Save/Load Mappings**: Persistent field mapping storage
- **Provider-Slot Support**: Special handling for multi-provider templates
- **Validation Fixed**: Template saving now works correctly
- **Type-Specific Templates**: Separate templates for PDF, Word, Excel

#### UI/UX Improvements
- **Split View Interface**: Document preview + field mapper simultaneously
- **View Switching Fixed**: No more infinite loop when switching views
- **Drag-and-Drop Mapping**: Visual field mapping interface
- **Field Statistics**: Progress tracking for mapping completion

#### Data Management
- **Provider Database**: 34 providers loaded from cleanroster.json
- **Extended Provider Fields**: Added caqhId, hireDate, termDate, and other fields
- **Office & Address Support**: Separate management for locations
- **Data Validation**: Form validation with error handling

### ✅ Recent Fixes (2025-08-15 Session)

#### Excel Critical Issues Resolved
- **✅ File Extension Bug**: Excel files now save with .xlsx extension (not PDF)
- **✅ Configuration Pipeline**: Excel configuration now passed through processing chain
- **✅ Field Mapping**: Field names show actual Excel headers instead of generic Column A/B/C
- **✅ Row Selection**: Implemented click-to-select header and data start rows
- **✅ Workflow Simplification**: Removed double mapping, single field mapper workflow
- **✅ Provider Data Filling**: Provider data correctly fills into Excel rows

#### PDF Fixes
- **✅ PDF.js Version Mismatch**: Fixed worker version compatibility
- **✅ Local Worker Loading**: Now loads worker from local files, not CDN

#### UI/UX Improvements
- **✅ Excel Roster Auto-Detection**: Automatically switches to roster mode for Excel files
- **✅ Split View**: Document preview + field mapper side-by-side
- **✅ Context-Aware Mapping**: Different field sources for Excel vs PDF documents

### 📋 TODO - Next Session Priorities

#### 1. Import/Export Feature for Provider Data (HIGH PRIORITY - NEW)
- **CSV Import**: Bulk provider updates from CSV files
- **CSV Export**: Export selected providers to CSV
- **Excel Import/Export**: Support .xlsx files for provider data
- **Field Mapping**: Map CSV columns to provider fields during import
- **Validation**: Data validation and error reporting during import
- **Merge Options**: Handle duplicate providers during import

#### 2. Fix Output Directory Browser (CRITICAL)
- Implement working file browser dialog for output directory selection
- Remember last used directory in app settings
- Create directory if it doesn't exist
- Replace hardcoded default path

#### 3. TypeScript Build Errors (CRITICAL)
- Fix ExcelJS type compatibility issues in excel-processor.ts
- Clean up formula handling errors (read-only property warnings)
- Ensure production build works without errors
- Resolve Buffer type mismatches

#### 4. Progress Indicators & User Feedback (HIGH PRIORITY)
- Real-time progress bar during batch processing
- Success/failure notifications after document generation
- "Open folder" button after successful generation
- Better error messages with specific failure details

#### 5. Basic Word Document Support (MEDIUM PRIORITY)
- Implement DOCX template filling using docxtemplater
- Field detection for Word documents
- Word preview functionality
- Word-specific field mapping

#### 6. Mailing Address Management (MEDIUM PRIORITY)
- Complete the addresses tab functionality
- Link addresses to providers and offices
- Address import/export capabilities
- Address validation and formatting

### Excel Roster Examples Analysis

From `example_completed_excel_rosters/` folder:

#### File Size Patterns
- **Small Rosters**: 18KB-40KB (2-4 providers, single location)
  - Examples: Amerihealth, Paramount
- **Medium Rosters**: 100KB-500KB (multiple providers, multiple locations)
  - Examples: UHC, Buckeye, Carelon
- **Large Rosters**: 1MB+ (extensive provider data, complex structure)
  - Examples: Humana Standard Apex, Humana Commercial

#### Insurance Company Patterns
- **Humana**: Complex multi-tab rosters, extensive metadata
- **Aetna**: Location-focused, provider-to-address mapping
- **Buckeye**: Varied structures, multiple formats
- **Carelon**: Location-specific rosters (149 E Water, 620 E Water, etc.)
- **UHC/Amerihealth**: Simpler 2-3 provider rosters

#### Common Column Types Found
- Provider demographics (First/Last Name, DOB, SSN)
- Professional info (NPI, License Number, DEA, Specialties)
- Office locations (multiple addresses per provider)
- Insurance-specific fields (CAQH ID, Provider ID, Group numbers)
- Effective dates (hire, termination, roster dates)

## Known Issues & Limitations

### Excel-Specific Issues (CRITICAL for next session)
1. **No Row Selection Interface**: Cannot specify where headers/data start
2. **Limited Horizontal Scrolling**: Cannot see full roster width (50+ columns)
3. **No Column Mapping**: Cannot map Excel columns to provider fields
4. **Fixed Structure Assumptions**: Currently assumes standard Excel layout

### General Issues
1. **Debug Logging**: Console.log statements still present throughout codebase
2. **TypeScript Issues**: Some FormField name type issues in professional-info-step.tsx
3. **Error Boundaries**: No error boundary components implemented
4. **Performance**: Heavy components not memoized

## Session Progress Log

### 2025-08-15 Session Achievements
- ✅ **CRITICAL BUG FIXED**: Excel files now save with .xlsx extension (was saving as PDF)
- ✅ **Excel Configuration Pipeline**: Fixed data not appearing in generated Excel files
- ✅ **PDF.js Version Mismatch**: Fixed PDF viewer loading issues (worker compatibility)
- ✅ **Excel Field Names**: Display actual column headers instead of generic "Column A/B/C"
- ✅ **Workflow Simplification**: Removed double field mapping for Excel files
- ✅ **Type Safety**: Updated document processor signatures for Excel configuration
- ✅ **Row Configuration**: Excel header/data row selection works properly
- ✅ **Field Mapping Conversion**: Convert UI mappings to Excel processor format

### 2025-08-14 Session Achievements
- ✅ **Fixed Template Save Error**: Provider-slot mappings now validate correctly
- ✅ **Implemented Excel Grid Viewer**: 50+ row preview with basic scrolling
- ✅ **Fixed View Switching Loop**: "Back to Document View" now works without infinite loop
- ✅ **Added Split View**: Document preview + field mapper side-by-side
- ✅ **Enhanced Excel Preview**: Minimum 50 rows for better roster visibility
- ✅ **Fixed Scrolling Issues**: Vertical scrolling working, horizontal partially fixed
- ✅ **Added Debug Logging**: Comprehensive Excel processing logs for troubleshooting
- 📁 **Received Example Rosters**: 23 completed roster files from various insurance companies
- 🔧 **Identified Excel Requirements**: Need user-selectable row configuration

### Key Insights from Sessions
1. **Excel rosters vary wildly**: Headers can be anywhere from row 1 to row 10+
2. **Insurance company differences**: Each has unique format (Humana vs Aetna vs Buckeye)
3. **Row-based processing**: All Excel files are rosters (1 row = 1 provider)
4. **Wide column spans**: Rosters can have 50+ columns requiring full horizontal scroll
5. **Version compatibility**: PDF.js 4.x requires different worker loading approach than 3.x

## Technical Implementation Notes

### Excel Processing Flow (Current)
1. User opens Excel file (.xlsx)
2. System analyzes and creates column fields (A, B, C...)
3. Displays 50+ row grid preview with basic scrolling
4. User switches to field mapper for manual mapping
5. Current limitation: Cannot specify header/data rows

### Excel Processing Flow (Target)
1. User opens Excel file (.xlsx)
2. System displays full grid with row numbers prominent
3. **User clicks to select header row** (row with column names)
4. **User clicks to select data start row** (first provider row)
5. System shows column mapping interface with actual headers
6. User maps each column to provider field
7. Save configuration as Excel template
8. Process roster with all providers

### Provider Slot System (for PDFs)
- Detects patterns like Provider1_FirstName, Provider2_FirstName
- Maps to specific provider positions in roster
- Supports up to 10 provider slots currently
- Works with PDF forms that have repeating provider sections

## Core Requirements

### 2. Data Management ✅ COMPLETED
- **Provider Data**: ✅ 34 providers loaded from cleanroster.json conversion
- **Office Locations**: ✅ Separate JSON structure for physical office addresses
- **Mailing Addresses**: ✅ Separate JSON structure for correspondence addresses
- **Extended Provider Fields**: ✅ Added caqhId, hireDate, termDate, statusReason, and more
- **Flexible Selection**: ✅ Implemented with checkboxes and multi-select
  - Single provider ✅
  - Multiple specific providers (with checkbox selection) ✅
  - All providers at once ✅
  - Single address ✅
  - Multiple addresses ✅
  - All addresses ✅
  - Any combination of providers × addresses ✅

### 3. Template System ✅ MOSTLY COMPLETED
- **Visual Field Mapper**: ✅ Drag-and-drop interface implemented
- **Template Storage**: ✅ Save mapping configurations as reusable templates
- **Provider-Slot Support**: ✅ Special handling for multi-provider PDFs
- **Template Validation**: ✅ Fixed validation issues for provider-slot mappings
- **Default Values**: ✅ Allow setting default values for unmapped fields
- **Field Transformations**: ✅ Support data formatting (dates, phone numbers, SSN, etc.)
- **Excel Templates**: 🚧 Need Excel-specific templates with row configuration
- **Smart Suggestions**: 🚧 Basic auto-suggest implemented, needs refinement

## Data Structure Updates

### Provider Interface Enhancements
The Provider interface has been extended with additional fields commonly found in healthcare rosters:

```typescript
interface Provider {
  // Core fields (existing)
  id: string;
  firstName: string;
  lastName: string;
  npi: string;
  // ... other existing fields

  // NEW FIELDS ADDED:
  caqhId?: string;              // CAQH provider ID
  hireDate?: string;            // Provider hire date
  termDate?: string;            // Provider termination date
  statusReason?: string;        // Status change reason
  middleInitial?: string;       // Middle initial (separate from middleName)
  suffix?: string;              // Jr., Sr., MD, etc.
  credentials?: string[];       // Professional credentials
  contractEffectiveDate?: string; // Contract start date
  contractTerminationDate?: string; // Contract end date
  // ... additional fields as needed
}
```

### Current Provider Database Status
- **Total Providers**: 34 active providers loaded
- **Data Source**: Converted from cleanroster.json
- **Location**: `C:\Users\dougs\AppData\Roaming\Provider Enrollment Assistant\data\providers.json`
- **Fields Populated**: Basic demographics, NPI, licensing, contact info
- **Extended Fields**: Available but may need population for specific rosters

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