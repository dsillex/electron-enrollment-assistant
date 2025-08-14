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

interface ContactInfoStepProps {
  form: UseFormReturn<ProviderFormData>
}

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese (Mandarin)',
  'Chinese (Cantonese)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Vietnamese',
  'Tagalog',
  'Other'
]

export function ContactInfoStep({ form }: ContactInfoStepProps) {
  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: "languages"
  })

  const formatPhoneNumber = (value: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Contact Information</h3>
        <p className="text-sm text-muted-foreground">
          Phone numbers, email address, and language capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="doctor@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Primary email for professional correspondence
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Phone *</FormLabel>
              <FormControl>
                <Input
                  placeholder="(555) 123-4567"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormDescription>
                Main contact number for the provider
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cellPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cell Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="(555) 987-6543"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormDescription>
                Mobile phone for urgent contact
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
              <FormDescription>
                Fax number for document transmission
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Languages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages Spoken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormDescription>
            Specify all languages the provider can communicate with patients in.
          </FormDescription>
          
          {languageFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`languages.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
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
                onClick={() => removeLanguage(index)}
                disabled={languageFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => appendLanguage('English')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </CardContent>
      </Card>

      {/* Additional Contact Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FormLabel>Preferred Contact Method</FormLabel>
            <FormDescription>
              This information helps determine the best way to reach the provider for administrative matters.
            </FormDescription>
          </div>
          
          <div className="space-y-2">
            <FormLabel>Emergency Contact</FormLabel>
            <FormDescription>
              For urgent matters requiring immediate provider attention outside normal business hours.
            </FormDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}