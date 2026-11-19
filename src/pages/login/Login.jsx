import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes de fallback para os dialogs (substitua pelos seus reais)
// import LoadingOverlay from './LoadingOverlay';
// import ErrorDialog from './ErrorDialog';

export default function PrimeiroAcesso() {
  const navigate = useNavigate();

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nomeAcesso, setNomeAcesso] = useState("");

  // Estados de controle de interface/modais
  const [loading, setLoading] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [erroMensagem, setErroMensagem] = useState("");
  const [erroDetalhe, setErroDetalhe] = useState("");

  // Ação de voltar
  const onBack = () => {
    navigate(-1); // Volta para a tela anterior
  };

  // Máscara de telefone (substitui a diretiva phoneMask)
  const handleTelefoneChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
    }

    if (valor.length > 9) {
      valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
    }

    setTelefone(valor);
  };

  // Ação de envio do formulário
  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Lógica de salvamento aqui...
    setTimeout(() => {
      setLoading(false);
      console.log("Cadastro concluído:", { nome, telefone, nomeAcesso });
      // navigate("/proxima-tela");
    }, 1000);
  };

  // Validação para habilitar o botão
  const formValido =
    nome.trim() !== "" && telefone.trim() !== "" && nomeAcesso.trim() !== "";

  return (
    <div className="relative flex h-full w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      {/* Comente ou substitua pelos seus componentes reais */}
      {/* <LoadingOverlay visible={loading} /> */}
      {/* <ErrorDialog
        visible={erroVisivel}
        mensagem={erroMensagem}
        detalhe={erroDetalhe}
        onClose={() => setErroVisivel(false)}
      /> */}

      {/* Top Navigation */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <button
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer transition-opacity hover:opacity-70"
          type="button"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-[24px]">
            arrow_back
          </span>
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Primeiro Acesso
        </h2>
      </div>

      {/* Header Content */}
      <div className="max-w-[480px] mx-auto w-full flex-1 overflow-y-auto">
        <h2 className="text-slate-900 dark:text-slate-100 tracking-tight text-[28px] font-bold leading-tight px-6 text-center pb-2 pt-4">
          Complete seu Cadastro
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pb-6 pt-1 px-8 text-center">
          Precisamos de mais algumas informações para personalizar sua
          experiência corporativa e garantir sua segurança.
        </p>

        {/* Registration Form */}
        <form className="flex flex-col gap-5 px-6 pb-10" onSubmit={onSubmit}>
          {/* Nome Completo */}
          <label className="flex flex-col w-full cursor-pointer">
            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-2 ml-1">
              Nome Completo
            </p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                person
              </span>
              <input
                className="flex w-full min-w-0 rounded-xl text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-12 pr-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-normal transition-all"
                placeholder="Digite seu nome completo"
                type="text"
                name="nome"
                maxLength="100"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          </label>

          {/* Telefone */}
          <label className="flex flex-col w-full cursor-pointer">
            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-2 ml-1">
              Telefone
            </p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                call
              </span>
              <input
                className="flex w-full min-w-0 rounded-xl text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-12 pr-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-normal transition-all"
                placeholder="(00) 00000-0000"
                type="tel"
                inputMode="numeric"
                name="telefone"
                maxLength={15}
                value={telefone}
                onChange={handleTelefoneChange}
              />
            </div>
          </label>

          {/* Nome do Acesso */}
          <label className="flex flex-col w-full cursor-pointer">
            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-2 ml-1">
              Nome do Acesso
            </p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                devices
              </span>
              <input
                className="flex w-full min-w-0 rounded-xl text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-14 pl-12 pr-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-normal transition-all"
                placeholder="Ex: Smartphone da empresa"
                type="text"
                name="nomeAcesso"
                maxLength="30"
                value={nomeAcesso}
                onChange={(e) => setNomeAcesso(e.target.value)}
              />
            </div>
          </label>

          {/* Submit */}
          <div className="pt-6 pb-safe">
            <button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!formValido || loading}
            >
              <span>{loading ? "Processando..." : "Concluir Cadastro"}</span>
              {!loading && (
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
