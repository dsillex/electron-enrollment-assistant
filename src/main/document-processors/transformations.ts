import { format as formatDate } from 'date-fns'

export type TransformationType = 'format' | 'concatenate' | 'conditional' | 'lookup' | 'boolean' | 'nameFormat' | 'extract'

export interface TransformationConfig {
  type: TransformationType
  config: any
}

// Format transformation configurations
export interface FormatConfig {
  dateFormat?: string // e.g., 'MM/dd/yyyy', 'yyyy-MM-dd'
  phoneFormat?: 'xxx-xxx-xxxx' | '(xxx) xxx-xxxx' | 'xxxxxxxxxx'
  ssnFormat?: 'xxx-xx-xxxx' | 'xxxxxxxxx'
  caseTransform?: 'upper' | 'lower' | 'title' | 'sentence'
  prefix?: string
  suffix?: string
}

// Concatenation transformation configuration
export interface ConcatenateConfig {
  sources: string[] // Array of field paths to concatenate
  separator?: string // Separator between values (default: ' ')
  skipEmpty?: boolean // Skip empty values (default: true)
}

// Conditional transformation configuration
export interface ConditionalConfig {
  condition: {
    field: string // Field path to check
    operator: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'
    value: any
  }
  trueValue: any
  falseValue?: any
}

// Lookup transformation configuration
export interface LookupConfig {
  lookupTable: Record<string, any>
  defaultValue?: any
}

// Boolean transformation configuration
export interface BooleanConfig {
  trueValues?: string[] // Values that should evaluate to true (default: ['true', 'yes', 'y', '1', 'on', 'checked'])
  falseValues?: string[] // Values that should evaluate to false (default: ['false', 'no', 'n', '0', 'off', ''])
  defaultValue?: boolean // Default value if no match found
}

// Name format transformation configuration
export interface NameFormatConfig {
  format: 'full' | 'firstLast' | 'lastFirst' | 'lastFirstMI' | 'firstMI' | 'first' | 'last' | 'middle' | 'initial' | 'custom'
  customTemplate?: string // For custom format: "{first} {middle} {last}" or "{last}, {first} {mi}."
  separator?: string // Separator for custom formats (default: ' ')
}

// Extract transformation configuration
export interface ExtractConfig {
  part: 'firstName' | 'middleName' | 'lastName' | 'middleInitial' | 'suffix'
  from?: string // Field path to extract from (if different from mapped field)
  fallback?: string // Fallback value if extraction fails
}

/**
 * Apply format transformations to a value
 */
function applyFormatTransformation(value: any, config: FormatConfig): string {
  if (value === null || value === undefined) {
    return ''
  }

  let result = String(value)

  // Date formatting
  if (config.dateFormat && value) {
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        result = formatDate(date, config.dateFormat)
      }
    } catch (error) {
      console.warn('Failed to format date:', value, error)
    }
  }

  // Phone number formatting
  if (config.phoneFormat && result) {
    const digits = result.replace(/\D/g, '')
    if (digits.length === 10) {
      switch (config.phoneFormat) {
        case 'xxx-xxx-xxxx':
          result = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
          break
        case '(xxx) xxx-xxxx':
          result = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
          break
        case 'xxxxxxxxxx':
          result = digits
          break
      }
    }
  }

  // SSN formatting
  if (config.ssnFormat && result) {
    const digits = result.replace(/\D/g, '')
    if (digits.length === 9) {
      switch (config.ssnFormat) {
        case 'xxx-xx-xxxx':
          result = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
          break
        case 'xxxxxxxxx':
          result = digits
          break
      }
    }
  }

  // Case transformations
  if (config.caseTransform) {
    switch (config.caseTransform) {
      case 'upper':
        result = result.toUpperCase()
        break
      case 'lower':
        result = result.toLowerCase()
        break
      case 'title':
        result = result.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      case 'sentence':
        result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase()
        break
    }
  }

  // Add prefix/suffix
  if (config.prefix) {
    result = config.prefix + result
  }
  if (config.suffix) {
    result = result + config.suffix
  }

  return result
}

/**
 * Apply concatenation transformation
 */
function applyConcatenateTransformation(
  data: any,
  config: ConcatenateConfig
): string {
  const values: string[] = []
  const separator = config.separator ?? ' '
  const skipEmpty = config.skipEmpty ?? true

  for (const sourcePath of config.sources) {
    const value = getValueFromPath(data, sourcePath)
    const stringValue = value ? String(value) : ''
    
    if (!skipEmpty || stringValue.trim()) {
      values.push(stringValue)
    }
  }

  return values.join(separator)
}

/**
 * Apply conditional transformation
 */
function applyConditionalTransformation(
  data: any,
  config: ConditionalConfig
): any {
  const fieldValue = getValueFromPath(data, config.condition.field)
  let conditionMet = false

  switch (config.condition.operator) {
    case 'equals':
      conditionMet = fieldValue === config.condition.value
      break
    case 'notEquals':
      conditionMet = fieldValue !== config.condition.value
      break
    case 'contains':
      conditionMet = String(fieldValue).includes(String(config.condition.value))
      break
    case 'startsWith':
      conditionMet = String(fieldValue).startsWith(String(config.condition.value))
      break
    case 'endsWith':
      conditionMet = String(fieldValue).endsWith(String(config.condition.value))
      break
    case 'greaterThan':
      conditionMet = Number(fieldValue) > Number(config.condition.value)
      break
    case 'lessThan':
      conditionMet = Number(fieldValue) < Number(config.condition.value)
      break
  }

  return conditionMet ? config.trueValue : (config.falseValue ?? '')
}

/**
 * Apply lookup transformation
 */
function applyLookupTransformation(value: any, config: LookupConfig): any {
  const key = String(value)
  return config.lookupTable[key] ?? config.defaultValue ?? value
}

/**
 * Apply boolean transformation
 */
function applyBooleanTransformation(value: any, config: BooleanConfig): boolean {
  const trueValues = config.trueValues || ['true', 'yes', 'y', '1', 'on', 'checked', 'active']
  const falseValues = config.falseValues || ['false', 'no', 'n', '0', 'off', '', 'inactive']
  
  const stringValue = String(value || '').toLowerCase().trim()
  
  if (trueValues.includes(stringValue)) {
    return true
  }
  if (falseValues.includes(stringValue)) {
    return false
  }
  
  // Return default value or attempt to convert to boolean
  return config.defaultValue !== undefined ? config.defaultValue : Boolean(value)
}

/**
 * Apply name format transformation
 */
function applyNameFormatTransformation(data: any, config: NameFormatConfig): string {
  // Extract name parts from the data
  const firstName = getValueFromPath(data, 'provider.firstName') || ''
  const middleName = getValueFromPath(data, 'provider.middleName') || ''
  const lastName = getValueFromPath(data, 'provider.lastName') || ''
  const suffix = getValueFromPath(data, 'provider.suffix') || ''
  
  const middleInitial = middleName ? middleName.charAt(0).toUpperCase() + '.' : ''
  const separator = config.separator || ' '
  
  switch (config.format) {
    case 'full':
      return [firstName, middleName, lastName, suffix].filter(p => p).join(separator)
    
    case 'firstLast':
      return [firstName, lastName].filter(p => p).join(separator)
    
    case 'lastFirst':
      return lastName && firstName ? `${lastName}, ${firstName}` : [lastName, firstName].filter(p => p).join(separator)
    
    case 'lastFirstMI':
      const firstMI = middleInitial ? `${firstName} ${middleInitial}` : firstName
      return lastName && firstMI ? `${lastName}, ${firstMI}` : [lastName, firstMI].filter(p => p).join(separator)
    
    case 'firstMI':
      return [firstName, middleInitial].filter(p => p).join(' ')
    
    case 'first':
      return firstName
    
    case 'last':
      return lastName
    
    case 'middle':
      return middleName
    
    case 'initial':
      return firstName ? firstName.charAt(0).toUpperCase() : ''
    
    case 'custom':
      if (!config.customTemplate) return ''
      return config.customTemplate
        .replace('{first}', firstName)
        .replace('{middle}', middleName)
        .replace('{last}', lastName)
        .replace('{mi}', middleInitial)
        .replace('{suffix}', suffix)
        .trim()
    
    default:
      return firstName
  }
}

/**
 * Apply extract transformation
 */
function applyExtractTransformation(data: any, config: ExtractConfig): string {
  const fromPath = config.from || 'provider'
  let sourceData = getValueFromPath(data, fromPath)
  
  // If we're extracting from a full name string, we need to parse it
  if (typeof sourceData === 'string' && fromPath.includes('fullName')) {
    const nameParts = sourceData.trim().split(/\s+/)
    const parsed = {
      firstName: nameParts[0] || '',
      middleName: nameParts.length > 2 ? nameParts[1] : '',
      lastName: nameParts[nameParts.length - 1] || '',
      suffix: nameParts.length > 3 ? nameParts[nameParts.length - 1] : ''
    }
    sourceData = parsed
  } else {
    // Use the provider data structure
    sourceData = getValueFromPath(data, 'provider') || {}
  }
  
  switch (config.part) {
    case 'firstName':
      return sourceData.firstName || config.fallback || ''
    
    case 'middleName':
      return sourceData.middleName || config.fallback || ''
    
    case 'lastName':
      return sourceData.lastName || config.fallback || ''
    
    case 'middleInitial':
      const middleName = sourceData.middleName || ''
      return middleName ? middleName.charAt(0).toUpperCase() + '.' : config.fallback || ''
    
    case 'suffix':
      return sourceData.suffix || config.fallback || ''
    
    default:
      return config.fallback || ''
  }
}

/**
 * Get value from nested object path (e.g., 'provider.firstName')
 */
function getValueFromPath(data: any, path: string): any {
  if (!data || !path) return undefined

  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, data)
}

/**
 * Apply a transformation to data
 */
export function applyTransformation(
  value: any,
  transformation: TransformationConfig,
  allData?: any
): any {
  try {
    switch (transformation.type) {
      case 'format':
        return applyFormatTransformation(value, transformation.config as FormatConfig)
      
      case 'concatenate':
        return applyConcatenateTransformation(allData || {}, transformation.config as ConcatenateConfig)
      
      case 'conditional':
        return applyConditionalTransformation(allData || {}, transformation.config as ConditionalConfig)
      
      case 'lookup':
        return applyLookupTransformation(value, transformation.config as LookupConfig)
      
      case 'boolean':
        return applyBooleanTransformation(value, transformation.config as BooleanConfig)
      
      case 'nameFormat':
        return applyNameFormatTransformation(allData || {}, transformation.config as NameFormatConfig)
      
      case 'extract':
        return applyExtractTransformation(allData || {}, transformation.config as ExtractConfig)
      
      default:
        console.warn('Unknown transformation type:', transformation.type)
        return value
    }
  } catch (error) {
    console.error('Error applying transformation:', transformation.type, error)
    return value // Return original value on error
  }
}

/**
 * Common lookup tables for state abbreviations, etc.
 */
export const commonLookupTables = {
  stateAbbreviations: {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
  },
  
  stateNames: {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  }
}

/**
 * Helper function to create common transformations
 */
export const createTransformation = {
  formatDate: (format: string): TransformationConfig => ({
    type: 'format',
    config: { dateFormat: format }
  }),

  formatPhone: (format: FormatConfig['phoneFormat'] = 'xxx-xxx-xxxx'): TransformationConfig => ({
    type: 'format',
    config: { phoneFormat: format }
  }),

  formatSSN: (format: FormatConfig['ssnFormat'] = 'xxx-xx-xxxx'): TransformationConfig => ({
    type: 'format',
    config: { ssnFormat: format }
  }),

  concatenate: (sources: string[], separator = ' '): TransformationConfig => ({
    type: 'concatenate',
    config: { sources, separator, skipEmpty: true }
  }),

  lookup: (table: Record<string, any>, defaultValue?: any): TransformationConfig => ({
    type: 'lookup',
    config: { lookupTable: table, defaultValue }
  }),

  conditional: (
    field: string,
    operator: ConditionalConfig['condition']['operator'],
    value: any,
    trueValue: any,
    falseValue?: any
  ): TransformationConfig => ({
    type: 'conditional',
    config: {
      condition: { field, operator, value },
      trueValue,
      falseValue
    }
  }),

  boolean: (trueValues?: string[], falseValues?: string[], defaultValue?: boolean): TransformationConfig => ({
    type: 'boolean',
    config: { trueValues, falseValues, defaultValue }
  }),

  nameFormat: (format: NameFormatConfig['format'], customTemplate?: string): TransformationConfig => ({
    type: 'nameFormat',
    config: { format, customTemplate }
  }),

  extract: (part: ExtractConfig['part'], from?: string, fallback?: string): TransformationConfig => ({
    type: 'extract',
    config: { part, from, fallback }
  })
}