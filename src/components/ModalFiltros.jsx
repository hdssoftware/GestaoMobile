import React from "react";
import { IconTags, IconFolder, IconTruck, IconSearch } from "@tabler/icons-react";
import FiltroSelect from "./FiltroSelect";

function ModalFiltros({
  // dados das combos
  marcas,
  grupos,
  subgrupos,
  fornecedores,
  // seleção atual (ids)
  marcaSelecionada,
  grupoSelecionado,
  subgrupoSelecionado,
  fornecedorSelecionado,
  // labels ativos
  nomeMarcaAtiva,
  nomeGrupoAtivo,
  nomeSubgrupoAtivo,
  nomeFornAtivo,
  // texto digitado (mobile fix)
  marcaInput,
  grupoInput,
  subgrupoInput,
  fornecedorInput,
  setMarcaInput,
  setGrupoInput,
  setSubgrupoInput,
  setFornecedorInput,
  // setters / ações
  setMarcaSelecionada,
  carregarSubgrupos,
  setSubgrupoSelecionado,
  setFornecedorSelecionado,
  // refs para foco sequencial
  grupoSelectRef,
  subgrupoSelectRef,
  fornecedorSelectRef,
  // ações do modal
  onClose,
  onApply,
  onBuscarTodos,
}) {
  return (
    <div className="modal-filiais-overlay" onClick={onClose}>
      <div className="modal-filiais-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-filiais-header">
          <h3>Filtros de Busca</h3>
          <p className="modal-produto-sub">Combine os filtros abaixo para refinar</p>
        </div>

        <div className="filtros-selecao-grid">
          <FiltroSelect
            icon={IconTags}
            label="Filtrar por Marca:"
            noOptionsText="Nenhuma marca encontrada"
            items={marcas}
            idField="marca_id"
            nameField="nome"
            selectedValue={marcaSelecionada}
            selectedLabel={nomeMarcaAtiva}
            inputValue={marcaInput}
            onInputValueChange={setMarcaInput}
            onSelect={setMarcaSelecionada}
            nextRef={grupoSelectRef}
          />

          <FiltroSelect
            ref={grupoSelectRef}
            icon={IconFolder}
            label="Filtrar por Grupo:"
            noOptionsText="Nenhum grupo encontrado"
            items={grupos}
            idField="grupo_id"
            nameField="nome"
            selectedValue={grupoSelecionado}
            selectedLabel={nomeGrupoAtivo}
            inputValue={grupoInput}
            onInputValueChange={setGrupoInput}
            onSelect={carregarSubgrupos}
            // sem nextRef: o foco do Subgrupo é feito por um efeito próprio,
            // já que a lista de subgrupos depende de uma chamada assíncrona
          />

          {grupoSelecionado && (
            <FiltroSelect
              ref={subgrupoSelectRef}
              icon={IconFolder}
              label="Filtrar por Subgrupo:"
              noOptionsText="Nenhum subgrupo encontrado"
              items={subgrupos}
              idField="subgrupo_id"
              nameField="nome"
              selectedValue={subgrupoSelecionado}
              selectedLabel={nomeSubgrupoAtivo}
              inputValue={subgrupoInput}
              onInputValueChange={setSubgrupoInput}
              onSelect={setSubgrupoSelecionado}
              nextRef={fornecedorSelectRef}
            />
          )}

          <FiltroSelect
            ref={fornecedorSelectRef}
            icon={IconTruck}
            label="Filtrar por Fornecedor:"
            noOptionsText="Nenhum fornecedor encontrado"
            items={fornecedores}
            idField="fornecedor_id"
            nameField="nome"
            selectedValue={fornecedorSelecionado}
            selectedLabel={nomeFornAtivo}
            inputValue={fornecedorInput}
            onInputValueChange={setFornecedorInput}
            onSelect={setFornecedorSelecionado}
          />

          <button className="btn-buscar-todos-modal" onClick={onBuscarTodos}>
            <IconSearch size={18} /> Buscar Todos os Produtos
          </button>
        </div>

        <div className="modal-footer-duplo">
          <button className="btn-sair" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-buscar-modal" onClick={onApply}>
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalFiltros;

