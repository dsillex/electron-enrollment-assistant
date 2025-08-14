import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, User, Briefcase, Mail, GraduationCap, Shield } from 'lucide-react'
import { ProviderSchema, type ProviderFormData } from '@shared/validation/schemas'
import { Provider } from '@shared/types'
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
import { PersonalInfoStep } from './steps/personal-info-step'
import { ProfessionalInfoStep } from './steps/professional-info-step'
import { ContactInfoStep } from './steps/contact-info-step'
import { EducationStep } from './steps/education-step'
import { InsuranceStep } from './steps/insurance-step'

interface ProviderFormWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: Provider | null
  onSubmit: (data: ProviderFormData) => Promise<void>
}

const formSteps = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: User,
    description: 'Basic personal details'
  },
  {
    id: 'professional',
    title: 'Professional Information',
    icon: Briefcase,
    description: 'License and specialties'
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: Mail,
    description: 'Phone, email, and addresses'
  },
  {
    id: 'education',
    title: 'Education & Training',
    icon: GraduationCap,
    description: 'Medical school and certifications'
  },
  {
    id: 'insurance',
    title: 'Insurance & Affiliations',
    icon: Shield,
    description: 'Malpractice and hospital affiliations'
  }
]

export function ProviderFormWizard({ 
  open, 
  onOpenChange, 
  provider, 
  onSubmit 
}: ProviderFormWizardProps) {
  const [currentStep, setCurrentStep] = useState('personal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(ProviderSchema),
    mode: 'onChange',
    defaultValues: provider ? {
      // Ensure all fields have default values to prevent undefined issues
      firstName: provider.firstName || '',
      middleName: provider.middleName || '',
      lastName: provider.lastName || '',
      suffix: provider.suffix || '',
      dateOfBirth: provider.dateOfBirth || '',
      ssn: provider.ssn || '',
      npi: provider.npi || '',
      licenseNumber: provider.licenseNumber || '',
      licenseState: provider.licenseState || '',
      licenseExpiration: provider.licenseExpiration || '',
      deaNumber: provider.deaNumber || '',
      deaExpiration: provider.deaExpiration || '',
      specialties: provider.specialties && provider.specialties.length > 0 ? provider.specialties : ['Family Medicine'],
      boardCertifications: provider.boardCertifications || [],
      email: provider.email || '',
      phone: provider.phone || '',
      cellPhone: provider.cellPhone || '',
      fax: provider.fax || '',
      practiceType: provider.practiceType || 'solo',
      groupName: provider.groupName || '',
      taxId: provider.taxId || '',
      medicareNumber: provider.medicareNumber || '',
      medicaidNumber: provider.medicaidNumber || '',
      
      // Additional Professional Information
      caqhId: provider.caqhId || '',
      providerType: provider.providerType || '',
      taxonomyCodes: provider.taxonomyCodes && provider.taxonomyCodes.length > 0 ? provider.taxonomyCodes : [],
      hireDate: provider.hireDate || '',
      medicareApprovalDate: provider.medicareApprovalDate || '',
      medicaidApprovalDate: provider.medicaidApprovalDate || '',
      medicalSchool: {
        name: provider.medicalSchool?.name || '',
        institution: provider.medicalSchool?.institution || '',
        specialty: provider.medicalSchool?.specialty || '',
        degree: provider.medicalSchool?.degree || '',
        graduationYear: provider.medicalSchool?.graduationYear || '',
        completionYear: provider.medicalSchool?.completionYear || ''
      },
      residency: provider.residency ? {
        name: provider.residency.name || '',
        institution: provider.residency.institution || '',
        specialty: provider.residency.specialty || '',
        degree: provider.residency.degree || '',
        graduationYear: provider.residency.graduationYear || '',
        completionYear: provider.residency.completionYear || ''
      } : {
        name: '',
        institution: '',
        specialty: '',
        degree: '',
        graduationYear: '',
        completionYear: ''
      },
      fellowship: provider.fellowship ? {
        name: provider.fellowship.name || '',
        institution: provider.fellowship.institution || '',
        specialty: provider.fellowship.specialty || '',
        degree: provider.fellowship.degree || '',
        graduationYear: provider.fellowship.graduationYear || '',
        completionYear: provider.fellowship.completionYear || ''
      } : {
        name: '',
        institution: '',
        specialty: '',
        degree: '',
        graduationYear: '',
        completionYear: ''
      },
      languages: provider.languages && provider.languages.length > 0 ? provider.languages : ['English'],
      hospitalAffiliations: provider.hospitalAffiliations || [],
      malpracticeInsurance: {
        carrier: provider.malpracticeInsurance?.carrier || '',
        policyNumber: provider.malpracticeInsurance?.policyNumber || '',
        coverageAmount: provider.malpracticeInsurance?.coverageAmount || '',
        expirationDate: provider.malpracticeInsurance?.expirationDate || ''
      },
      isActive: provider.isActive !== undefined ? provider.isActive : true,
      createdAt: provider.createdAt || '',
      updatedAt: provider.updatedAt || '',
      tags: provider.tags || []
    } : {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateOfBirth: '',
      ssn: '',
      npi: '',
      licenseNumber: '',
      licenseState: '',
      licenseExpiration: '',
      deaNumber: '',
      deaExpiration: '',
      specialties: ['Family Medicine'],
      boardCertifications: [],
      email: '',
      phone: '',
      cellPhone: '',
      fax: '',
      practiceType: 'solo',
      groupName: '',
      taxId: '',
      medicareNumber: '',
      medicaidNumber: '',
      
      // Additional Professional Information
      caqhId: '',
      providerType: '',
      taxonomyCodes: [],
      hireDate: '',
      medicareApprovalDate: '',
      medicaidApprovalDate: '',
      medicalSchool: {
        name: '',
        institution: '',
        specialty: '',
        degree: '',
        graduationYear: '',
        completionYear: ''
      },
      residency: {
        name: '',
        institution: '',
        specialty: '',
        degree: '',
        graduationYear: '',
        completionYear: ''
      },
      fellowship: {
        name: '',
        institution: '',
        specialty: '',
        degree: '',
        graduationYear: '',
        completionYear: ''
      },
      languages: ['English'],
      hospitalAffiliations: [],
      malpracticeInsurance: {
        carrier: '',
        policyNumber: '',
        coverageAmount: '',
        expirationDate: ''
      },
      isActive: true,
      createdAt: '',
      updatedAt: '',
      tags: []
    }
  })

  // Reset form when provider changes or dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep('personal')
      
      if (provider) {
        // Reset form with provider data
        form.reset({
          // Ensure all fields have default values to prevent undefined issues
          firstName: provider.firstName || '',
          middleName: provider.middleName || '',
          lastName: provider.lastName || '',
          suffix: provider.suffix || '',
          dateOfBirth: provider.dateOfBirth || '',
          ssn: provider.ssn || '',
          npi: provider.npi || '',
          licenseNumber: provider.licenseNumber || '',
          licenseState: provider.licenseState || '',
          licenseExpiration: provider.licenseExpiration || '',
          deaNumber: provider.deaNumber || '',
          deaExpiration: provider.deaExpiration || '',
          specialties: provider.specialties && provider.specialties.length > 0 ? provider.specialties : ['Family Medicine'],
          boardCertifications: provider.boardCertifications || [],
          email: provider.email || '',
          phone: provider.phone || '',
          cellPhone: provider.cellPhone || '',
          fax: provider.fax || '',
          practiceType: provider.practiceType || 'solo',
          groupName: provider.groupName || '',
          taxId: provider.taxId || '',
          medicareNumber: provider.medicareNumber || '',
          medicaidNumber: provider.medicaidNumber || '',
          
          // Additional Professional Information
          caqhId: provider.caqhId || '',
          providerType: provider.providerType || '',
          taxonomyCodes: provider.taxonomyCodes && provider.taxonomyCodes.length > 0 ? provider.taxonomyCodes : [],
          hireDate: provider.hireDate || '',
          medicareApprovalDate: provider.medicareApprovalDate || '',
          medicaidApprovalDate: provider.medicaidApprovalDate || '',
          medicalSchool: {
            name: provider.medicalSchool?.name || '',
            institution: provider.medicalSchool?.institution || '',
            specialty: provider.medicalSchool?.specialty || '',
            degree: provider.medicalSchool?.degree || '',
            graduationYear: provider.medicalSchool?.graduationYear || '',
            completionYear: provider.medicalSchool?.completionYear || ''
          },
          residency: provider.residency ? {
            name: provider.residency.name || '',
            institution: provider.residency.institution || '',
            specialty: provider.residency.specialty || '',
            degree: provider.residency.degree || '',
            graduationYear: provider.residency.graduationYear || '',
            completionYear: provider.residency.completionYear || ''
          } : {
            name: '',
            institution: '',
            specialty: '',
            degree: '',
            graduationYear: '',
            completionYear: ''
          },
          fellowship: provider.fellowship ? {
            name: provider.fellowship.name || '',
            institution: provider.fellowship.institution || '',
            specialty: provider.fellowship.specialty || '',
            degree: provider.fellowship.degree || '',
            graduationYear: provider.fellowship.graduationYear || '',
            completionYear: provider.fellowship.completionYear || ''
          } : {
            name: '',
            institution: '',
            specialty: '',
            degree: '',
            graduationYear: '',
            completionYear: ''
          },
          languages: provider.languages && provider.languages.length > 0 ? provider.languages : ['English'],
          hospitalAffiliations: provider.hospitalAffiliations || [],
          malpracticeInsurance: {
            carrier: provider.malpracticeInsurance?.carrier || '',
            policyNumber: provider.malpracticeInsurance?.policyNumber || '',
            coverageAmount: provider.malpracticeInsurance?.coverageAmount || '',
            expirationDate: provider.malpracticeInsurance?.expirationDate || ''
          },
          isActive: provider.isActive !== undefined ? provider.isActive : true,
          createdAt: provider.createdAt || '',
          updatedAt: provider.updatedAt || '',
          tags: provider.tags || []
        })
      } else {
        // Reset form with empty values for new provider
        form.reset({
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          dateOfBirth: '',
          ssn: '',
          npi: '',
          licenseNumber: '',
          licenseState: '',
          licenseExpiration: '',
          deaNumber: '',
          deaExpiration: '',
          specialties: ['Family Medicine'],
          boardCertifications: [],
          email: '',
          phone: '',
          cellPhone: '',
          fax: '',
          practiceType: 'solo',
          groupName: '',
          taxId: '',
          medicareNumber: '',
          medicaidNumber: '',
          
          // Additional Professional Information
          caqhId: '',
          providerType: '',
          taxonomyCodes: [],
          hireDate: '',
          medicareApprovalDate: '',
          medicaidApprovalDate: '',
          medicalSchool: {
            name: '',
            institution: '',
            specialty: '',
            degree: '',
            graduationYear: '',
            completionYear: ''
          },
          residency: {
            name: '',
            institution: '',
            specialty: '',
            degree: '',
            graduationYear: '',
            completionYear: ''
          },
          fellowship: {
            name: '',
            institution: '',
            specialty: '',
            degree: '',
            graduationYear: '',
            completionYear: ''
          },
          languages: ['English'],
          hospitalAffiliations: [],
          malpracticeInsurance: {
            carrier: '',
            policyNumber: '',
            coverageAmount: '',
            expirationDate: ''
          },
          isActive: true,
          createdAt: '',
          updatedAt: '',
          tags: []
        })
      }
    }
  }, [open, provider, form])

  const handleSubmit = async (data: ProviderFormData) => {
    try {
      setIsSubmitting(true)
      console.log('=== Form Submission Started ===')
      console.log('Form data received:', JSON.stringify(data, null, 2))
      console.log('Form errors:', form.formState.errors)
      console.log('Form is valid:', form.formState.isValid)
      
      // Clean up empty strings in arrays and ensure at least one item for required arrays
      const cleanData = {
        ...data,
        specialties: data.specialties.filter(s => s && s.trim() !== ''),
        languages: data.languages.filter(l => l && l.trim() !== ''),
        tags: data.tags?.filter(t => t && t.trim() !== '') || []
      }
      
      // Ensure required arrays have at least one item
      if (cleanData.specialties.length === 0) {
        throw new Error('At least one specialty is required')
      }
      if (cleanData.languages.length === 0) {
        throw new Error('At least one language is required')
      }
      
      console.log('Cleaned form data:', JSON.stringify(cleanData, null, 2))
      console.log('Calling onSubmit with cleaned data...')
      
      await onSubmit(cleanData)
      
      console.log('onSubmit completed successfully')
      form.reset()
      setCurrentStep('personal')
      onOpenChange(false)
      console.log('=== Form Submission Completed Successfully ===')
    } catch (error) {
      console.error('=== Form Submission Failed ===')
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      // Don't close the form on error so user can see what went wrong
    } finally {
      setIsSubmitting(false)
      console.log('=== Form Submission Ended ===')
    }
  }

  const handleForceSubmit = () => {
    console.log('=== Force Submit - Bypassing Validation ===')
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
            {provider ? 'Edit Provider' : 'Add New Provider'}
          </DialogTitle>
          <DialogDescription>
            {provider 
              ? 'Update provider information across all categories' 
              : 'Enter provider information in the form below. You can navigate between sections using the tabs.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="flex-1 overflow-hidden">
            <Tabs value={currentStep} onValueChange={setCurrentStep} className="h-full">
              <TabsList className="grid w-full grid-cols-5">
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
                <TabsContent value="personal" className="space-y-6">
                  <PersonalInfoStep form={form} />
                </TabsContent>
                
                <TabsContent value="professional" className="space-y-6">
                  <ProfessionalInfoStep form={form} />
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-6">
                  <ContactInfoStep form={form} />
                </TabsContent>
                
                <TabsContent value="education" className="space-y-6">
                  <EducationStep form={form} />
                </TabsContent>
                
                <TabsContent value="insurance" className="space-y-6">
                  <InsuranceStep form={form} />
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
                  {isSubmitting ? 'Saving...' : provider ? 'Update Provider' : 'Create Provider'}
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