import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation criteria
  const validatePassword = (pwd: string): PasswordValidation => {
    const errors: string[] = [];
    
    if (pwd.length < 10) {
      errors.push('Password must be at least 10 characters long');
    }
    if (pwd.length > 24) {
      errors.push('Password must be at most 24 characters long');
    }
    if (pwd.includes(' ')) {
      errors.push('Password cannot contain spaces');
    }
    if (!/\d/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Get auth token from URL (assuming it's in the path parameter)
  const getAuthToken = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setApiError('');
    
    // Validate form
    if (!username.trim()) {
      setApiError('Username is required');
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setValidationErrors(passwordValidation.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserWasCreated(true);
        }
      } else if (response.status === 500) {
        setApiError('Something went wrong, please try again.');
      } else if (response.status === 401 || response.status === 403) {
        setApiError('Not authenticated to access this resource.');
      } else if (response.status === 422) {
        const result = await response.json();
        if (result.errors && result.errors.includes('not_allowed')) {
          setApiError('Sorry, the entered password is not allowed, please try a different one.');
        } else {
          setApiError('Something went wrong, please try again.');
        }
      } else {
        setApiError('Something went wrong, please try again.');
      }
    } catch (error) {
      setApiError('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update validation errors as user types
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [password]);

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label style={formLabel} htmlFor="username">Username</label>
        <input 
          style={formInput} 
          id="username"
          name="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="Username"
          aria-invalid={apiError && !username.trim() ? 'true' : 'false'}
        />

        <label style={formLabel} htmlFor="password">Password</label>
        <input 
          style={formInput} 
          id="password"
          name="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
          aria-invalid={validationErrors.length > 0 ? 'true' : 'false'}
        />

        {/* Password validation criteria */}
        {password && (
          <div style={validationContainer}>
            {[
              'Password must be at least 10 characters long',
              'Password must be at most 24 characters long',
              'Password cannot contain spaces',
              'Password must contain at least one number',
              'Password must contain at least one uppercase letter',
              'Password must contain at least one lowercase letter'
            ].map((criterion) => {
              const isError = validationErrors.includes(criterion);
              return (
                <div 
                  key={criterion} 
                  style={{
                    ...validationItem,
                    color: isError ? '#d32f2f' : '#4caf50',
                    display: isError ? 'block' : 'none'
                  }}
                >
                  • {criterion}
                </div>
              );
            })}
          </div>
        )}

        {/* API Error Messages */}
        {apiError && (
          <div style={errorMessage}>
            {apiError}
          </div>
        )}

        <button 
          style={formButton} 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const validationContainer: CSSProperties = {
  marginTop: '8px',
  padding: '8px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  fontSize: '12px',
};

const validationItem: CSSProperties = {
  margin: '2px 0',
  fontSize: '12px',
  lineHeight: '1.4',
};

const errorMessage: CSSProperties = {
  marginTop: '8px',
  padding: '8px',
  backgroundColor: '#ffebee',
  color: '#d32f2f',
  borderRadius: '4px',
  fontSize: '14px',
  border: '1px solid #ffcdd2',
};
