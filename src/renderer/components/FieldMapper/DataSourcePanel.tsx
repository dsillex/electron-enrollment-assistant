import React from 'react'
import { useDrag } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { 
  User, 
  Building, 
  Mail, 
  FileText, 
  Calendar,
  Phone,
  MapPin,
  GripVertical,
  Combine,
  Link2
} from 'lucide-react'

interface DataSource {
  type: 'provider' | 'provider-slot' | 'office' | 'mailing' | 'static' | 'custom'
  path: string
  label: string
  description?: string
  dataType: 'string' | 'number' | 'date' | 'boolean'
  category: string
  slotNumber?: number // For provider-slot type
}

interface DraggableDataSourceProps {
  source: DataSource
}

function DraggableDataSource({ source }: DraggableDataSourceProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'dataSource',
    item: source,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const getIcon = () => {
    if (source.path.startsWith('combined.')) {
      return <Link2 className="h-4 w-4" />
    }
    
    switch (source.type) {
      case 'provider':
        return <User className="h-4 w-4" />
      case 'provider-slot':
        return <User className="h-4 w-4 text-blue-600" />
      case 'office':
        return <Building className="h-4 w-4" />
      case 'mailing':
        return <Mail className="h-4 w-4" />
      case 'static':
        return <FileText className="h-4 w-4" />
      default:
        return <GripVertical className="h-4 w-4" />
    }
  }

  const getTypeColor = () => {
    if (source.path.startsWith('combined.')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    
    switch (source.type) {
      case 'provider':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'office':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'mailing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'static':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  return (
    <div
      ref={drag}
      className={`
        flex items-center space-x-2 p-2 rounded-md border cursor-move transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:bg-muted/50 hover:border-primary/30'}
      `}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium truncate">{source.label}</span>
          <Badge variant="outline" className={`text-xs ${getTypeColor()}`}>
            {source.dataType}
          </Badge>
        </div>
        {source.description && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {source.description}
          </p>
        )}
      </div>
    </div>
  )
}

interface DataSourceSectionProps {
  title: string
  icon: React.ReactNode
  sources: DataSource[]
  defaultExpanded?: boolean
}

function DataSourceSection({ title, icon, sources, defaultExpanded = true }: DataSourceSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  if (sources.length === 0) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {icon}
        <span>{title}</span>
        <span className="text-xs">({sources.length})</span>
        <div className={`ml-auto transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          <GripVertical className="h-3 w-3" />
        </div>
      </button>
      
      {isExpanded && (
        <div className="space-y-1 pl-2">
          {sources.map((source) => (
            <DraggableDataSource key={source.path} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DataSourcePanel() {
  // State for dynamic provider slot count
  const [visibleSlotCount, setVisibleSlotCount] = React.useState(5)

  // Provider data sources
  const providerSources: DataSource[] = [
    // Personal Information
    { type: 'provider', path: 'provider.firstName', label: 'First Name', category: 'personal', dataType: 'string' },
    { type: 'provider', path: 'provider.middleName', label: 'Middle Name', category: 'personal', dataType: 'string' },
    { type: 'provider', path: 'provider.lastName', label: 'Last Name', category: 'personal', dataType: 'string' },
    { type: 'provider', path: 'provider.suffix', label: 'Suffix', category: 'personal', dataType: 'string' },
    { type: 'provider', path: 'provider.dateOfBirth', label: 'Date of Birth', category: 'personal', dataType: 'date' },
    { type: 'provider', path: 'provider.ssn', label: 'Social Security Number', category: 'personal', dataType: 'string', description: 'Encrypted field' },
    
    // Professional Information
    { type: 'provider', path: 'provider.npi', label: 'NPI Number', category: 'professional', dataType: 'string', description: 'National Provider Identifier' },
    { type: 'provider', path: 'provider.licenseNumber', label: 'License Number', category: 'professional', dataType: 'string' },
    { type: 'provider', path: 'provider.licenseState', label: 'License State', category: 'professional', dataType: 'string' },
    { type: 'provider', path: 'provider.licenseExpiration', label: 'License Expiration', category: 'professional', dataType: 'date' },
    { type: 'provider', path: 'provider.deaNumber', label: 'DEA Number', category: 'professional', dataType: 'string' },
    { type: 'provider', path: 'provider.deaExpiration', label: 'DEA Expiration', category: 'professional', dataType: 'date' },
    { type: 'provider', path: 'provider.specialties', label: 'Specialties', category: 'professional', dataType: 'string', description: 'Comma-separated list' },
    { type: 'provider', path: 'provider.caqhId', label: 'CAQH ID', category: 'professional', dataType: 'string', description: 'CAQH credentialing identifier' },
    { type: 'provider', path: 'provider.providerType', label: 'Provider Type', category: 'professional', dataType: 'string', description: 'CNP, DO, MD, etc.' },
    { type: 'provider', path: 'provider.taxonomyCodes', label: 'Taxonomy Codes', category: 'professional', dataType: 'string', description: 'Healthcare taxonomy codes' },
    { type: 'provider', path: 'provider.hireDate', label: 'Hire Date', category: 'professional', dataType: 'date' },
    { type: 'provider', path: 'provider.medicareApprovalDate', label: 'Medicare Approval Date', category: 'professional', dataType: 'date' },
    { type: 'provider', path: 'provider.medicaidApprovalDate', label: 'Medicaid Approval Date', category: 'professional', dataType: 'date' },
    
    // Contact Information
    { type: 'provider', path: 'provider.email', label: 'Email Address', category: 'contact', dataType: 'string' },
    { type: 'provider', path: 'provider.phone', label: 'Phone Number', category: 'contact', dataType: 'string' },
    { type: 'provider', path: 'provider.cellPhone', label: 'Cell Phone', category: 'contact', dataType: 'string' },
    { type: 'provider', path: 'provider.fax', label: 'Fax Number', category: 'contact', dataType: 'string' },
    
    // Practice Information
    { type: 'provider', path: 'provider.practiceType', label: 'Practice Type', category: 'practice', dataType: 'string' },
    { type: 'provider', path: 'provider.groupName', label: 'Group Name', category: 'practice', dataType: 'string' },
    { type: 'provider', path: 'provider.taxId', label: 'Tax ID', category: 'practice', dataType: 'string', description: 'Encrypted field' },
    { type: 'provider', path: 'provider.medicareNumber', label: 'Medicare Number', category: 'practice', dataType: 'string' },
    { type: 'provider', path: 'provider.medicaidNumber', label: 'Medicaid Number', category: 'practice', dataType: 'string' },
    
    // Education
    { type: 'provider', path: 'provider.medicalSchool.name', label: 'Medical School', category: 'education', dataType: 'string' },
    { type: 'provider', path: 'provider.medicalSchool.graduationYear', label: 'Graduation Year', category: 'education', dataType: 'string' },
    { type: 'provider', path: 'provider.medicalSchool.degree', label: 'Medical Degree', category: 'education', dataType: 'string' }
  ]

  // Office location data sources
  const officeSources: DataSource[] = [
    // Address Information
    { type: 'office', path: 'office.locationName', label: 'Location Name', category: 'basic', dataType: 'string' },
    { type: 'office', path: 'office.locationType', label: 'Location Type', category: 'basic', dataType: 'string' },
    { type: 'office', path: 'office.addressLine1', label: 'Address Line 1', category: 'address', dataType: 'string' },
    { type: 'office', path: 'office.addressLine2', label: 'Address Line 2', category: 'address', dataType: 'string' },
    { type: 'office', path: 'office.city', label: 'City', category: 'address', dataType: 'string' },
    { type: 'office', path: 'office.state', label: 'State', category: 'address', dataType: 'string' },
    { type: 'office', path: 'office.zipCode', label: 'ZIP Code', category: 'address', dataType: 'string' },
    { type: 'office', path: 'office.county', label: 'County', category: 'address', dataType: 'string' },
    
    // Contact Information
    { type: 'office', path: 'office.mainPhone', label: 'Main Phone', category: 'contact', dataType: 'string' },
    { type: 'office', path: 'office.fax', label: 'Office Fax', category: 'contact', dataType: 'string' },
    { type: 'office', path: 'office.appointmentPhone', label: 'Appointment Phone', category: 'contact', dataType: 'string' },
    
    // Additional Information
    { type: 'office', path: 'office.wheelchairAccessible', label: 'Wheelchair Accessible', category: 'accessibility', dataType: 'boolean' },
    { type: 'office', path: 'office.billingNPI', label: 'Billing NPI', category: 'billing', dataType: 'string' },
    { type: 'office', path: 'office.placeOfServiceCode', label: 'Place of Service Code', category: 'billing', dataType: 'string' }
  ]

  // Mailing address data sources
  const mailingSources: DataSource[] = [
    { type: 'mailing', path: 'mailing.addressName', label: 'Address Name', category: 'basic', dataType: 'string' },
    { type: 'mailing', path: 'mailing.addressType', label: 'Address Type', category: 'basic', dataType: 'string' },
    { type: 'mailing', path: 'mailing.addressLine1', label: 'Mailing Address Line 1', category: 'address', dataType: 'string' },
    { type: 'mailing', path: 'mailing.addressLine2', label: 'Mailing Address Line 2', category: 'address', dataType: 'string' },
    { type: 'mailing', path: 'mailing.city', label: 'Mailing City', category: 'address', dataType: 'string' },
    { type: 'mailing', path: 'mailing.state', label: 'Mailing State', category: 'address', dataType: 'string' },
    { type: 'mailing', path: 'mailing.zipCode', label: 'Mailing ZIP Code', category: 'address', dataType: 'string' },
    { type: 'mailing', path: 'mailing.attentionTo', label: 'Attention To', category: 'contact', dataType: 'string' },
    { type: 'mailing', path: 'mailing.department', label: 'Department', category: 'contact', dataType: 'string' }
  ]

  // Static/Custom data sources
  const staticSources: DataSource[] = [
    { type: 'static', path: 'static.currentDate', label: 'Current Date', category: 'system', dataType: 'date', description: 'Automatically filled with today\'s date' },
    { type: 'static', path: 'static.applicationDate', label: 'Application Date', category: 'system', dataType: 'date', description: 'Date this application was filled' },
    { type: 'custom', path: 'custom.signature', label: 'Digital Signature', category: 'custom', dataType: 'string', description: 'Provider signature placeholder' }
  ]

  // Pre-configured combined field sources
  const combinedSources: DataSource[] = [
    { 
      type: 'provider', 
      path: 'combined.fullName', 
      label: 'Full Name (First + Last)', 
      category: 'combined', 
      dataType: 'string', 
      description: 'Combines first name and last name' 
    },
    { 
      type: 'provider', 
      path: 'combined.fullNameWithMiddle', 
      label: 'Full Name (First + Middle + Last)', 
      category: 'combined', 
      dataType: 'string', 
      description: 'Combines first, middle, and last name' 
    },
    { 
      type: 'provider', 
      path: 'combined.lastFirstMI', 
      label: 'Last, First MI', 
      category: 'combined', 
      dataType: 'string', 
      description: 'Last name, first name middle initial format' 
    },
    { 
      type: 'office', 
      path: 'combined.fullAddress', 
      label: 'Full Address', 
      category: 'combined', 
      dataType: 'string', 
      description: 'Combines address line 1, city, state, zip' 
    },
    { 
      type: 'office', 
      path: 'combined.cityStateZip', 
      label: 'City, State ZIP', 
      category: 'combined', 
      dataType: 'string', 
      description: 'Combines city, state, and ZIP code' 
    },
    { 
      type: 'provider', 
      path: 'combined.credentials', 
      label: 'Name with Credentials', 
      category: 'combined', 
      dataType: 'string', 
      description: 'Full name with degree and certifications' 
    }
  ]

  // Generate provider slot sources (for roster mode)
  const generateProviderSlotSources = (slotCount: number = 5): DataSource[] => {
    const slotSources: DataSource[] = []
    
    for (let slot = 1; slot <= slotCount; slot++) {
      // Add ALL provider fields for this slot (matching providerSources above)
      slotSources.push(
        // Personal Information
        { type: 'provider-slot', path: `provider[${slot}].firstName`, label: `First Name`, category: 'personal', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].middleName`, label: `Middle Name`, category: 'personal', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].lastName`, label: `Last Name`, category: 'personal', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].suffix`, label: `Suffix`, category: 'personal', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].dateOfBirth`, label: `Date of Birth`, category: 'personal', dataType: 'date', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].ssn`, label: `Social Security Number`, category: 'personal', dataType: 'string', slotNumber: slot },
        
        // Professional Information
        { type: 'provider-slot', path: `provider[${slot}].npi`, label: `NPI Number`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].licenseNumber`, label: `License Number`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].licenseState`, label: `License State`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].licenseExpiration`, label: `License Expiration`, category: 'professional', dataType: 'date', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].deaNumber`, label: `DEA Number`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].deaExpiration`, label: `DEA Expiration`, category: 'professional', dataType: 'date', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].specialties`, label: `Specialties`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].caqhId`, label: `CAQH ID`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].providerType`, label: `Provider Type`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].taxonomyCodes`, label: `Taxonomy Codes`, category: 'professional', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].hireDate`, label: `Hire Date`, category: 'professional', dataType: 'date', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].medicareApprovalDate`, label: `Medicare Approval Date`, category: 'professional', dataType: 'date', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].medicaidApprovalDate`, label: `Medicaid Approval Date`, category: 'professional', dataType: 'date', slotNumber: slot },
        
        // Contact Information
        { type: 'provider-slot', path: `provider[${slot}].email`, label: `Email Address`, category: 'contact', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].phone`, label: `Phone Number`, category: 'contact', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].cellPhone`, label: `Cell Phone`, category: 'contact', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].fax`, label: `Fax Number`, category: 'contact', dataType: 'string', slotNumber: slot },
        
        // Practice Information
        { type: 'provider-slot', path: `provider[${slot}].practiceType`, label: `Practice Type`, category: 'practice', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].groupName`, label: `Group Name`, category: 'practice', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].taxId`, label: `Tax ID`, category: 'practice', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].medicareNumber`, label: `Medicare Number`, category: 'practice', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].medicaidNumber`, label: `Medicaid Number`, category: 'practice', dataType: 'string', slotNumber: slot },
        
        // Education
        { type: 'provider-slot', path: `provider[${slot}].medicalSchool.name`, label: `Medical School`, category: 'education', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].medicalSchool.graduationYear`, label: `Graduation Year`, category: 'education', dataType: 'string', slotNumber: slot },
        { type: 'provider-slot', path: `provider[${slot}].medicalSchool.degree`, label: `Medical Degree`, category: 'education', dataType: 'string', slotNumber: slot }
      )
    }
    
    return slotSources
  }

  // Group provider slot sources by slot number
  const providerSlotSources = generateProviderSlotSources(visibleSlotCount)
  const slotsByNumber = providerSlotSources.reduce((acc, source) => {
    const slotNum = source.slotNumber!
    if (!acc[slotNum]) acc[slotNum] = []
    acc[slotNum].push(source)
    return acc
  }, {} as Record<number, DataSource[]>)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag data fields to map them to document fields
        </p>
      </CardHeader>
      <CardContent className="space-y-4 h-[600px] overflow-y-auto">
        <DataSourceSection
          title="Combined Fields"
          icon={<Link2 className="h-4 w-4" />}
          sources={combinedSources}
          defaultExpanded={true}
        />
        
        <Separator />
        
        <DataSourceSection
          title="Provider Information"
          icon={<User className="h-4 w-4" />}
          sources={providerSources}
          defaultExpanded={true}
        />
        
        <Separator />
        
        {/* Provider Slots for Roster Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4 text-blue-600" />
              <span>Provider Slots (Roster Mode)</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setVisibleSlotCount(prev => prev + 5)}
            >
              Add More (+5)
            </Button>
          </div>
          <div className="text-xs text-muted-foreground pl-6 mb-2">
            Use these to assign specific providers to specific fields. Showing slots 1-{visibleSlotCount}.
          </div>
          
          {Object.entries(slotsByNumber).map(([slotNum, sources]) => (
            <DataSourceSection
              key={slotNum}
              title={`Provider Slot #${slotNum}`}
              icon={<User className="h-4 w-4 text-blue-600" />}
              sources={sources}
              defaultExpanded={false}
            />
          ))}
        </div>
        
        <Separator />
        
        <DataSourceSection
          title="Office Location"
          icon={<Building className="h-4 w-4" />}
          sources={officeSources}
          defaultExpanded={false}
        />
        
        <Separator />
        
        <DataSourceSection
          title="Mailing Address"
          icon={<MapPin className="h-4 w-4" />}
          sources={mailingSources}
          defaultExpanded={false}
        />
        
        <Separator />
        
        <DataSourceSection
          title="System & Custom"
          icon={<FileText className="h-4 w-4" />}
          sources={staticSources}
          defaultExpanded={false}
        />
      </CardContent>
    </Card>
  )
}