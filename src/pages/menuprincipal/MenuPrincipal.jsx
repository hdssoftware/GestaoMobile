import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconBuildingWarehouse,
  IconTrendingUp,
  IconChartBar,
  IconUser,
  IconBox,
  IconScan,
} from "@tabler/icons-react";
import "./MenuPrincipal.css";

// O ID deve bater EXATAMENTE com o que o painel envia
const todosOsMenus = [
  { id: "perm_estoque", label: "Estoque", icon: IconBuildingWarehouse, rota: "/estoque" },
  { id: "perm_vendas_dia", label: "Vendas do Dia", icon: IconTrendingUp, rota: "/vendas-do-dia" },
  { id: "perm_vendas_mes", label: "Vendas do Mês", icon: IconChartBar, rota: "/vendas-mes" },
  { id: "perm_vendedores", label: "Vendas por Vendedor", icon: IconUser, rota: "/vendedores" },
  { id: "perm_produtos", label: "Procura Produtos", icon: IconBox, rota: "/produtos" },
];

const MenuPrincipal = () => {
  const navigate = useNavigate();

  // Detecta automaticamente o IP do servidor
  const host = window.location.hostname;
  const API_BASE_URL = `http://${host}:3000/api`;

  // Estado inicial com tudo bloqueado por padrão
  const [permissoes, setPermissoes] = useState({
    perm_estoque: false,
    perm_vendas_dia: false,
    perm_vendas_mes: false,
    perm_vendedores: false,
    perm_produtos: false,
  });

  useEffect(() => {
    // 1. Carrega as permissões gravadas no dispositivo rapidamente
    const permissoesSalvas = localStorage.getItem("permissoes");
    if (permissoesSalvas) {
      try {
        setPermissoes(JSON.parse(permissoesSalvas));
      } catch (error) {
        console.error("Erro ao ler permissões salvas:", error);
      }
    }

    // 2. Cria um verificador invisível para atualizar as permissões em tempo real
    const token = localStorage.getItem("device_token");
    
    if (token) {
      const verificarPermissoes = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/dispositivo/status`, {
            method: "GET",
            headers: { "x-device-token": token },
          });

          // Se o servidor deletou o aparelho ou recusou o acesso
          if (response.status === 404 || response.status === 403) {
            localStorage.removeItem("device_token");
            navigate("/");
            return;
          }

          const data = await response.json();
          if (data.aprovado && data.permissoes) {
            setPermissoes(data.permissoes);
            localStorage.setItem("permissoes", JSON.stringify(data.permissoes));
          } else if (data.status === "recusado") {
            localStorage.removeItem("device_token");
            navigate("/");
          }
        } catch (error) {
          console.error("Erro ao sincronizar permissões:", error);
        }
      };

      // Executa na hora e depois de 5 em 5 segundos
      verificarPermissoes();
      const interval = setInterval(verificarPermissoes, 5000);
      
      return () => clearInterval(interval);
    }
  }, [navigate, API_BASE_URL]);

  // Filtra e exibe somente o que estiver como 'true' nas permissões
  const menusVisiveis = todosOsMenus.filter((item) => permissoes[item.id] === true);

  return (
    <div className="menu-container-page">
      <header className="cabecalho">
        <h1 className="cabecalho-titulo">Eagle Gestão</h1>
      </header>

      <main className="menu-main">
        <nav className="menu-grid" aria-label="Menu de Navegação Principal">
          {menusVisiveis.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                className="menu-card"
                onClick={() => navigate(item.rota)}
                aria-label={`Navegar para ${item.label}`}
              >
                <div className="menu-icon-box" aria-hidden="true">
                  <IconComponent size={28} />
                </div>
                <span className="menu-label">{item.label}</span>
              </button>
            );
          })}

          {menusVisiveis.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888", marginTop: "20px" }}>
              Nenhum módulo liberado para este dispositivo.
            </p>
          )}
        </nav>
      </main>

      <button
        className="camera-button"
        onClick={() => navigate("/leitor")}
        aria-label="Abrir leitor de código de barras"
      >
        <IconScan size={24} aria-hidden="true" />
      </button>
    </div>
  );
};

export default MenuPrincipal;