import React, { useState } from 'react';
import { CalculationSettings, UtilityFunction, OptimizationDirection } from '../types';

interface OptionsDialogProps {
  settings: CalculationSettings;
  onSave: (settings: CalculationSettings) => void;
  onClose: () => void;
}

const OptionsDialog: React.FC<OptionsDialogProps> = ({ settings, onSave, onClose }) => {
  const [utilityFunction, setUtilityFunction] = useState<UtilityFunction>(settings.utilityFunction);
  const [optimizationDirection, setOptimizationDirection] = useState<OptimizationDirection>(settings.optimizationDirection);
  const [riskTolerance, setRiskTolerance] = useState<number>(settings.riskTolerance);

  const handleSave = () => {
    onSave({
      utilityFunction,
      optimizationDirection,
      riskTolerance,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '500px',
          maxWidth: '90vw',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
            Options
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Certain Equivalents Section */}
          <fieldset
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <legend
              style={{
                padding: '0 8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              Certain Equivalents
            </legend>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              <input
                type="radio"
                name="utilityFunction"
                checked={utilityFunction === 'expected-value'}
                onChange={() => setUtilityFunction('expected-value')}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ color: '#374151' }}>
                Probability-weighted average (Expected Value)
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              <input
                type="radio"
                name="utilityFunction"
                checked={utilityFunction === 'exponential'}
                onChange={() => setUtilityFunction('exponential')}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ color: '#374151' }}>
                Exponential risk utility function
              </span>
            </label>

            {/* Risk Tolerance Input - shown when exponential is selected */}
            {utilityFunction === 'exponential' && (
              <div
                style={{
                  marginTop: '12px',
                  marginLeft: '26px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#374151',
                    fontSize: '14px',
                  }}
                >
                  <span>Risk Tolerance (R):</span>
                  <input
                    type="number"
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '120px',
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </label>
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '8px 0 0 0',
                  }}
                >
                  Higher R = more risk tolerant, Lower R = more risk averse
                </p>
              </div>
            )}
          </fieldset>

          {/* Decision Node Choices Section */}
          <fieldset
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <legend
              style={{
                padding: '0 8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              Decision Node Choices
            </legend>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              <input
                type="radio"
                name="optimizationDirection"
                checked={optimizationDirection === 'maximize'}
                onChange={() => setOptimizationDirection('maximize')}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ color: '#374151' }}>Maximize (profits)</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              <input
                type="radio"
                name="optimizationDirection"
                checked={optimizationDirection === 'minimize'}
                onChange={() => setOptimizationDirection('minimize')}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ color: '#374151' }}>Minimize (costs)</span>
            </label>
          </fieldset>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsDialog;
