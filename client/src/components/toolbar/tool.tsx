import React from 'react';
import './styles.css';

interface InputProps {
  children: React.ReactElement;
  id: string;
  ariaLabel: string;
  title: string;
  handleClick: () => void;
  active: boolean;
  disabled?: boolean;
}

export const Tool: React.FC<InputProps> = ({
  children,
  id,
  ariaLabel,
  title,
  handleClick,
  active,
  disabled,
}) => {
  return (
    <button
      id={id}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      onClick={handleClick}
      className={`toolbar-option ${active ? 'active' : ''} ${
        disabled ? 'disabled' : ''
      }`}
    >
      {children}
    </button>
  );
};
