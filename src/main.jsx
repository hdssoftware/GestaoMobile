import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CadastroEmpresa from "./pages/cadastroempresa/CadastroEmpresa";
import VerificacaoAcesso from "./components/VerificacaoAcesso";
import MenuPrincipal from "./pages/menuprincipal/MenuPrincipal";
import LeitorCodigo from "./pages/leitor/LeitorCodigo";
import Estoque from "./pages/estoque/Estoque";
import VendasDoDia from "./pages/vendasdodia/VendasDoDia";
import Login from "./pages/login/Login";

import "./pages/cadastroempresa/cadastro.css";
import "./pages/menuprincipal/MenuPrincipal.css";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Tela 1: Formulário de cadastro da empresa/usuário */}
        <Route path="/" element={<CadastroEmpresa />} />

        {/* Tela 2: Tela de espera / validação do dispositivo */}
        <Route path="/verificacao" element={<VerificacaoAcesso />} />

        {/* Tela 3: Sistema liberado */}
        <Route path="/menu-principal" element={<MenuPrincipal />} />

        {/* Outras Rotas */}
        <Route path="/leitor" element={<LeitorCodigo />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/vendas-do-dia" element={<VendasDoDia />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);