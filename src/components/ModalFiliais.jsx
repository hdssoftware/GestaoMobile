import React from "react";
import ReactDOM from "react-dom";

function ModalFiliais({ produto, filiais, loading, onClose }) {
  return ReactDOM.createPortal(
    <div className="modal-filiais-overlay" onClick={onClose}>
      <div
        className="modal-filiais-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-filiais-header">
          <h3>Estoque por Filial</h3>
          <p className="modal-produto-titulo">{produto.nome}</p>
          <p className="modal-produto-sub">
            Cód: {produto.produto_id} | Barras: {produto.cod_barra || "N/A"}
          </p>
        </div>

        {loading ? (
          /* 🔥 ANIMAÇÃO DE LOADING AQUI 🔥 */
          <div className="modal-carregando-container">
            <div className="spinner"></div>
            <span className="texto-carregando">Buscando estoque...</span>
          </div>
        ) : (
          /* Adicionada classe fade-in para a tabela aparecer suavemente */
          <div className="modal-tabela-container fade-in">
            <table className="tabela-filiais">
              <thead>
                <tr>
                  <th>Filial</th>
                  <th>Qtd.</th>
                </tr>
              </thead>
              <tbody>
                {filiais && filiais.length > 0 ? (
                  filiais.map((filial, index) => (
                    <tr key={index}>
                      <td className="tabela-nome-filial">
                        {filial.nome_filial ||
                          filial.nome ||
                          filial.filial ||
                          `Filial ID: ${filial.filial_id}`}
                      </td>
                      <td
                        className={
                          filial.estoque <= 0 ? "txt-critico" : "txt-normal"
                        }
                      >
                        <strong>{filial.estoque || 0}</strong>{" "}
                        {produto.unidade || "UN"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        color: "#666",
                      }}
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <button className="btn-fechar-filial" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default ModalFiliais;
