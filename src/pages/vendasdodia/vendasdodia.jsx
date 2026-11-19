import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconReceipt,
  IconUser,
  IconCalendar,
} from "@tabler/icons-react";
import "./VendasDoDia.css";

export default function VendasDoDia() {
  const navigate = useNavigate();

  const [vendas] = useState([
    {
      id: 1,
      clienteCod: "56326-0",
      nome: "Manoel Antunes",
      numero: "22013",
      emissao: "28/01/2026",
      operacao: "A PRAZO",
      cdv: "42",
      valor: 104.99,
    },
    {
      id: 2,
      clienteCod: "41183-0",
      nome: "Madeireira Silva",
      numero: "22027",
      emissao: "28/01/2026",
      operacao: "A PRAZO",
      cdv: "64",
      valor: 319.88,
    },
    {
      id: 3,
      clienteCod: "15899-0",
      nome: "Construtora Sol",
      numero: "22028",
      emissao: "28/01/2026",
      operacao: "A VISTA",
      cdv: "42",
      valor: 617.94,
    },
    {
      id: 4,
      clienteCod: "04347-0",
      nome: "Carlos Eduardo",
      numero: "22039",
      emissao: "28/01/2026",
      operacao: "A PRAZO",
      cdv: "33",
      valor: 948.98,
    },
    {
      id: 5,
      clienteCod: "56326-0",
      nome: "Manoel Antunes",
      numero: "22040",
      emissao: "28/01/2026",
      operacao: "A VISTA",
      cdv: "42",
      valor: 104.99,
    },
    {
      id: 6,
      clienteCod: "88412-0",
      nome: "Padaria Central",
      numero: "22041",
      emissao: "28/01/2026",
      operacao: "A VISTA",
      cdv: "12",
      valor: 55.5,
    },
  ]);

  const totalDoDia = vendas.reduce((acc, venda) => acc + venda.valor, 0);

  return (
    <main className="vendas-container">
      {/* Cabeçalho fixo semântico */}
      <header className="vendas-header">
        <button
          className="btn-voltar"
          onClick={() => navigate("/menu-principal")}
          aria-label="Voltar para o menu principal"
        >
          <IconArrowLeft size={28} aria-hidden="true" />
        </button>
        <hgroup>
          <h2>Relatório de Vendas</h2>
          <p className="vendas-subtitulo">Movimentação Diária</p>
        </hgroup>
      </header>

      {/* Resumo do dia em lista de definição semântica */}
      <dl className="vendas-resumo-card" aria-label="Resumo do Caixa">
        <div className="resumo-item">
          <dt className="resumo-label">Total de Vendas</dt>
          <dd className="resumo-qtd">{vendas.length}</dd>
        </div>
        <div className="resumo-item divisor">
          <dt className="resumo-label">Valor Acumulado</dt>
          <dd className="resumo-valor-total">
            R${" "}
            {totalDoDia.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </dd>
        </div>
      </dl>

      {/* Lista responsiva de cards */}
      <ul className="vendas-lista">
        {vendas.map((venda) => (
          <li key={venda.id} className="venda-erp-card">
            <header className="erp-card-row topo">
              <strong className="erp-numero">
                <IconReceipt size={18} aria-hidden="true" /> Nº {venda.numero}
              </strong>
              <time
                className="erp-data"
                dateTime={venda.emissao.split("/").reverse().join("-")}
              >
                <IconCalendar size={18} aria-hidden="true" /> {venda.emissao}
              </time>
            </header>

            <div className="erp-card-cliente">
              <IconUser size={20} className="icon-cliente" aria-hidden="true" />
              <div>
                <strong className="erp-cliente-nome">{venda.nome}</strong>
                <small className="erp-cliente-cod">
                  Cód: {venda.clienteCod}
                </small>
              </div>
            </div>

            <footer className="erp-card-row rodape">
              <div className="erp-tags" aria-label="Detalhes da operação">
                <span
                  className={`tag-operacao ${
                    venda.operacao === "A VISTA" ? "vista" : "prazo"
                  }`}
                >
                  {venda.operacao}
                </span>
                <span className="tag-vendedor">CDV: {venda.cdv}</span>
              </div>
              <strong className="erp-valor">
                R${" "}
                {venda.valor.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </footer>
          </li>
        ))}
      </ul>
    </main>
  );
}
