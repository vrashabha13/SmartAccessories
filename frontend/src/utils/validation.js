const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

export function validateRegisterForm(form) {
  const errors = {};

  if (!form.username.trim()) {
    errors.username = 'Username is required';
  } else if (form.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (form.username.trim().length > 255) {
    errors.username = 'Username must not exceed 255 characters';
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Email address must be valid';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (!PASSWORD_PATTERN.test(form.password)) {
    errors.password =
      'Password must be at least 8 characters and contain uppercase, lowercase, numeric, and special characters';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Password and confirm password must match';
  }

  return errors;
}

export function validateLoginForm(form) {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Email address must be valid';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  }

  return errors;
}
