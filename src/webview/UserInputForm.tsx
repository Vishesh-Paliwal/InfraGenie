import React, { useState, useRef, useEffect } from 'react';
import { UserInputData } from '../types';
// Styles imported in App.tsx

interface UserInputFormProps {
  onSubmit: (data: UserInputData) => void;
}

interface FormErrors {
  [key: string]: string;
}

function UserInputForm({ onSubmit }: UserInputFormProps) {
  const [formData, setFormData] = useState<Partial<UserInputData>>({
    processingType: 'real-time',
    regions: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const firstErrorRef = useRef<HTMLSelectElement | HTMLTextAreaElement>(null);

  // Focus on first error field when validation fails
  useEffect(() => {
    if (Object.keys(errors).length > 0 && firstErrorRef.current) {
      firstErrorRef.current.focus();
    }
  }, [errors]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleProcessingTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ 
      ...prev, 
      processingType: e.target.value as 'real-time' | 'batch' 
    }));
    if (errors.processingType) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.processingType;
        return newErrors;
      });
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, regions: selectedOptions }));
    if (errors.regions) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.regions;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.appType) {
      newErrors.appType = 'App type is required';
    }
    if (!formData.expectedUsers) {
      newErrors.expectedUsers = 'Expected users is required';
    }
    if (!formData.trafficPattern) {
      newErrors.trafficPattern = 'Traffic pattern is required';
    }
    if (!formData.processingType) {
      newErrors.processingType = 'Processing type is required';
    }
    if (!formData.dataSensitivity) {
      newErrors.dataSensitivity = 'Data sensitivity is required';
    }
    if (!formData.regions || formData.regions.length === 0) {
      newErrors.regions = 'At least one region is required';
    }
    if (!formData.availabilityRequirement) {
      newErrors.availabilityRequirement = 'Availability requirement is required';
    }
    if (!formData.detailedDescription || formData.detailedDescription.trim() === '') {
      newErrors.detailedDescription = 'Detailed description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as UserInputData);
    }
  };

  return (
    <div className="userInputFormContainer" role="main">
      <div className="formHeader">
        <h2 id="form-title">Project Requirements</h2>
        <p className="formDescription">
          Tell us about your project so we can generate an accurate PRD
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="userInputForm"
        aria-labelledby="form-title"
        noValidate
      >
        {/* App Type */}
        <div className="formGroup">
          <label htmlFor="appType">
            App Type <span className="required" aria-label="required">*</span>
          </label>
          <select
            id="appType"
            name="appType"
            value={formData.appType || ''}
            onChange={handleInputChange}
            className={errors.appType ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.appType}
            aria-describedby={errors.appType ? 'appType-error' : undefined}
            ref={errors.appType ? firstErrorRef as React.RefObject<HTMLSelectElement> : undefined}
          >
            <option value="">Select app type</option>
            <option value="SaaS">SaaS</option>
            <option value="AI app">AI app</option>
            <option value="marketplace">Marketplace</option>
            <option value="fintech">Fintech</option>
            <option value="e-commerce">E-commerce</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
          {errors.appType && (
            <span id="appType-error" className="errorMessage" role="alert">
              {errors.appType}
            </span>
          )}
        </div>

        {/* Expected Users */}
        <div className="formGroup">
          <label htmlFor="expectedUsers">
            Expected Users <span className="required" aria-label="required">*</span>
          </label>
          <select
            id="expectedUsers"
            name="expectedUsers"
            value={formData.expectedUsers || ''}
            onChange={handleInputChange}
            className={errors.expectedUsers ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.expectedUsers}
            aria-describedby={errors.expectedUsers ? 'expectedUsers-error' : undefined}
          >
            <option value="">Select expected users</option>
            <option value="0-100">0-100</option>
            <option value="100-1000">100-1,000</option>
            <option value="1000-10000">1,000-10,000</option>
            <option value="10000-100000">10,000-100,000</option>
            <option value="100000+">100,000+</option>
          </select>
          {errors.expectedUsers && (
            <span id="expectedUsers-error" className="errorMessage" role="alert">
              {errors.expectedUsers}
            </span>
          )}
        </div>

        {/* Traffic Pattern */}
        <div className="formGroup">
          <label htmlFor="trafficPattern">
            Traffic Pattern <span className="required" aria-label="required">*</span>
          </label>
          <select
            id="trafficPattern"
            name="trafficPattern"
            value={formData.trafficPattern || ''}
            onChange={handleInputChange}
            className={errors.trafficPattern ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.trafficPattern}
            aria-describedby={errors.trafficPattern ? 'trafficPattern-error' : undefined}
          >
            <option value="">Select traffic pattern</option>
            <option value="steady">Steady</option>
            <option value="spiky">Spiky</option>
            <option value="seasonal">Seasonal</option>
            <option value="unpredictable">Unpredictable</option>
          </select>
          {errors.trafficPattern && (
            <span id="trafficPattern-error" className="errorMessage" role="alert">
              {errors.trafficPattern}
            </span>
          )}
        </div>

        {/* Processing Type */}
        <div className="formGroup">
          <fieldset>
            <legend>
              Processing Type <span className="required" aria-label="required">*</span>
            </legend>
            <div className="radioGroup" role="radiogroup" aria-required="true">
              <label className="radioLabel">
                <input
                  type="radio"
                  name="processingType"
                  value="real-time"
                  checked={formData.processingType === 'real-time'}
                  onChange={handleProcessingTypeChange}
                  aria-checked={formData.processingType === 'real-time'}
                />
                <span>Real-time</span>
              </label>
              <label className="radioLabel">
                <input
                  type="radio"
                  name="processingType"
                  value="batch"
                  checked={formData.processingType === 'batch'}
                  onChange={handleProcessingTypeChange}
                  aria-checked={formData.processingType === 'batch'}
                />
                <span>Batch</span>
              </label>
            </div>
          </fieldset>
          {errors.processingType && (
            <span className="errorMessage" role="alert">
              {errors.processingType}
            </span>
          )}
        </div>

        {/* Data Sensitivity */}
        <div className="formGroup">
          <label htmlFor="dataSensitivity">
            Data Sensitivity <span className="required" aria-label="required">*</span>
          </label>
          <select
            id="dataSensitivity"
            name="dataSensitivity"
            value={formData.dataSensitivity || ''}
            onChange={handleInputChange}
            className={errors.dataSensitivity ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.dataSensitivity}
            aria-describedby={errors.dataSensitivity ? 'dataSensitivity-error' : undefined}
          >
            <option value="">Select data sensitivity</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="regulated">Regulated (HIPAA, PCI, etc.)</option>
          </select>
          {errors.dataSensitivity && (
            <span id="dataSensitivity-error" className="errorMessage" role="alert">
              {errors.dataSensitivity}
            </span>
          )}
        </div>

        {/* Regions */}
        <div className="formGroup">
          <label htmlFor="regions">
            Regions <span className="required" aria-label="required">*</span>
          </label>
          <select
            id="regions"
            name="regions"
            multiple
            value={formData.regions || []}
            onChange={handleRegionChange}
            className={errors.regions ? `error multiSelect` : 'multiSelect'}
            aria-required="true"
            aria-invalid={!!errors.regions}
            aria-describedby="regions-help regions-error"
          >
            <option value="us-east-1">US East (N. Virginia)</option>
            <option value="us-west-1">US West (N. California)</option>
            <option value="us-west-2">US West (Oregon)</option>
            <option value="eu-west-1">EU (Ireland)</option>
            <option value="eu-central-1">EU (Frankfurt)</option>
            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            <option value="ap-south-1">Asia Pacific (Mumbai)</option>
          </select>
          <span id="regions-help" className="helpText">Hold Ctrl/Cmd to select multiple regions</span>
          {errors.regions && (
            <span id="regions-error" className="errorMessage" role="alert">
              {errors.regions}
            </span>
          )}
        </div>

        {/* Availability Requirement */}
        <div className="formGroup">
          <label htmlFor="availabilityRequirement">
            Availability Requirement <span className="required" aria-label="required">*</span>
          </label>
          <select
            id="availabilityRequirement"
            name="availabilityRequirement"
            value={formData.availabilityRequirement || ''}
            onChange={handleInputChange}
            className={errors.availabilityRequirement ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.availabilityRequirement}
            aria-describedby={errors.availabilityRequirement ? 'availabilityRequirement-error' : undefined}
          >
            <option value="">Select availability requirement</option>
            <option value="99%">99% (3.65 days downtime/year)</option>
            <option value="99.9%">99.9% (8.76 hours downtime/year)</option>
            <option value="99.99%">99.99% (52.56 minutes downtime/year)</option>
            <option value="99.999%">99.999% (5.26 minutes downtime/year)</option>
          </select>
          {errors.availabilityRequirement && (
            <span id="availabilityRequirement-error" className="errorMessage" role="alert">
              {errors.availabilityRequirement}
            </span>
          )}
        </div>

        {/* Detailed Description */}
        <div className="formGroup">
          <label htmlFor="detailedDescription">
            Detailed Description <span className="required" aria-label="required">*</span>
          </label>
          <textarea
            id="detailedDescription"
            name="detailedDescription"
            value={formData.detailedDescription || ''}
            onChange={handleInputChange}
            rows={6}
            placeholder="Describe your project in detail..."
            className={errors.detailedDescription ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.detailedDescription}
            aria-describedby={errors.detailedDescription ? 'detailedDescription-error' : undefined}
          />
          {errors.detailedDescription && (
            <span id="detailedDescription-error" className="errorMessage" role="alert">
              {errors.detailedDescription}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div className="formActions">
          <button type="submit" className="submitButton" aria-label="Submit form and start chat">
            Start Chat
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserInputForm;
