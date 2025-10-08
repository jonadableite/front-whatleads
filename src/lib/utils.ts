import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapePromptBraces(text: string): string {
  if (!text) return text;
  return text.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

export function sanitizeAgentName(name: string): string {
  if (!name) return name;
  return name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
}

export function exportAsJson(data: any, filename: string, includeTimestamp: boolean = true, originalData?: any): boolean {
  try {
    const timestamp = includeTimestamp ? new Date().toISOString().replace(/[:.]/g, '-') : '';
    const finalFilename = includeTimestamp ? `${filename}_${timestamp}.json` : `${filename}.json`;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return false;
  }
}

export function getWarmupProgressColor(progress: number): string {
  if (progress >= 80) return 'text-green-500';
  if (progress >= 50) return 'text-yellow-500';
  if (progress >= 20) return 'text-orange-500';
  return 'text-red-500';
}

export function getAccessTokenFromCookie(): string | null {
  // Primeiro tenta obter do localStorage (padrão atual do projeto)
  const storagePrefix = 'whatleads_';
  const tokenKey = `${storagePrefix}tokenInterno`;
  const token = localStorage.getItem(tokenKey);
  
  if (token) {
    return token;
  }
  
  // Fallback: tenta obter de cookies legados se existirem
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}
