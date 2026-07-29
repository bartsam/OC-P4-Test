import { FormControl } from '@angular/forms';

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export type RegisterForm = {
  [K in keyof RegisterRequest]: FormControl<RegisterRequest[K]>;
};
