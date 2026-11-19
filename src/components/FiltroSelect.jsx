import React, { forwardRef, useMemo } from "react";
import Select from "react-select";
import { selectStyles } from "../styles/selectStyles";

/**
 * Combo de filtro reutilizável (Marca / Grupo / Subgrupo / Fornecedor).
 *
 * Reproduz o comportamento original de cada Select:
 * - digitar e sair do campo (onBlur) confirma o primeiro item compatível;
 * - Enter/Tab confirma o item digitado e (opcionalmente) foca o próximo campo;
 * - selecionar via mouse/teclado também foca o próximo campo, se informado.
 *
 * idField/nameField: chaves do objeto de item (ex: "marca_id", "nome").
 * nextRef: ref do próximo Select a ser focado após confirmar um valor
 *          (deixe undefined para não focar automaticamente, como no caso
 *          do campo "Grupo", cujo foco do próximo campo é tratado à parte
 *          por depender do carregamento assíncrono dos subgrupos).
 */
const FiltroSelect = forwardRef(function FiltroSelect(
  {
    icon: Icon,
    label,
    noOptionsText,
    items,
    idField,
    nameField,
    selectedValue,
    selectedLabel,
    inputValue,
    onInputValueChange,
    onSelect,
    nextRef,
  },
  ref,
) {
  const options = useMemo(
    () =>
      items.map((item) => ({ value: item[idField], label: item[nameField] })),
    [items, idField, nameField],
  );

  const value = selectedValue
    ? { value: selectedValue, label: selectedLabel || selectedValue }
    : null;

  // Tenta confirmar o texto digitado (usado em onBlur e Enter/Tab).
  // Retorna true se algum item foi encontrado e selecionado.
  const confirmarDigitado = () => {
    if (!inputValue.trim()) return false;
    const termo = inputValue.toLowerCase();
    const encontrado = items.find((item) =>
      item[nameField].toLowerCase().includes(termo),
    );
    onInputValueChange("");
    if (encontrado) {
      onSelect(encontrado[idField]);
      return true;
    }
    return false;
  };

  const focarProximo = () => {
    if (nextRef?.current) setTimeout(() => nextRef.current.focus(), 100);
  };

  return (
    <div className="busca-marca-container">
      <label className="marca-label">
        <Icon size={16} /> {label}
      </label>
      <Select
        ref={ref}
        styles={selectStyles}
        placeholder="Pesquise ou selecione..."
        noOptionsMessage={() => noOptionsText}
        isClearable
        menuPlacement="auto"
        menuPosition="fixed"
        maxMenuHeight={220}
        openMenuOnFocus
        options={options}
        value={value}
        onInputChange={(val, { action }) => {
          if (action === "input-change") onInputValueChange(val);
        }}
        onBlur={confirmarDigitado}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Tab") {
            if (confirmarDigitado()) {
              e.preventDefault();
              focarProximo();
            }
          }
        }}
        onChange={(item) => {
          onSelect(item ? item.value : "");
          onInputValueChange("");
          if (item) focarProximo();
        }}
      />
    </div>
  );
});

export default FiltroSelect;
