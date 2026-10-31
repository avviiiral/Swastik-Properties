import { HttpContextToken } from '@angular/common/http';

export const SKIP_ADMIN_AUTH = new HttpContextToken<boolean>(() => false);
