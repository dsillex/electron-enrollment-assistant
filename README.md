# Healthcare Provider Enrollment Document Automation System

A comprehensive Electron desktop application that automates the filling of PDF, Word (.docx), and Excel (.xlsx) files for healthcare provider enrollment. The system reads provider and office location data from JSON files and intelligently maps this data to various insurance company forms and documents.

## ✨ Features

### Document Processing
- **PDF Support**: Read, analyze, and fill both form-fillable and non-fillable PDFs
- **Word Support**: Process .docx files with content controls, bookmarks, and plain text replacement *(Coming Soon)*
- **Excel Support**: Read and write to specific cells, handle multiple sheets, preserve formatting *(In Development)*
- **Auto-detection**: Automatically identify document type and available fields/regions

### Data Management
- **Provider Management**: Comprehensive CRUD operations for healthcare provider information
- **Office Locations**: Manage multiple office addresses and practice information
- **Flexible Selection**: Select single/multiple providers and offices for batch processing
- **Data Import**: Import provider data from existing JSON files

### Template System
- **Visual Field Mapper**: Drag-and-drop interface to map JSON fields to document fields
- **Template Storage**: Save mapping configurations as reusable templates
- **Smart Suggestions**: Auto-suggest mappings based on field names and context
- **Direct Selection**: Click to select radio button and dropdown options without drag-and-drop

### Batch Processing
- **Queue Management**: Process multiple documents simultaneously
- **Progress Tracking**: Real-time progress updates with estimated completion time
- **Error Handling**: Robust error handling with retry logic and detailed logging

## 🛠 Technology Stack

- **Framework**: Electron (v28+)
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn/ui with Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **PDF Processing**: pdf-lib, pdfjs-dist
- **Document Processing**: ExcelJS for Excel, docxtemplater for Word

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Windows, macOS, or Linux

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd provider-enrollment-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up initial data**
   - Provider data will be stored in `data/providers.json`
   - Office locations in `data/offices.json`
   - Sample data will be created automatically

4. **Run in development**
   ```bash
   npm run dev
   ```

## 📖 Usage

### Basic Workflow
1. **Add Provider Data**: Use the Provider Management tab to add healthcare providers
2. **Add Office Locations**: Use the Offices tab to add practice locations
3. **Open Document**: Select a PDF enrollment form to process
4. **Map Fields**: Drag provider data fields to document form fields
5. **Save Template**: Save your field mappings for reuse
6. **Generate Documents**: Select providers/offices and generate filled forms

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package

# Platform-specific builds
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

## 📁 Project Structure

```
provider-enrollment-app/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── database/         # Data management
│   │   ├── document-processors/ # PDF, Word, Excel processors
│   │   ├── ipc-handlers/     # Inter-process communication
│   │   └── index.ts
│   ├── renderer/             # React application
│   │   ├── components/       # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # State management
│   │   └── App.tsx
│   ├── shared/              # Shared types and utilities
│   └── preload/             # Preload scripts
├── data/                    # User data directory
│   ├── providers.json
│   ├── offices.json
│   └── templates/
└── dist/                   # Build output
```

## 📊 Data Management

### Provider Data Schema
```typescript
interface Provider {
  id: string
  firstName: string
  lastName: string
  npi: string
  licenseNumber: string
  specialties: string[]
  // ... additional fields
}
```

### Office Location Schema
```typescript
interface OfficeLocation {
  id: string
  locationName: string
  addressLine1: string
  city: string
  state: string
  zipCode: string
  // ... additional fields
}
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm test
```

### Building Distributables
```bash
npm run package        # Build for current platform
npm run package:win    # Windows installer
npm run package:mac    # macOS DMG
npm run package:linux  # Linux AppImage
```

## 🔒 Security & Privacy

- **Local Storage Only**: All data remains on your local machine
- **No Cloud Sync**: No data is transmitted to external servers
- **Encrypted Sensitive Data**: SSN and Tax ID fields are encrypted
- **HIPAA Considerations**: Designed with healthcare data privacy in mind
- **Secure File Handling**: Temporary files are automatically cleaned up

## 🎯 Use Cases

- **Insurance Enrollment**: Automate filling of insurance credentialing forms
- **Hospital Privileging**: Streamline medical staff applications
- **Group Practice Onboarding**: Batch process new provider enrollments
- **License Renewals**: Manage recurring license and certification renewals
- **Compliance Reporting**: Generate standardized compliance documents

## 🔄 Data Import

To import existing provider data:

1. Prepare your data in JSON format matching the provider schema
2. Use the conversion script in `src/scripts/convert-roster.js` as a reference
3. Place your `providers.json` in the `data/` directory
4. Restart the application to load new data

## 🚧 Roadmap

- [ ] Complete Excel document processing
- [ ] Word document (.docx) support
- [ ] OCR for non-fillable PDFs
- [ ] Advanced template conditions
- [ ] Data validation rules
- [ ] Export/import capabilities
- [ ] Multi-language support

## 🐛 Known Issues

- Excel document processing is in development
- Word document support is planned
- Some PDF forms may require manual field detection

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

This is currently a private project. If you have suggestions or find bugs, please create an issue.

## 📞 Support

For questions or support, please refer to the documentation or create an issue in the repository.

---

**Healthcare Provider Enrollment Assistant** - Streamlining healthcare credentialing through automation.