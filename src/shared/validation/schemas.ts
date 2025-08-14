import { z } from 'zod'

// Base validation schemas
const phoneRegex = /^\+?[\d\s\-\(\)\.]+$/
const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/
const npiRegex = /^\d{10}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const zipCodeRegex = /^\d{5}(-\d{4})?$/

// Common field schemas
export const PersonNameSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50),
  suffix: z.string().max(10).optional()
})

export const AddressSchema = z.object({
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().regex(zipCodeRegex, 'Invalid ZIP code format').max(10),
  county: z.string().max(50).optional()
})

export const ContactInfoSchema = z.object({
  email: z.string().regex(emailRegex, 'Invalid email format'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  cellPhone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  fax: z.string().regex(phoneRegex, 'Invalid fax number format').optional()
})

// Board Certification Schema
export const BoardCertificationSchema = z.object({
  board: z.string().min(1, 'Board name is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  certificationDate: z.string().min(1, 'Certification date is required'),
  expirationDate: z.string().min(1, 'Expiration date is required')
})

// Medical Education Schema
export const MedicalEducationSchema = z.object({
  name: z.string().optional(),
  institution: z.string().optional(),
  specialty: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.string().optional(),
  completionYear: z.string().optional()
}).refine(
  (data) => data.name || data.institution,
  { message: 'Either name or institution is required' }
)

// Hospital Affiliation Schema
export const HospitalAffiliationSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  privilegeStatus: z.string().min(1, 'Privilege status is required'),
  startDate: z.string().min(1, 'Start date is required')
})

// Malpractice Insurance Schema
export const MalpracticeInsuranceSchema = z.object({
  carrier: z.string().min(1, 'Insurance carrier is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  coverageAmount: z.string().min(1, 'Coverage amount is required'),
  expirationDate: z.string().min(1, 'Expiration date is required')
})

// Office Hours Schema
export const DayHoursSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  lunchStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional(),
  lunchEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional()
})

export const OfficeHoursSchema = z.object({
  monday: DayHoursSchema.optional(),
  tuesday: DayHoursSchema.optional(),
  wednesday: DayHoursSchema.optional(),
  thursday: DayHoursSchema.optional(),
  friday: DayHoursSchema.optional(),
  saturday: DayHoursSchema.optional(),
  sunday: DayHoursSchema.optional()
})

// Main Provider Schema
export const ProviderSchema = z.object({
  id: z.string().optional(),
  
  // Personal Information
  firstName: z.string().min(1, 'First name is required').max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50),
  suffix: z.string().max(10).optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssn: z.string().regex(ssnRegex, 'Invalid SSN format'),
  
  // Professional Information
  npi: z.string().regex(npiRegex, 'NPI must be exactly 10 digits'),
  licenseNumber: z.string().min(1, 'License number is required').max(20),
  licenseState: z.string().min(2, 'License state is required').max(2),
  licenseExpiration: z.string().min(1, 'License expiration is required'),
  deaNumber: z.string().max(20).optional(),
  deaExpiration: z.string().optional(),
  specialties: z.array(z.string().min(1)).min(1, 'At least one specialty is required'),
  boardCertifications: z.array(BoardCertificationSchema),
  
  // Contact Information
  email: z.string().regex(emailRegex, 'Invalid email format'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  cellPhone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  fax: z.string().regex(phoneRegex, 'Invalid fax number format').optional(),
  
  // Employment/Practice Information
  practiceType: z.enum(['solo', 'group', 'hospital', 'other']),
  groupName: z.string().max(100).optional(),
  taxId: z.string().min(1, 'Tax ID is required'),
  medicareNumber: z.string().optional(),
  medicaidNumber: z.string().optional(),
  
  // Education
  medicalSchool: MedicalEducationSchema,
  residency: MedicalEducationSchema.optional(),
  fellowship: MedicalEducationSchema.optional(),
  
  // Additional Information
  languages: z.array(z.string().min(1)).min(1, 'At least one language is required'),
  hospitalAffiliations: z.array(HospitalAffiliationSchema),
  malpracticeInsurance: MalpracticeInsuranceSchema,
  
  // Metadata
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string().min(1)).optional()
})

// Office Location Schema
export const OfficeLocationSchema = z.object({
  id: z.string().optional(),
  locationName: z.string().min(1, 'Location name is required').max(100),
  locationType: z.enum(['primary', 'satellite', 'hospital', 'clinic']),
  
  // Address Information
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().regex(zipCodeRegex, 'Invalid ZIP code format'),
  county: z.string().max(50).optional(),
  
  // Contact Information
  mainPhone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  fax: z.string().regex(phoneRegex, 'Invalid fax number format').optional(),
  appointmentPhone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  
  // Practice Information
  officeHours: OfficeHoursSchema,
  
  // Accessibility
  wheelchairAccessible: z.boolean(),
  publicTransportation: z.string().optional(),
  parkingInformation: z.string().optional(),
  
  // Associated Providers
  providerIds: z.array(z.string()),
  
  // Billing Information
  billingNPI: z.string().regex(npiRegex, 'Billing NPI must be exactly 10 digits').optional(),
  placeOfServiceCode: z.string().max(10).optional(),
  
  // Metadata
  isActive: z.boolean().default(true),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  terminationDate: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// Mailing Address Schema
export const MailingAddressSchema = z.object({
  id: z.string().optional(),
  addressName: z.string().min(1, 'Address name is required').max(100),
  addressType: z.enum(['correspondence', 'billing', 'legal', 'other']),
  
  // Address Information
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().regex(zipCodeRegex, 'Invalid ZIP code format'),
  
  // Contact
  attentionTo: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
  
  // Associations
  providerIds: z.array(z.string()).optional(),
  officeIds: z.array(z.string()).optional(),
  
  // Metadata
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  tags: z.array(z.string()).optional()
})

// Export types from schemas
export type ProviderFormData = z.infer<typeof ProviderSchema>
export type OfficeLocationFormData = z.infer<typeof OfficeLocationSchema>
export type MailingAddressFormData = z.infer<typeof MailingAddressSchema>

// Validation helper functions
export const validateProvider = (data: unknown) => {
  return ProviderSchema.safeParse(data)
}

export const validateOfficeLocation = (data: unknown) => {
  return OfficeLocationSchema.safeParse(data)
}

export const validateMailingAddress = (data: unknown) => {
  return MailingAddressSchema.safeParse(data)
}