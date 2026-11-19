import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconX,
  IconSearch,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import { estoqueApi, ordenarPorNome } from "../../api/estoqueApi";
import ProdutoCard from "../../components/ProdutoCard";
import ChipFiltro from "../../components/ChipFiltro";
import ModalFiltros from "../../components/ModalFiltros";
import ModalFiliais from "../../components/ModalFiliais";
import "./estoque.css";

const Estoque = () => {
  const navigate = useNavigate();

  // Estados principais de dados
  const [produtosOriginais, setProdutosOriginais] = useState([]);
  const [produtosExibidos, setProdutosExibidos] = useState([]);

  // Estados dos filtros (IDs para a API)
  const [termoBusca, setTermoBusca] = useState("");
  const [marcaSelecionada, setMarcaSelecionada] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [subgrupoSelecionado, setSubgrupoSelecionado] = useState("");
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensagemLoading, setMensagemLoading] = useState(
    "A atualizar listagem...",
  );

  // Estados de Modal e Filiais
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [filiaisEstoque, setFiliaisEstoque] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("nome");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de Dados auxiliares para combos
  const [marcas, setMarcas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Texto digitado nos combos (mobile fix)
  const [marcaInput, setMarcaInput] = useState("");
  const [grupoInput, setGrupoInput] = useState("");
  const [subgrupoInput, setSubgrupoInput] = useState("");
  const [fornecedorInput, setFornecedorInput] = useState("");

  // Referências para controle de foco automático sequencial
  const grupoSelectRef = useRef(null);
  const subgrupoSelectRef = useRef(null);
  const fornecedorSelectRef = useRef(null);

  const temFiltroCategoriaAtivo = useMemo(
    () =>
      !!(
        marcaSelecionada ||
        grupoSelecionado ||
        subgrupoSelecionado ||
        fornecedorSelecionado
      ),
    [
      marcaSelecionada,
      grupoSelecionado,
      subgrupoSelecionado,
      fornecedorSelecionado,
    ],
  );

  const placeholderDinamico = useMemo(() => {
    if (abaAtiva === "nome") return "Digite o nome do produto...";
    if (abaAtiva === "barras") return "Bipe ou digite o cód. de barras...";
    return "Digite o código interno...";
  }, [abaAtiva]);

  const totalItensEncontrados = produtosExibidos.length;
  const itensComEstoqueBaixo = useMemo(
    () => produtosExibidos.filter((p) => p.estoque <= 0).length,
    [produtosExibidos],
  );

  // Controle do botão "voltar" do navegador para fechar modais
  useEffect(() => {
    if (produtoSelecionado || mostrarFiltros) {
      window.history.pushState({ modalAberto: true }, "");
    }

    const handlePopState = () => {
      if (produtoSelecionado) setProdutoSelecionado(null);
      else if (mostrarFiltros) setMostrarFiltros(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [produtoSelecionado, mostrarFiltros]);

  // Carrega dados iniciais dos combos
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [dadosMarcas, dadosGrupos, dadosFornecedores] = await Promise.all(
          [
            estoqueApi.buscarMarcas(),
            estoqueApi.buscarGrupos(),
            estoqueApi.buscarFornecedores(),
          ],
        );
        if (dadosMarcas) setMarcas(dadosMarcas);
        if (dadosGrupos) setGrupos(dadosGrupos);
        if (dadosFornecedores) setFornecedores(dadosFornecedores);
      } catch (err) {
        console.error("Erro ao carregar dados de filtros iniciais:", err);
      }
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    setTermoBusca("");
    setError(null);
  }, [abaAtiva]);

  // Auto-foca o subgrupo assim que o grupo for definido
  useEffect(() => {
    if (grupoSelecionado && subgrupoSelectRef.current) {
      setTimeout(() => subgrupoSelectRef.current.focus(), 150);
    }
  }, [grupoSelecionado]);

  // Filtro local (client-side) sobre os produtos já carregados
  useEffect(() => {
    if (!termoBusca || termoBusca.trim() === "") {
      setProdutosExibidos(produtosOriginais);
      return;
    }

    const termoNorm = termoBusca.trim().toLowerCase();

    if (
      abaAtiva === "nome" &&
      termoNorm.length < 3 &&
      !temFiltroCategoriaAtivo
    ) {
      setProdutosExibidos([]);
      return;
    }

    const resultadoFiltradoLocal = produtosOriginais.filter((produto) => {
      if (abaAtiva === "barras")
        return produto.cod_barra?.toLowerCase().includes(termoNorm);
      if (abaAtiva === "interno")
        return produto.produto_id?.toString().includes(termoNorm);

      const termos = termoNorm.split(/\s+/);
      const nomeProd = produto.nome ? produto.nome.toLowerCase() : "";
      return termos.every((termo) => nomeProd.includes(termo));
    });

    setProdutosExibidos(resultadoFiltradoLocal);
  }, [termoBusca, produtosOriginais, abaAtiva, temFiltroCategoriaAtivo]);

  const limparBusca = () => {
    setTermoBusca("");
    setMarcaSelecionada("");
    setGrupoSelecionado("");
    setSubgrupoSelecionado("");
    setFornecedorSelecionado("");

    setMarcaInput("");
    setGrupoInput("");
    setSubgrupoInput("");
    setFornecedorInput("");

    setSubgrupos([]);
    setProdutosOriginais([]);
    setProdutosExibidos([]);
    setError(null);
  };

  const voltarParaMenu = () => {
    if (produtoSelecionado) {
      setProdutoSelecionado(null);
      if (window.history.state?.modalAberto) window.history.back();
      return;
    }
    if (mostrarFiltros) {
      setMostrarFiltros(false);
      if (window.history.state?.modalAberto) window.history.back();
      return;
    }
    navigate("/menu-principal");
  };

  const buscarProdutosDaAPI = async () => {
    if (
      abaAtiva === "nome" &&
      termoBusca.trim().length < 3 &&
      !temFiltroCategoriaAtivo
    ) {
      setError("Digite ao menos 3 letras para realizar a busca.");
      setProdutosOriginais([]);
      return;
    }

    setLoading(true);
    setError(null);
    setMensagemLoading("A buscar itens no servidor...");

    try {
      const dados = await estoqueApi.buscarProdutos({
        termoBusca,
        tipo: abaAtiva,
      });
      setProdutosOriginais(ordenarPorNome(dados));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const buscarProdutosManual = (event) => {
    setError(null);
    buscarProdutosDaAPI();
    if (event?.target?.blur) event.target.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") buscarProdutosManual(e);
  };

  const carregarSubgrupos = async (idGrupo) => {
    setGrupoSelecionado(idGrupo);
    setSubgrupoSelecionado("");

    if (!idGrupo) {
      setSubgrupos([]);
      return;
    }
    try {
      const dados = await estoqueApi.buscarSubgrupos(idGrupo);
      if (dados) setSubgrupos(dados);
    } catch (err) {
      console.error(err);
    }
  };

  const executarBuscaAvancada = async (marca, grupo, subgrupo, fornecedor) => {
    if (!marca && !grupo && !subgrupo && !fornecedor) {
      limparBusca();
      return;
    }

    setLoading(true);
    setError(null);
    setTermoBusca("");
    setMensagemLoading("A buscar itens com os filtros selecionados...");

    try {
      const dados = await estoqueApi.buscarProdutosAvancado({
        marca,
        grupo,
        subgrupo,
        fornecedor,
      });
      setProdutosOriginais(ordenarPorNome(dados));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setMostrarFiltros(false);
    if (window.history.state?.modalAberto) window.history.back();
    executarBuscaAvancada(
      marcaSelecionada,
      grupoSelecionado,
      subgrupoSelecionado,
      fornecedorSelecionado,
    );
  };

  const removerFiltroAtivo = (tipo) => {
    let novaMarca = marcaSelecionada;
    let novoGrupo = grupoSelecionado;
    let novoSub = subgrupoSelecionado;
    let novoForn = fornecedorSelecionado;

    if (tipo === "marca") {
      setMarcaSelecionada("");
      novaMarca = "";
    }
    if (tipo === "grupo") {
      setGrupoSelecionado("");
      setSubgrupoSelecionado("");
      novoGrupo = "";
      novoSub = "";
    }
    if (tipo === "subgrupo") {
      setSubgrupoSelecionado("");
      novoSub = "";
    }
    if (tipo === "fornecedor") {
      setFornecedorSelecionado("");
      novoForn = "";
    }

    executarBuscaAvancada(novaMarca, novoGrupo, novoSub, novoForn);
  };

  const buscarTodosViaModal = async () => {
    setMostrarFiltros(false);
    if (window.history.state?.modalAberto) window.history.back();

    setLoading(true);
    setError(null);
    limparBusca();
    setMensagemLoading("Carregando todos os produtos...");

    try {
      const dados = await estoqueApi.buscarProdutos({
        termoBusca: "%",
        tipo: "nome",
      });
      setProdutosOriginais(ordenarPorNome(dados));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalhesFiliais = async (produto) => {
    setProdutoSelecionado(produto);
    setLoadingFiliais(true);
    try {
      const dados = await estoqueApi.buscarFiliaisDoProduto(produto.produto_id);
      setFiliaisEstoque(dados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const fecharModal = () => {
    setProdutoSelecionado(null);
    setMostrarFiltros(false);
    if (window.history.state?.modalAberto) window.history.back();
  };

  const nomeMarcaAtiva = marcas.find(
    (m) => m.marca_id.toString() === marcaSelecionada.toString(),
  )?.nome;
  const nomeGrupoAtivo = grupos.find(
    (g) => g.grupo_id.toString() === grupoSelecionado.toString(),
  )?.nome;
  const nomeSubgrupoAtivo = subgrupos.find(
    (s) => s.subgrupo_id.toString() === subgrupoSelecionado.toString(),
  )?.nome;
  const nomeFornAtivo = fornecedores.find(
    (f) => f.fornecedor_id.toString() === fornecedorSelecionado.toString(),
  )?.nome;

  return (
    <div className="estoque-container">
      <div className="estoque-topo-fixo">
        <div className="estoque-header">
          <button
            className="btn-voltar"
            onClick={voltarParaMenu}
            aria-label="Voltar"
          >
            <IconArrowLeft size="24" />
          </button>
          <div>
            <h2>Consulta Estoque</h2>
          </div>
        </div>

        <div className="abas-container">
          {[
            { id: "nome", label: "Nome do Produto" },
            { id: "barras", label: "Codigo de Barras" },
            { id: "interno", label: "Codigo do Produto" },
          ].map((aba) => (
            <button
              key={aba.id}
              className={`aba-btn ${abaAtiva === aba.id ? "ativa" : ""}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </button>
          ))}
        </div>

        <div className="input-busca-container">
          <input
            type={abaAtiva === "nome" ? "text" : "number"}
            className="estoque-input"
            placeholder={placeholderDinamico}
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="acoes-input">
            {termoBusca && (
              <button
                className="btn-limpar"
                onClick={() => {
                  setTermoBusca("");
                  setProdutosOriginais([]);
                  setProdutosExibidos([]);
                  setError(null);
                }}
              >
                <IconX size={18} />
              </button>
            )}
            <button className="btn-lupa" onClick={buscarProdutosManual}>
              <IconSearch size={20} />
            </button>
          </div>
        </div>

        <div className="botoes-acao-container">
          <button
            className="btn-filtros"
            onClick={() => setMostrarFiltros(true)}
          >
            <IconAdjustmentsHorizontal size={18} /> Filtros Avançados
          </button>

          {(produtosOriginais.length > 0 ||
            termoBusca ||
            temFiltroCategoriaAtivo) && (
            <button className="btn-limpar-lista" onClick={limparBusca}>
              Limpar Tudo
            </button>
          )}
        </div>

        {temFiltroCategoriaAtivo && !mostrarFiltros && (
          <div className="filtros-ativos-container">
            <div className="chips-container">
              <ChipFiltro
                rotulo="Marca"
                valor={marcaSelecionada && (nomeMarcaAtiva || marcaSelecionada)}
                onRemover={() => removerFiltroAtivo("marca")}
              />
              <ChipFiltro
                rotulo="Grupo"
                valor={grupoSelecionado && (nomeGrupoAtivo || grupoSelecionado)}
                onRemover={() => removerFiltroAtivo("grupo")}
              />
              <ChipFiltro
                rotulo="Subgrupo"
                valor={
                  subgrupoSelecionado &&
                  (nomeSubgrupoAtivo || subgrupoSelecionado)
                }
                onRemover={() => removerFiltroAtivo("subgrupo")}
              />
              <ChipFiltro
                rotulo="Fornecedor"
                valor={
                  fornecedorSelecionado &&
                  (nomeFornAtivo || fornecedorSelecionado)
                }
                onRemover={() => removerFiltroAtivo("fornecedor")}
              />
            </div>
          </div>
        )}
      </div>

      <div className="estoque-conteudo-rolavel">
        <div className="estoque-resumo-card">
          <div className="resumo-item">
            <span className="resumo-label">Encontrados</span>
            <span className="resumo-qtd">{totalItensEncontrados}</span>
          </div>
          <div className="resumo-item divisor">
            <span className="resumo-label">S/ Estoque</span>
            <span className="resumo-alerta-qtd">{itensComEstoqueBaixo}</span>
          </div>
          <div className="resumo-item divisor">
            <span className="resumo-label">Status</span>
            <span className={`status-badge ${error ? "erro" : "ok"}`}>
              {error && !error.includes("letras") ? "Erro" : "OK"}
            </span>
          </div>
        </div>

        {error && <p className="estoque-mensagem-erro">{error}</p>}

        {/* 🔥 AQUI ESTÁ A CORREÇÃO NO JSX PARA O SPINNER APARECER 🔥 */}
        {loading ? (
          <div
            className="modal-carregando-container"
            style={{ height: "50vh" }}
          >
            <div className="spinner"></div>
            <span className="texto-carregando">{mensagemLoading}</span>
          </div>
        ) : (
          <div className="estoque-lista fade-in">
            {produtosExibidos.length === 0 && !error ? (
              <p className="estoque-vazio">Nenhum produto encontrado.</p>
            ) : (
              produtosExibidos.map((produto) => (
                <ProdutoCard
                  key={produto.produto_id}
                  produto={produto}
                  onClick={abrirDetalhesFiliais}
                />
              ))
            )}
          </div>
        )}
      </div>

      {mostrarFiltros && (
        <ModalFiltros
          marcas={marcas}
          grupos={grupos}
          subgrupos={subgrupos}
          fornecedores={fornecedores}
          marcaSelecionada={marcaSelecionada}
          grupoSelecionado={grupoSelecionado}
          subgrupoSelecionado={subgrupoSelecionado}
          fornecedorSelecionado={fornecedorSelecionado}
          nomeMarcaAtiva={nomeMarcaAtiva}
          nomeGrupoAtivo={nomeGrupoAtivo}
          nomeSubgrupoAtivo={nomeSubgrupoAtivo}
          nomeFornAtivo={nomeFornAtivo}
          marcaInput={marcaInput}
          grupoInput={grupoInput}
          subgrupoInput={subgrupoInput}
          fornecedorInput={fornecedorInput}
          setMarcaInput={setMarcaInput}
          setGrupoInput={setGrupoInput}
          setSubgrupoInput={setSubgrupoInput}
          setFornecedorInput={setFornecedorInput}
          setMarcaSelecionada={setMarcaSelecionada}
          carregarSubgrupos={carregarSubgrupos}
          setSubgrupoSelecionado={setSubgrupoSelecionado}
          setFornecedorSelecionado={setFornecedorSelecionado}
          grupoSelectRef={grupoSelectRef}
          subgrupoSelectRef={subgrupoSelectRef}
          fornecedorSelectRef={fornecedorSelectRef}
          onClose={fecharModal}
          onApply={aplicarFiltros}
          onBuscarTodos={buscarTodosViaModal}
        />
      )}

      {produtoSelecionado && (
        <ModalFiliais
          produto={produtoSelecionado}
          filiais={filiaisEstoque}
          loading={loadingFiliais}
          onClose={fecharModal}
        />
      )}
    </div>
  );
};

export default Estoque;
