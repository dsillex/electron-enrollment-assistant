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
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'

interface EducationStepProps {
  form: UseFormReturn<ProviderFormData>
}

const medicalDegrees = [
  'MD - Doctor of Medicine',
  'DO - Doctor of Osteopathic Medicine',
  'MBBS - Bachelor of Medicine, Bachelor of Surgery',
  'MBChB - Bachelor of Medicine, Bachelor of Surgery',
  'Other'
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i)

export function EducationStep({ form }: EducationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Education & Training</h3>
        <p className="text-sm text-muted-foreground">
          Medical education, residency, and fellowship information.
        </p>
      </div>

      {/* Medical School */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical School</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="medicalSchool.name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Medical School Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Harvard Medical School"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicalSchool.degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalDegrees.map((degree) => (
                        <SelectItem key={degree} value={degree.split(' - ')[0]}>
                          {degree}
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
            name="medicalSchool.graduationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Graduation Year *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Residency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Residency Training</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="residency.institution"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Residency Institution</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Johns Hopkins Hospital"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Hospital or institution where residency was completed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="residency.specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residency Specialty</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Internal Medicine"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="residency.completionYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion Year</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Fellowship */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fellowship Training</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fellowship.institution"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Fellowship Institution</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Mayo Clinic"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Hospital or institution where fellowship was completed (if applicable)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fellowship.specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fellowship Specialty</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cardiology"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fellowship.completionYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion Year</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <FormDescription>
            This education information will be used for credentialing verification and may be 
            shared with insurance plans and hospitals during the enrollment process. Please 
            ensure all information is accurate and up-to-date.
          </FormDescription>
        </CardContent>
      </Card>
    </div>
  )
}