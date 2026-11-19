// ==========================================
// CONFIGURAÇÃO DA URL DA API
// ==========================================
const servidorConfigurado = localStorage.getItem("servidor_api");

export const API_BASE_URL = servidorConfigurado
  ? servidorConfigurado
  : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "")
      ? "http://localhost:3000" 
      : `http://${window.location.hostname}:3000`;

// ==========================================
// FUNÇÃO BASE DE REQUISIÇÃO (COM TOKEN E TARGET CNPJ)
// ==========================================
async function fetchComCnpj(url) {
  // Pega as credenciais salvas no LocalStorage
  const deviceToken = localStorage.getItem("device_token");
  
  // Prioriza o cliente selecionado na troca de loja (cnpj_cliente_ativo)
  // Caso não tenha, usa o CNPJ do cadastro principal (cnpj_empregador / cnpj_conectado)
  const cnpjTarget = 
    localStorage.getItem("cnpj_cliente_ativo") || 
    localStorage.getItem("cnpj_empregador") || 
    localStorage.getItem("cnpj_conectado") || 
    "";

  return fetch(url, {
    headers: {
      "x-device-token": deviceToken || "",  // Exigido pelo middleware do backend
      "x-cnpj-target": cnpjTarget,          // Define qual banco de loja consultar no backend
      "Content-Type": "application/json"
    }
  });
}

// Auxiliar para rotas simples de GET (Marcas, Grupos, etc)
async function getJson(url) {
  const response = await fetchComCnpj(url);
  if (!response.ok) return null;
  return response.json();
}

// ==========================================
// MÉTODOS DA API DE ESTOQUE
// ==========================================
export const estoqueApi = {
  buscarMarcas: () => getJson(`${API_BASE_URL}/api/marcas`),
  
  buscarGrupos: () => getJson(`${API_BASE_URL}/api/grupos`),
  
  buscarSubgrupos: (idGrupo) =>
    getJson(`${API_BASE_URL}/api/subgrupos/${idGrupo}`),
    
  buscarFornecedores: () => getJson(`${API_BASE_URL}/api/fornecedores`),

  buscarFiliaisDoProduto: (produtoId) =>
    getJson(`${API_BASE_URL}/api/produtos/${produtoId}/filiais`),

  // Busca simples (nome / barras / interno) e "buscar todos" (q=%25)
  async buscarProdutos({ termoBusca, tipo }) {
    const url = termoBusca
      ? `${API_BASE_URL}/api/produtos?q=${encodeURIComponent(termoBusca)}&tipo=${tipo}`
      : `${API_BASE_URL}/api/produtos`;
      
    const response = await fetchComCnpj(url);
    if (!response.ok) throw new Error("Erro ao buscar produtos.");
    return response.json();
  },

  // Busca avançada por combinação de marca/grupo/subgrupo/fornecedor
  async buscarProdutosAvancado({ marca, grupo, subgrupo, fornecedor }) {
    let url = `${API_BASE_URL}/api/produtos?tipo=avancado`;
    if (marca) url += `&marca=${marca}`;
    if (grupo) url += `&grupo=${grupo}`;
    if (subgrupo) url += `&subgrupo=${subgrupo}`;
    if (fornecedor) url += `&fornecedor=${fornecedor}`;

    const response = await fetchComCnpj(url);
    if (!response.ok) throw new Error("Erro ao buscar produtos filtrados.");
    return response.json();
  },
};

// ==========================================
// FUNÇÕES ÚTEIS
// ==========================================
export const ordenarPorNome = (lista) =>
  [...lista].sort((a, b) => a.nome.localeCompare(b.nome));