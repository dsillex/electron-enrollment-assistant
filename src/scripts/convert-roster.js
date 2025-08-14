const fs = require('fs-extra');
const path = require('path');

// Helper function to parse full name into components
function parseName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  
  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  } else if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  } else if (parts.length === 3) {
    // Assume middle name or middle initial
    return { 
      firstName: parts[0], 
      middleName: parts[1], 
      lastName: parts[2] 
    };
  } else {
    // More than 3 parts - take first as first name, last as last name, combine middle parts
    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(' '),
      lastName: parts[parts.length - 1]
    };
  }
}

// Helper function to convert date from M/D/YYYY to YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr === null) return undefined;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;
    
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    console.warn(`Failed to convert date: ${dateStr}`);
    return undefined;
  }
}

// Helper function to generate UUID-like ID
function generateId() {
  return 'provider-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// Helper function to map provider type to specialty
function mapSpecialty(type, specialty) {
  const specialtyMap = {
    'CNP': 'Certified Nurse Practitioner',
    'NP': 'Nurse Practitioner', 
    'FNP': 'Family Nurse Practitioner',
    'PMHNP': 'Psychiatric Mental Health Nurse Practitioner',
    'DO': 'Family Practice',
    'MD': 'Family Practice',
    'DMD': 'General Dentistry',
    'LISW': 'Licensed Independent Social Worker',
    'LISWS': 'Licensed Independent Social Worker',
    'RD': 'Registered Dietitian',
    'LD': 'Licensed Dietitian',
    'LPC': 'Licensed Professional Counselor'
  };
  
  // Use provided specialty if available, otherwise map from type
  return specialty || specialtyMap[type] || type;
}

// Helper function to clean and convert string to number if valid
function convertToNumber(value) {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(num) ? undefined : num.toString();
}

async function convertRosterData() {
  try {
    console.log('Starting roster data conversion...');
    
    // Read the source data
    const sourcePath = path.join(__dirname, '../../cleanroster.json');
    const sourceData = await fs.readJson(sourcePath);
    
    console.log(`Found ${sourceData.length} providers to convert`);
    
    // Convert each provider
    const convertedProviders = sourceData.map((oldProvider, index) => {
      console.log(`Converting provider ${index + 1}: ${oldProvider.Providers}`);
      
      const nameComponents = parseName(oldProvider.Providers);
      
      const newProvider = {
        id: generateId(),
        
        // Personal Information
        firstName: nameComponents.firstName || '',
        middleName: nameComponents.middleName,
        lastName: nameComponents.lastName || '',
        suffix: undefined,
        dateOfBirth: convertDate(oldProvider.DOB),
        ssn: oldProvider['Social Sec'] || '',
        
        // Professional Information
        npi: oldProvider.NPI ? oldProvider.NPI.toString() : '',
        licenseNumber: oldProvider['OH License'] ? oldProvider['OH License'].toString() : '',
        licenseState: 'OH', // All providers are in Ohio
        licenseExpiration: convertDate(oldProvider['OH Expiration']),
        deaNumber: oldProvider['DEA License  (if applicable)'],
        deaExpiration: convertDate(oldProvider['DEA Expiration']),
        specialties: [mapSpecialty(oldProvider.Type, oldProvider.Speciality)],
        boardCertifications: [],
        
        // Additional Professional Information (new fields)
        caqhId: convertToNumber(oldProvider['CAQH ID']),
        providerType: oldProvider.Type, // Store shorthand like CNP, DO, MD
        taxonomyCodes: oldProvider.Taxonomies ? [oldProvider.Taxonomies] : [],
        hireDate: convertDate(oldProvider['Hire Date']),
        medicareApprovalDate: convertDate(oldProvider['Approval Effective Date']),
        medicaidApprovalDate: convertDate(oldProvider['Approval Effective Date2']),
        
        // Contact Information (defaults - can be updated later)
        email: '',
        phone: '',
        cellPhone: undefined,
        fax: undefined,
        
        // Employment/Practice Information
        practiceType: 'group', // Assuming group practice
        groupName: undefined,
        taxId: '', // Encrypted field - will be empty for now
        medicareNumber: convertToNumber(oldProvider['Medicare #']),
        medicaidNumber: convertToNumber(oldProvider['Medicaid #']),
        
        // Education
        medicalSchool: {
          name: undefined,
          degree: oldProvider.Type, // Store shorthand here (CNP, DO, MD, etc.)
          graduationYear: undefined
        },
        residency: undefined,
        fellowship: undefined,
        
        // Additional Information
        languages: ['English'], // Default
        hospitalAffiliations: [],
        malpracticeInsurance: {
          carrier: '',
          policyNumber: '',
          coverageAmount: '',
          expirationDate: ''
        },
        
        // Metadata
        isActive: oldProvider['Provider Term Date '] === null, // Active if no term date
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      };
      
      return newProvider;
    });
    
    // Write the converted data
    const outputPath = path.join(__dirname, '../../data/providers.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, convertedProviders, { spaces: 2 });
    
    console.log(`✅ Successfully converted ${convertedProviders.length} providers`);
    console.log(`📁 Output saved to: ${outputPath}`);
    
    // Show sample of converted data
    console.log('\n📋 Sample converted provider:');
    console.log(JSON.stringify(convertedProviders[0], null, 2));
    
    return convertedProviders;
    
  } catch (error) {
    console.error('❌ Error converting roster data:', error);
    throw error;
  }
}

// Run the conversion if this script is called directly
if (require.main === module) {
  convertRosterData()
    .then(() => {
      console.log('\n🎉 Conversion completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Conversion failed:', error);
      process.exit(1);
    });
}

module.exports = { convertRosterData };