import React from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { ProviderFormData } from '@shared/validation/schemas'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'

interface ProfessionalInfoStepProps {
  form: UseFormReturn<ProviderFormData>
}

const medicalSpecialties = [
  'Allergy and Immunology',
  'Anesthesiology',
  'Cardiology',
  'Cardiovascular Surgery',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Geriatrics',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Neurology',
  'Neurosurgery',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedic Surgery',
  'Otolaryngology',
  'Pathology',
  'Pediatrics',
  'Physical Medicine and Rehabilitation',
  'Plastic Surgery',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology'
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function ProfessionalInfoStep({ form }: ProfessionalInfoStepProps) {
  const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
    control: form.control,
    name: "specialties"
  })

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "boardCertifications"
  })

  const formatNPI = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10)
  }

  const formatDEA = (value: string) => {
    return value.toUpperCase().slice(0, 9)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Professional Information</h3>
        <p className="text-sm text-muted-foreground">
          License information and professional credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="npi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NPI Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="1234567890"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatNPI(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={10}
                />
              </FormControl>
              <FormDescription>
                10-digit National Provider Identifier
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number *</FormLabel>
              <FormControl>
                <Input placeholder="CA12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseState"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License State *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseExpiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Expiration *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deaNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DEA Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="BS1234567"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatDEA(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={9}
                />
              </FormControl>
              <FormDescription>
                Required for prescribing controlled substances
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deaExpiration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DEA Expiration</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Specialties Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical Specialties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {specialtyFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`specialties.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicalSpecialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeSpecialty(index)}
                disabled={specialtyFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendSpecialty('Family Medicine')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Specialty
          </Button>
        </CardContent>
      </Card>

      {/* Board Certifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Board Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded">
              <FormField
                control={form.control}
                name={`boardCertifications.${index}.board`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board</FormLabel>
                    <FormControl>
                      <Input placeholder="ABIM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`boardCertifications.${index}.specialty`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardiology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`boardCertifications.${index}.certificationDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`boardCertifications.${index}.expirationDate`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeCertification(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendCertification({
              board: '',
              specialty: '',
              certificationDate: '',
              expirationDate: ''
            })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Board Certification
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="medicareNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicare Provider Number</FormLabel>
              <FormControl>
                <Input placeholder="1234567890A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicaidNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicaid Provider Number</FormLabel>
              <FormControl>
                <Input placeholder="CA1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Additional Professional Information */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-4">Additional Professional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="caqhId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAQH ID</FormLabel>
                <FormControl>
                  <Input placeholder="CAQH credentialing ID" {...field} />
                </FormControl>
                <FormDescription>
                  Council for Affordable Quality Healthcare ID
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="providerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Type</FormLabel>
                <FormControl>
                  <Input placeholder="MD, DO, CNP, PA, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Shorthand provider credential/type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicareApprovalDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicare Approval Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicaidApprovalDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicaid Approval Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Taxonomy Codes Section */}
        <div className="mt-4">
          <FormField
            control={form.control}
            name="taxonomyCodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxonomy Codes</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter taxonomy codes separated by commas" 
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    onChange={(e) => {
                      const codes = e.target.value.split(',').map(code => code.trim()).filter(code => code.length > 0)
                      field.onChange(codes)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Healthcare Provider Taxonomy Codes (comma-separated)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}