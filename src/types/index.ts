export * from './database';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface FormError {
  field: string;
  message: string;
}

export interface FormResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormError[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InstallationFilters {
  status?: string;
  installerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const INSTALLATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'yellow' },
  in_progress: { label: 'En Progreso', color: 'blue' },
  completed: { label: 'Completada', color: 'green' },
  cancelled: { label: 'Cancelada', color: 'red' }
};
