import React from "react";
import { IconX } from "@tabler/icons-react";

function ChipFiltro({ rotulo, valor, onRemover }) {
  if (!valor) return null;
  return (
    <div className="chip-filtro">
      <span>
        {rotulo}: <strong>{valor}</strong>
      </span>
      <button className="btn-remover-chip" onClick={onRemover}>
        <IconX size={14} />
      </button>
    </div>
  );
}

export default ChipFiltro;
