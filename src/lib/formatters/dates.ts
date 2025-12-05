export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'Sin fecha';
  const formattedDate = formatDate(dateString);
  const formattedTime = formatTime(dateString);
  return `${formattedDate} ${formattedTime}`;
}
