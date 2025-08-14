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
import { Checkbox } from '@renderer/components/ui/checkbox'

interface InsuranceStepProps {
  form: UseFormReturn<ProviderFormData>
}

const malpracticeCarriers = [
  'The Doctors Company',
  'Medical Protective',
  'NORCAL Mutual',
  'ProAssurance',
  'Coverys',
  'MagMutual',
  'OMIC',
  'Other'
]

const privilegeStatuses = [
  'Active',
  'Courtesy',
  'Consulting',
  'Honorary',
  'Inactive',
  'Pending',
  'Suspended'
]

export function InsuranceStep({ form }: InsuranceStepProps) {
  const { fields: affiliationFields, append: appendAffiliation, remove: removeAffiliation } = useFieldArray({
    control: form.control,
    name: "hospitalAffiliations"
  })

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control: form.control,
    name: "tags"
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Insurance & Affiliations</h3>
        <p className="text-sm text-muted-foreground">
          Malpractice insurance and hospital affiliations.
        </p>
      </div>

      {/* Malpractice Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Malpractice Insurance</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="malpracticeInsurance.carrier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Carrier *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {malpracticeCarriers.map((carrier) => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
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
            name="malpracticeInsurance.policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Number *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MP123456789"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="malpracticeInsurance.coverageAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Amount *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coverage amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$1,000,000">$1,000,000 / $3,000,000</SelectItem>
                      <SelectItem value="$2,000,000">$2,000,000 / $6,000,000</SelectItem>
                      <SelectItem value="$3,000,000">$3,000,000 / $9,000,000</SelectItem>
                      <SelectItem value="$5,000,000">$5,000,000 / $15,000,000</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Per occurrence / Aggregate coverage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="malpracticeInsurance.expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Hospital Affiliations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hospital Affiliations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {affiliationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded">
              <FormField
                control={form.control}
                name={`hospitalAffiliations.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                      <Input placeholder="St. Mary's Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`hospitalAffiliations.${index}.privilegeStatus`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privilege Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {privilegeStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`hospitalAffiliations.${index}.startDate`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Date</FormLabel>
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
                  onClick={() => removeAffiliation(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendAffiliation({
              name: '',
              privilegeStatus: '',
              startDate: ''
            })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital Affiliation
          </Button>
        </CardContent>
      </Card>

      {/* Provider Status and Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provider Status & Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                    Active Provider
                  </FormLabel>
                  <FormDescription>
                    Check this box if the provider is actively seeing patients
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Tags */}
          <div className="space-y-4">
            <FormLabel>Tags</FormLabel>
            <FormDescription>
              Add tags to categorize and organize providers (e.g., "primary care", "specialist", "new hire")
            </FormDescription>
            
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`tags.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g., cardiologist, primary care" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeTag(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendTag('')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}