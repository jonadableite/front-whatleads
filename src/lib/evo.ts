// lib/evo.ts
import axios from 'axios';

// Acessa as variáveis de ambiente definidas no seu arquivo .env
// Certifique-se de que VITE_EVOLUTION_API_URL e VITE_EVOLUTION_API_KEY estão no seu .env
const API_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

// Opcional: Adicionar uma verificação para alertar se as variáveis não estiverem definidas
if (!API_URL) {
  console.warn(
    'VITE_EVOLUTION_API_URL não está definida. As requisições à API podem falhar.',
  );
}
if (!API_KEY) {
  console.warn(
    'VITE_EVOLUTION_API_KEY não está definida. As requisições à API podem falhar.',
  );
}

// Configura a instância do Axios com a baseURL e o header de autorização
export const evo = axios.create({
  baseURL: API_URL,
  headers: {
    apikey: API_KEY,
    'Content-Type': 'application/json',
  },
});
