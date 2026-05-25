import React, { useState, useEffect } from 'react';
import ProgressSteps from './ProgressSteps';
import { db } from '../FirebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MultiStepForm = () => {
  // Pehle wale detailed form fields
  const initialFormState = {
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '',
    jobTitle: '', 
    experience: '', 
    skills: '', 
    username: '', 
    password: '', 
    terms: false
  };

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('pro_form_data');
    return saved ? JSON.parse(saved) : initialFormState;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('pro_form_step');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Ultra-Pro Auto-save Indicator state
  const [syncStatus, setSyncStatus] = useState("Saved");

  // Sync with LocalStorage & Show Auto-save indicator
  useEffect(() => {
    setSyncStatus("Saving...");
    localStorage.setItem('pro_form_data', JSON.stringify(formData));
    localStorage.setItem('pro_form_step', currentStep.toString());
    
    const timeout = setTimeout(() => {
      setSyncStatus("Saved locally ☁️");
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [formData, currentStep]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Detailed Form Validation logic
  const validateStep = () => {
    let tempErrors = {};
    
    if (currentStep === 1) {
      if (!formData.firstName.trim()) tempErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) tempErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        tempErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        tempErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) tempErrors.phone = "Phone number is required";
    }

    if (currentStep === 2) {
      if (!formData.jobTitle.trim()) tempErrors.jobTitle = "Target job title is required";
      if (!formData.experience.trim()) tempErrors.experience = "Experience details are required";
      if (!formData.skills.trim()) tempErrors.skills = "Please list at least a few skills";
    }

    if (currentStep === 3) {
      if (!formData.username.trim()) tempErrors.username = "Username is required";
      if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
      if (!formData.terms) tempErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  // Confetti celebration function
  const triggerConfetti = () => {
    var duration = 3 * 1000;
    var end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4f46e5', '#10b981', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4f46e5', '#10b981', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Firebase submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setSyncStatus("Uploading to cloud...");
    try {
      await addDoc(collection(db, "applications"), {
        ...formData,
        submittedAt: new Date().toISOString()
      });

      localStorage.removeItem('pro_form_data');
      localStorage.removeItem('pro_form_step');
      setFormData(initialFormState);
      setSubmitSuccess(true);
      setCurrentStep(1);
      triggerConfetti(); // Celebration!
    } catch (error) {
      console.error("Firebase Error: ", error);
      alert("Submission failed. Please check your Firebase config.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Smooth Spring animations configuration
  const formVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (submitSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="success-card">
        <div className="success-icon">✦</div>
        <h2>Application Submitted!</h2>
        <p>Aapka sara data Firebase Firestore database me successfully store ho chuka hai.</p>
        <button className="btn-primary" onClick={() => setSubmitSuccess(false)}>Fill Another Form</button>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel main-card">
      <div className="card-header-flex">
        <ProgressSteps currentStep={currentStep} />
        <span className="sync-status">{syncStatus}</span>
      </div>

      <div className="form-container-wrapper">
        <AnimatePresence mode="wait">
          <motion.form
            key={currentStep}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmit}
            className="form-body"
          >
            {/* STEP 1: Pehle wale Detailed Personal Fields */}
            {currentStep === 1 && (
              <div>
                <h3>Personal Information</h3>
                <p className="step-subtitle">Please enter your official contact credentials.</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Alex" />
                    {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Mercer" />
                    {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="alex@example.com" />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 1234567" />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>
              </div>
            )}

            {/* STEP 2: Pehle wale Detailed Professional Fields */}
            {currentStep === 2 && (
              <div>
                <h3>Professional Details</h3>
                <p className="step-subtitle">Help us know your core professional strengths.</p>
                <div className="form-group">
                  <label>Target Job Title</label>
                  <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Full Stack Developer" />
                  {errors.jobTitle && <span className="error-msg">{errors.jobTitle}</span>}
                </div>
                <div className="form-group">
                  <label>Experience Summary</label>
                  <textarea name="experience" value={formData.experience} onChange={handleChange} placeholder="Describe your previous roles and experience..." rows="3" />
                  {errors.experience && <span className="error-msg">{errors.experience}</span>}
                </div>
                <div className="form-group">
                  <label>Skills (e.g. React, Firebase, Node)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="JavaScript, Python, UI/UX" />
                  {errors.skills && <span className="error-msg">{errors.skills}</span>}
                </div>
              </div>
            )}

            {/* STEP 3: Pehle wale Detailed Security & Privacy Fields */}
            {currentStep === 3 && (
              <div>
                <h3>Security & Preferences</h3>
                <p className="step-subtitle">Set up your account details securely.</p>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="alex_dev" />
                  {errors.username && <span className="error-msg">{errors.username}</span>}
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-container">
                    <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} />
                    <span className="checkmark"></span>
                    I accept the professional terms and conditions.
                  </label>
                  {errors.terms && <span className="error-msg">{errors.terms}</span>}
                </div>
              </div>
            )}

            {/* STEP 4: Detailed Review Screen */}
            {currentStep === 4 && (
              <div>
                <h3>Review Details</h3>
                <p className="step-subtitle">Verify your parameters before pushing to cloud servers.</p>
                <div className="review-grid">
                  <div className="review-item"><span>Full Name:</span> <strong>{formData.firstName} {formData.lastName}</strong></div>
                  <div className="review-item"><span>Email:</span> <strong>{formData.email}</strong></div>
                  <div className="review-item"><span>Phone:</span> <strong>{formData.phone}</strong></div>
                  <div className="review-item"><span>Target Role:</span> <strong>{formData.jobTitle}</strong></div>
                  <div className="review-item"><span>Skills Matrix:</span> <strong>{formData.skills}</strong></div>
                  <div className="review-item"><span>Username:</span> <strong>{formData.username}</strong></div>
                </div>
              </div>
            )}

            {/* Navigation controls */}
            <div className="form-controls">
              {currentStep > 1 && (
                <button type="button" className="btn-secondary" onClick={handleBack} disabled={isSubmitting}>
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button type="button" className="btn-primary" onClick={handleNext}>
                  Continue
                </button>
              ) : (
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading to Cloud..." : "Final Submit"}
                </button>
              )}
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiStepForm;