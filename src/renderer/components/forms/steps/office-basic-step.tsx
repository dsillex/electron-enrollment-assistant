import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { OfficeLocationFormData } from '@shared/validation/schemas'
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
import { Checkbox } from '@renderer/components/ui/checkbox'

interface OfficeBasicStepProps {
  form: UseFormReturn<OfficeLocationFormData>
}

const locationTypes = [
  { value: 'primary', label: 'Primary Location' },
  { value: 'satellite', label: 'Satellite Office' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' }
]

export function OfficeBasicStep({ form }: OfficeBasicStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the basic details for this office location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="locationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name *</FormLabel>
              <FormControl>
                <Input placeholder="Main Office" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this office location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                The category that best describes this location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mainPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Phone Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="(555) 123-4567"
                  {...field}
                  onChange={(e) => {
                    // Format phone number as user types
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormDescription>
                Primary contact number for this location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fax Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="(555) 123-4568"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="(555) 123-4569"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormDescription>
                Dedicated number for scheduling appointments (if different)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="effectiveDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective Date *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Date when this office location became active
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Active Location
                </FormLabel>
                <FormDescription>
                  Check if this office location is currently active and accepting patients
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terminationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termination Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Date when this office location was closed (if applicable)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  
  if (digits.length >= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  } else if (digits.length >= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length >= 3) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }
  return digits
}