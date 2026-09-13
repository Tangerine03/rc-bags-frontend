import React, { useState } from 'react';

function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <span className="password-toggle" onClick={() => setVisible(!visible)}>
        {visible ? '🙈' : '👁️'}
      </span>
    </div>
  );
}

export default PasswordInput;