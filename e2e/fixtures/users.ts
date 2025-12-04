export interface TestUser {
  email: string;
  fullName: string;
  role: 'admin' | 'installer';
}

export const ADMIN_USER: TestUser = {
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'admin'
};

export const INSTALLER_USER: TestUser = {
  email: 'installer@example.com',
  fullName: 'Installer User',
  role: 'installer'
};
