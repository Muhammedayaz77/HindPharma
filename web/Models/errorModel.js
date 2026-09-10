export class ErrorModel extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ErrorModel';
    this.code = code;
  }

  static usernameRequired() {
    return new ErrorModel('AUTH_USERNAME_REQUIRED', 'Please enter your username.');
  }

  static passwordRequired() {
    return new ErrorModel('AUTH_PASSWORD_REQUIRED', 'Please enter your password.');
  }

  static usernameWrong() {
    return new ErrorModel('AUTH_USERNAME_WRONG', 'Username is wrong. Please check your username.');
  }

  static passwordWrong() {
    return new ErrorModel('AUTH_PASSWORD_WRONG', 'Password is wrong. Please check your password.');
  }

  static invalidCredentials() {
    return new ErrorModel('AUTH_INVALID_CREDENTIALS', 'The username or password is incorrect.');
  }

  static accountInactive() {
    return new ErrorModel('AUTH_ACCOUNT_INACTIVE', 'This account is inactive. Please contact the administrator.');
  }

  static subscriptionExpired() {
    return new ErrorModel('SUBSCRIPTION_EXPIRED', 'This subscription has expired. Please contact the administrator for renewal.');
  }

  static required(field) {
    return new ErrorModel('VALIDATION_REQUIRED', `${field} is required.`);
  }

  static duplicate(field) {
    return new ErrorModel('VALIDATION_DUPLICATE', `${field} already exists.`);
  }

  static permission(message = 'You do not have permission to perform this action.') {
    return new ErrorModel('PERMISSION_DENIED', message);
  }
}
