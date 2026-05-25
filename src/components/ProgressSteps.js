import React from 'react';

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, title: "Personal Info", desc: "Contact details" },
    { id: 2, title: "Professional", desc: "Skills & Experience" },
    { id: 3, title: "Security", desc: "Account setup" },
    { id: 4, title: "Review", desc: "Final submission" }
  ];

  return (
    <div className="progress-container">
      {steps.map((step, index) => (
        <div key={step.id} className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
          <div className="step-circle">
            {currentStep > step.id ? "✓" : step.id}
          </div>
          <div className="step-content-text">
            <span className="step-title">{step.title}</span>
            <span className="step-desc">{step.desc}</span>
          </div>
          {index < steps.length - 1 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;