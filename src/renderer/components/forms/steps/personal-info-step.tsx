import React from 'react'
import { UseFormReturn } from 'react-hook-form'
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

interface PersonalInfoStepProps {
  form: UseFormReturn<ProviderFormData>
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const formatSSN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as XXX-XX-XXXX
    if (digits.length >= 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
    } else if (digits.length >= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
    } else if (digits.length >= 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`
    }
    return digits
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personal Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the provider's basic personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input placeholder="Michael" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name *</FormLabel>
              <FormControl>
                <Input placeholder="Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suffix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suffix</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select suffix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MD">MD</SelectItem>
                    <SelectItem value="DO">DO</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="NP">NP</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="Jr">Jr</SelectItem>
                    <SelectItem value="Sr">Sr</SelectItem>
                    <SelectItem value="II">II</SelectItem>
                    <SelectItem value="III">III</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Required for credentialing and verification
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ssn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Social Security Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="XXX-XX-XXXX"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatSSN(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={11}
                />
              </FormControl>
              <FormDescription>
                Used for background checks and credentialing. This information is encrypted.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="practiceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Practice Type *</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Practice</SelectItem>
                    <SelectItem value="group">Group Practice</SelectItem>
                    <SelectItem value="hospital">Hospital Employed</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group/Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Medical Associates" {...field} />
              </FormControl>
              <FormDescription>
                Required if practice type is group or hospital
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="taxId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID (EIN) *</FormLabel>
            <FormControl>
              <Input
                placeholder="XX-XXXXXXX"
                {...field}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length >= 2) {
                    value = `${value.slice(0, 2)}-${value.slice(2, 9)}`
                  }
                  field.onChange(value)
                }}
                maxLength={10}
              />
            </FormControl>
            <FormDescription>
              Federal Tax Identification Number. This information is encrypted.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}