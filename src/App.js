import React from 'react';
import './App.css';
import MultiStepForm from './components/MultiStepForm';

function App() {
  return (
    <div className="app-wrapper">
      <div className="bg-glow"></div>
      <header className="main-header">
        <h2>CloudSync Horizon</h2>
        <p>Premium Enterprise Portal Verification System</p>
      </header>
      <MultiStepForm />
    </div>
  );
}

export default App;