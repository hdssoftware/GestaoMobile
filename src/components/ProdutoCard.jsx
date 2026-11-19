import React from "react";
import { IconMapPin, IconTags, IconBarcode } from "@tabler/icons-react";

function ProdutoCard({ produto, onClick }) {
  return (
    <div className="estoque-erp-card" onClick={() => onClick(produto)}>
      <div className="erp-card-row topo">
        <span>ID Interno: {produto.produto_id}</span>
        <span className="erp-endereco">
          <IconMapPin size={14} /> {produto.micro || "Sem Endereço"}
        </span>
      </div>
      <div className="erp-card-produto">
        <span className="erp-produto-nome">{produto.nome}</span>
        <span className="erp-produto-marca">
          <IconTags size={14} /> Marca ID: {produto.marca_id || "N/A"} | Forn. ID:{" "}
          {produto.codfor_id || "N/A"} ({produto.unidade || "UN"})
        </span>
      </div>
      <div className="erp-card-row rodape">
        <span className="erp-barcode">
          <IconBarcode size={16} /> {produto.cod_barra || "Sem Código"}
        </span>
        <div className="erp-valores-estoque">
          <span className="erp-preco-unidade">
            R$ {produto.preco ? Number(produto.preco).toFixed(2) : "0.00"}
          </span>
          <span
            className={`erp-qtd-disponivel ${produto.estoque <= 0 ? "critico" : "normal"}`}
          >
            {produto.estoque || 0} {produto.unidade || "UN"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProdutoCard);
