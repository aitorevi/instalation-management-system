# Fase 08: UI Components

## Objetivo

Crear componentes UI reutilizables: Button, Input, Select, Badge, Modal, StatusBadge.

## Pre-requisitos

- Fases 01-07 completadas

---

## Paso 1: Crear componente Button

**Archivo:** `src/components/ui/Button.astro`

```astro
---
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  disabled?: boolean;
  class?: string;
  [key: string]: any;
}

const {
  variant = 'primary',
  size = 'md',
  type = 'button',
  href,
  disabled = false,
  class: className = '',
  ...rest
} = Astro.props;

const baseClasses =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2'
};

const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

const Tag = href ? 'a' : 'button';
---

{
  href ? (
    <a href={href} class={classes} {...rest}>
      <slot />
    </a>
  ) : (
    <button type={type} class={classes} disabled={disabled} {...rest}>
      <slot />
    </button>
  )
}
```

**Verificación:** Archivo existe

---

## Paso 2: Crear componente Input

**Archivo:** `src/components/ui/Input.astro`

```astro
---
interface Props {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'datetime-local' | 'search';
  name: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  class?: string;
  [key: string]: any;
}

const {
  type = 'text',
  name,
  label,
  placeholder,
  value,
  required = false,
  disabled = false,
  error,
  hint,
  class: className = '',
  ...rest
} = Astro.props;

const inputId = `input-${name}`;
const hasError = !!error;
---

<div class={`space-y-1 ${className}`}>
  {
    label && (
      <label for={inputId} class="label">
        {label}
        {required && <span class="text-red-500 ml-1">*</span>}
      </label>
    )
  }

  <input
    type={type}
    id={inputId}
    name={name}
    value={value}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    class:list={[
      'input',
      hasError && 'border-red-500 focus:ring-red-500 focus:border-red-500',
      disabled && 'bg-gray-100 cursor-not-allowed'
    ]}
    {...rest}
  />

  {error && <p class="text-sm text-red-600">{error}</p>}

  {hint && !error && <p class="text-sm text-gray-500">{hint}</p>}
</div>
```

**Verificación:** Archivo existe

---

## Paso 3: Crear componente Textarea

**Archivo:** `src/components/ui/Textarea.astro`

```astro
---
interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  class?: string;
  [key: string]: any;
}

const {
  name,
  label,
  placeholder,
  value,
  rows = 4,
  required = false,
  disabled = false,
  error,
  class: className = '',
  ...rest
} = Astro.props;

const inputId = `textarea-${name}`;
const hasError = !!error;
---

<div class={`space-y-1 ${className}`}>
  {
    label && (
      <label for={inputId} class="label">
        {label}
        {required && <span class="text-red-500 ml-1">*</span>}
      </label>
    )
  }

  <textarea
    id={inputId}
    name={name}
    rows={rows}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    class:list={[
      'input resize-none',
      hasError && 'border-red-500 focus:ring-red-500 focus:border-red-500',
      disabled && 'bg-gray-100 cursor-not-allowed'
    ]}
    {...rest}>{value}</textarea
  >

  {error && <p class="text-sm text-red-600">{error}</p>}
</div>
```

**Verificación:** Archivo existe

---

## Paso 4: Crear componente Select

**Archivo:** `src/components/ui/Select.astro`

```astro
---
interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  name: string;
  label?: string;
  options: Option[];
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  class?: string;
  [key: string]: any;
}

const {
  name,
  label,
  options,
  value,
  placeholder = 'Seleccionar...',
  required = false,
  disabled = false,
  error,
  class: className = '',
  ...rest
} = Astro.props;

const inputId = `select-${name}`;
const hasError = !!error;
---

<div class={`space-y-1 ${className}`}>
  {
    label && (
      <label for={inputId} class="label">
        {label}
        {required && <span class="text-red-500 ml-1">*</span>}
      </label>
    )
  }

  <select
    id={inputId}
    name={name}
    required={required}
    disabled={disabled}
    class:list={[
      'input appearance-none bg-no-repeat bg-right pr-10',
      hasError && 'border-red-500 focus:ring-red-500 focus:border-red-500',
      disabled && 'bg-gray-100 cursor-not-allowed'
    ]}
    style="background-image: url(\"
    data:image
    svg+xml,%3Csvg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="%236B7280"
    %3E%3Cpath
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M19 9l-7 7-7-7"
    %3E%3C
    path%3E%3C
    svg%3E\");
    background-size:
    1.5rem;"
    {...rest}
  >
    <option value="" disabled selected={!value}>{placeholder}</option>
    {
      options.map((opt) => (
        <option value={opt.value} selected={value === opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))
    }
  </select>

  {error && <p class="text-sm text-red-600">{error}</p>}
</div>
```

**Verificación:** Archivo existe

---

## Paso 5: Crear componente Checkbox

**Archivo:** `src/components/ui/Checkbox.astro`

```astro
---
interface Props {
  name: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  class?: string;
  [key: string]: any;
}

const {
  name,
  label,
  checked = false,
  disabled = false,
  class: className = '',
  ...rest
} = Astro.props;

const inputId = `checkbox-${name}`;
---

<div class={`flex items-center gap-2 ${className}`}>
  <input
    type="checkbox"
    id={inputId}
    name={name}
    checked={checked}
    disabled={disabled}
    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
    {...rest}
  />
  <label
    for={inputId}
    class:list={['text-sm text-gray-700', disabled && 'opacity-50 cursor-not-allowed']}
  >
    {label}
  </label>
</div>
```

**Verificación:** Archivo existe

---

## Paso 6: Crear componente Badge

**Archivo:** `src/components/ui/Badge.astro`

```astro
---
interface Props {
  variant?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md';
  class?: string;
}

const { variant = 'gray', size = 'md', class: className = '' } = Astro.props;

const variantClasses = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700'
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm'
};
---

<span
  class={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
>
  <slot />
</span>
```

**Verificación:** Archivo existe

---

## Paso 7: Crear componente StatusBadge

**Archivo:** `src/components/installations/StatusBadge.astro`

```astro
---
import Badge from '../ui/Badge.astro';
import type { InstallationStatus } from '../../lib/supabase';

interface Props {
  status: InstallationStatus;
  size?: 'sm' | 'md';
}

const { status, size = 'md' } = Astro.props;

const statusConfig: Record<
  InstallationStatus,
  { label: string; variant: 'gray' | 'blue' | 'green' | 'yellow' | 'red' }
> = {
  pending: { label: 'Pendiente', variant: 'yellow' },
  in_progress: { label: 'En Progreso', variant: 'blue' },
  completed: { label: 'Completada', variant: 'green' },
  cancelled: { label: 'Cancelada', variant: 'red' }
};

const config = statusConfig[status];
---

<Badge variant={config.variant} size={size}>
  {config.label}
</Badge>
```

**Verificación:** Archivo existe

---

## Paso 8: Crear componente Modal

**Archivo:** `src/components/ui/Modal.astro`

```astro
---
interface Props {
  id: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

const { id, title, size = 'md' } = Astro.props;

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
};
---

<!-- Modal Backdrop -->
<div
  id={`${id}-backdrop`}
  class="fixed inset-0 z-50 bg-black/50 hidden items-center justify-center p-4"
  data-modal-backdrop={id}
>
  <!-- Modal Content -->
  <div
    class={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} transform transition-all`}
    role="dialog"
    aria-modal="true"
    aria-labelledby={`${id}-title`}
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 id={`${id}-title`} class="text-lg font-semibold text-gray-900">
        {title}
      </h2>
      <button
        type="button"
        class="p-2 -mr-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
        data-modal-close={id}
        aria-label="Cerrar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="px-6 py-4">
      <slot />
    </div>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
      <slot name="footer" />
    </div>
  </div>
</div>

<script define:vars={{ id }}>
  // Modal functions
  const backdrop = document.getElementById(`${id}-backdrop`);

  // Open modal function (global)
  window[`open${id.charAt(0).toUpperCase() + id.slice(1)}Modal`] = function () {
    backdrop?.classList.remove('hidden');
    backdrop?.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  // Close modal function (global)
  window[`close${id.charAt(0).toUpperCase() + id.slice(1)}Modal`] = function () {
    backdrop?.classList.add('hidden');
    backdrop?.classList.remove('flex');
    document.body.style.overflow = '';
  };

  // Close on backdrop click
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      window[`close${id.charAt(0).toUpperCase() + id.slice(1)}Modal`]();
    }
  });

  // Close button
  document.querySelectorAll(`[data-modal-close="${id}"]`).forEach((btn) => {
    btn.addEventListener('click', () => {
      window[`close${id.charAt(0).toUpperCase() + id.slice(1)}Modal`]();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop?.classList.contains('hidden')) {
      window[`close${id.charAt(0).toUpperCase() + id.slice(1)}Modal`]();
    }
  });
</script>
```

**Verificación:** Archivo existe

---

## Paso 9: Crear componente Alert

**Archivo:** `src/components/ui/Alert.astro`

```astro
---
interface Props {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  class?: string;
}

const { variant = 'info', title, dismissible = false, class: className = '' } = Astro.props;

const variantConfig = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
  }
};

const config = variantConfig[variant];
---

<div
  class={`flex gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${className}`}
  role="alert"
>
  <svg
    class={`w-5 h-5 flex-shrink-0 ${config.text}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    set:html={config.icon}
  />

  <div class="flex-1 min-w-0">
    {title && <h3 class={`font-medium ${config.text}`}>{title}</h3>}
    <div class={`text-sm ${config.text} ${title ? 'mt-1' : ''}`}>
      <slot />
    </div>
  </div>

  {
    dismissible && (
      <button
        type="button"
        class={`flex-shrink-0 p-1 -mr-1 rounded hover:bg-black/5 ${config.text}`}
        onclick="this.closest('[role=alert]').remove()"
        aria-label="Cerrar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    )
  }
</div>
```

**Verificación:** Archivo existe

---

## Paso 10: Crear componente EmptyState

**Archivo:** `src/components/ui/EmptyState.astro`

```astro
---
interface Props {
  icon?: string;
  title: string;
  description?: string;
}

const { icon, title, description } = Astro.props;

// Default icon (clipboard)
const defaultIcon =
  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>';
---

<div class="flex flex-col items-center justify-center py-12 text-center">
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <svg
      class="w-8 h-8 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      set:html={icon || defaultIcon}
    />
  </div>

  <h3 class="text-lg font-medium text-gray-900 mb-1">{title}</h3>

  {description && <p class="text-gray-500 max-w-sm">{description}</p>}

  <div class="mt-6">
    <slot />
  </div>
</div>
```

**Verificación:** Archivo existe

---

## Paso 11: Crear página de demo de componentes (Opcional)

**Archivo:** `src/pages/admin/components-demo.astro`

```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';
import Button from '../../components/ui/Button.astro';
import Input from '../../components/ui/Input.astro';
import Textarea from '../../components/ui/Textarea.astro';
import Select from '../../components/ui/Select.astro';
import Checkbox from '../../components/ui/Checkbox.astro';
import Badge from '../../components/ui/Badge.astro';
import Alert from '../../components/ui/Alert.astro';
import Modal from '../../components/ui/Modal.astro';
import StatusBadge from '../../components/installations/StatusBadge.astro';
import EmptyState from '../../components/ui/EmptyState.astro';

const user = Astro.locals.user;

const selectOptions = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
  { value: '3', label: 'Opción 3' }
];
---

<DashboardLayout title="Demo Componentes" user={user}>
  <h1 class="text-2xl font-bold mb-8">Demo de Componentes</h1>

  <!-- Buttons -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Buttons</h2>
    <div class="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
    <div class="flex flex-wrap gap-4 mt-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  </section>

  <!-- Inputs -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Inputs</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input name="demo1" label="Normal" placeholder="Escribe algo..." />
      <Input name="demo2" label="Con error" error="Este campo es requerido" />
      <Input name="demo3" label="Deshabilitado" disabled value="No editable" />
      <Input name="demo4" label="Con hint" hint="Este es un texto de ayuda" />
    </div>
  </section>

  <!-- Textarea & Select -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Textarea & Select</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Textarea name="notes" label="Notas" placeholder="Escribe tus notas..." />
      <Select name="option" label="Selecciona" options={selectOptions} />
    </div>
  </section>

  <!-- Checkbox -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Checkbox</h2>
    <div class="space-y-2">
      <Checkbox name="check1" label="Opción normal" />
      <Checkbox name="check2" label="Opción marcada" checked />
      <Checkbox name="check3" label="Opción deshabilitada" disabled />
    </div>
  </section>

  <!-- Badges -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Badges</h2>
    <div class="flex flex-wrap gap-2 mb-4">
      <Badge variant="gray">Gray</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="red">Red</Badge>
      <Badge variant="purple">Purple</Badge>
    </div>
    <h3 class="font-medium mb-2">Status Badges</h3>
    <div class="flex flex-wrap gap-2">
      <StatusBadge status="pending" />
      <StatusBadge status="in_progress" />
      <StatusBadge status="completed" />
      <StatusBadge status="cancelled" />
    </div>
  </section>

  <!-- Alerts -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Alerts</h2>
    <div class="space-y-4">
      <Alert variant="info" title="Información">Este es un mensaje informativo.</Alert>
      <Alert variant="success" title="Éxito">Operación completada correctamente.</Alert>
      <Alert variant="warning" title="Advertencia">Ten cuidado con esta acción.</Alert>
      <Alert variant="error" title="Error" dismissible>Algo salió mal. Este se puede cerrar.</Alert>
    </div>
  </section>

  <!-- Empty State -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Empty State</h2>
    <EmptyState
      title="No hay instalaciones"
      description="Crea tu primera instalación para empezar."
    >
      <Button variant="primary">Nueva Instalación</Button>
    </EmptyState>
  </section>

  <!-- Modal -->
  <section class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Modal</h2>
    <Button onclick="openDemoModal()">Abrir Modal</Button>
  </section>

  <Modal id="demo" title="Modal de Ejemplo">
    <p class="text-gray-600">Este es el contenido del modal. Puedes poner cualquier cosa aquí.</p>

    <Fragment slot="footer">
      <Button variant="secondary" onclick="closeDemoModal()">Cancelar</Button>
      <Button variant="primary" onclick="closeDemoModal()">Aceptar</Button>
    </Fragment>
  </Modal>
</DashboardLayout>
```

**Verificación:** Página visible en `/admin/components-demo`

---

## Checklist Final Fase 08

- [ ] `src/components/ui/Button.astro` creado
- [ ] `src/components/ui/Input.astro` creado
- [ ] `src/components/ui/Textarea.astro` creado
- [ ] `src/components/ui/Select.astro` creado
- [ ] `src/components/ui/Checkbox.astro` creado
- [ ] `src/components/ui/Badge.astro` creado
- [ ] `src/components/ui/Modal.astro` creado
- [ ] `src/components/ui/Alert.astro` creado
- [ ] `src/components/ui/EmptyState.astro` creado
- [ ] `src/components/installations/StatusBadge.astro` creado
- [ ] (Opcional) Demo page funciona correctamente

---

## Siguiente Fase

→ `09-ADMIN-DASHBOARD.md` - Dashboard admin con datos reales
