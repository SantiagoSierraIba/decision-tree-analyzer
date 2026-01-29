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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
          boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.04)',
          width: '500px',
          maxWidth: '90vw',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
            Options
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#94a3b8',
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
              border: '1px solid #e2e8f0',
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
                color: '#475569',
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
              <span style={{ color: '#475569' }}>
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
              <span style={{ color: '#475569' }}>
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
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#475569',
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
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </label>
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#94a3b8',
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
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <legend
              style={{
                padding: '0 8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
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
              <span style={{ color: '#475569' }}>Maximize (profits)</span>
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
              <span style={{ color: '#475569' }}>Minimize (costs)</span>
            </label>
          </fieldset>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#64748b',
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
              backgroundColor: '#64748b',
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
