import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Building, MapPin, Clock, Settings } from 'lucide-react'
import { OfficeLocationSchema, type OfficeLocationFormData } from '@shared/validation/schemas'
import { OfficeLocation } from '@shared/types'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Form } from '@renderer/components/ui/form'
import { OfficeBasicStep } from './steps/office-basic-step'
import { OfficeAddressStep } from './steps/office-address-step'

interface OfficeFormWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  office?: OfficeLocation | null
  onSubmit: (data: OfficeLocationFormData) => Promise<void>
}

const formSteps = [
  {
    id: 'basic',
    title: 'Basic Information',
    icon: Building,
    description: 'Location name and type'
  },
  {
    id: 'address',
    title: 'Address',
    icon: MapPin,
    description: 'Physical location details'
  },
  {
    id: 'hours',
    title: 'Hours & Access',
    icon: Clock,
    description: 'Operating hours and accessibility'
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    description: 'Billing and additional settings'
  }
]

export function OfficeFormWizard({ 
  open, 
  onOpenChange, 
  office, 
  onSubmit 
}: OfficeFormWizardProps) {
  const [currentStep, setCurrentStep] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OfficeLocationFormData>({
    resolver: zodResolver(OfficeLocationSchema),
    mode: 'onChange',
    defaultValues: office ? {
      // Ensure all fields have default values to prevent undefined issues
      locationName: office.locationName || '',
      locationType: office.locationType || 'primary',
      addressLine1: office.addressLine1 || '',
      addressLine2: office.addressLine2 || '',
      city: office.city || '',
      state: office.state || '',
      zipCode: office.zipCode || '',
      county: office.county || '',
      mainPhone: office.mainPhone || '',
      fax: office.fax || '',
      appointmentPhone: office.appointmentPhone || '',
      officeHours: office.officeHours || {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' }
      },
      wheelchairAccessible: office.wheelchairAccessible !== undefined ? office.wheelchairAccessible : true,
      publicTransportation: office.publicTransportation || '',
      parkingInformation: office.parkingInformation || '',
      providerIds: office.providerIds || [],
      billingNPI: office.billingNPI || '',
      placeOfServiceCode: office.placeOfServiceCode || '',
      isActive: office.isActive !== undefined ? office.isActive : true,
      effectiveDate: office.effectiveDate || new Date().toISOString().split('T')[0],
      terminationDate: office.terminationDate || '',
      tags: office.tags || []
    } : {
      locationName: '',
      locationType: 'primary',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      county: '',
      mainPhone: '',
      fax: '',
      appointmentPhone: '',
      officeHours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' }
      },
      wheelchairAccessible: true,
      publicTransportation: '',
      parkingInformation: '',
      providerIds: [],
      billingNPI: '',
      placeOfServiceCode: '',
      isActive: true,
      effectiveDate: new Date().toISOString().split('T')[0],
      terminationDate: '',
      tags: []
    }
  })

  const handleSubmit = async (data: OfficeLocationFormData) => {
    try {
      setIsSubmitting(true)
      console.log('=== Office Form Submission Started ===')
      console.log('Form data received:', JSON.stringify(data, null, 2))
      console.log('Form errors:', form.formState.errors)
      console.log('Form is valid:', form.formState.isValid)
      
      // Clean up the data
      const cleanData = {
        ...data,
        tags: data.tags?.filter(t => t && t.trim() !== '') || []
      }
      
      console.log('Cleaned form data:', JSON.stringify(cleanData, null, 2))
      console.log('Calling onSubmit with cleaned data...')
      
      await onSubmit(cleanData)
      
      console.log('onSubmit completed successfully')
      form.reset()
      setCurrentStep('basic')
      onOpenChange(false)
      console.log('=== Office Form Submission Completed Successfully ===')
    } catch (error) {
      console.error('=== Office Form Submission Failed ===')
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      // Don't close the form on error so user can see what went wrong
    } finally {
      setIsSubmitting(false)
      console.log('=== Office Form Submission Ended ===')
    }
  }

  const handleForceSubmit = () => {
    console.log('=== Force Submit Office - Bypassing Validation ===')
    const formData = form.getValues()
    handleSubmit(formData)
  }

  const handleNext = () => {
    const currentIndex = formSteps.findIndex(step => step.id === currentStep)
    if (currentIndex < formSteps.length - 1) {
      setCurrentStep(formSteps[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = formSteps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(formSteps[currentIndex - 1].id)
    }
  }

  const isLastStep = currentStep === formSteps[formSteps.length - 1].id
  const isFirstStep = currentStep === formSteps[0].id

  const currentStepIndex = formSteps.findIndex(step => step.id === currentStep)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {office ? 'Edit Office Location' : 'Add New Office Location'}
          </DialogTitle>
          <DialogDescription>
            {office 
              ? 'Update office location information across all categories' 
              : 'Enter office location information in the form below. You can navigate between sections using the tabs.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="flex-1 overflow-hidden">
            <Tabs value={currentStep} onValueChange={setCurrentStep} className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                {formSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isCompleted = index < currentStepIndex
                  const isCurrent = step.id === currentStep
                  
                  return (
                    <TabsTrigger
                      key={step.id}
                      value={step.id}
                      className="flex flex-col items-center gap-1 p-3"
                      disabled={isSubmitting}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isCurrent 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white' 
                          : 'border-muted-foreground'
                      }`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-medium">{step.title}</div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <div className="mt-6 h-96 overflow-y-auto">
                <TabsContent value="basic" className="space-y-6">
                  <OfficeBasicStep form={form} />
                </TabsContent>
                
                <TabsContent value="address" className="space-y-6">
                  <OfficeAddressStep form={form} />
                </TabsContent>
                
                <TabsContent value="hours" className="space-y-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Hours & Access form step - To be implemented
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Settings form step - To be implemented
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </Form>

        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {formSteps.length}
          </div>

          {isLastStep ? (
            <div className="flex flex-col items-end gap-2">
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="text-sm text-destructive">
                  Form has errors. Check all required fields.
                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="text-xs mt-1">
                      Errors in: {Object.keys(form.formState.errors).join(', ')}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleForceSubmit}
                  disabled={isSubmitting}
                  size="sm"
                >
                  Force Submit (Debug)
                </Button>
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : office ? 'Update Office' : 'Create Office'}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}