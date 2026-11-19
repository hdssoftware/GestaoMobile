import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Valor inicial fixado, mas editável
const CNPJ_INICIAL = "";

// Função para aplicar a máscara de CNPJ (00.000.000/0000-00)
const formatarCNPJ = (valor) => {
  const apenasNumeros = valor.replace(/\D/g, "").slice(0, 14);
  return apenasNumeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

function CadastroEmpresa() {
  const [cnpj, setCnpj] = useState(CNPJ_INICIAL);
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);

  const [statusAcesso, setStatusAcesso] = useState("idle"); // idle, pendente, recusado
  const [nomeLoja, setNomeLoja] = useState("");

  const navigate = useNavigate();

  // 1. Definição da API
  const host = window.location.hostname;
  const portaAPI = "3000";
  const API_BASE_URL =
    (typeof import.meta !== "undefined" && import.meta.env.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env.REACT_APP_API_URL) ||
    `http://${host}:${portaAPI}/api`;

  // Identifica o modelo de forma defensiva e extrai dados do aparelho
  const capturarNomeAparelho = async () => {
    let modelo = "Dispositivo Desconhecido";
    const ua = navigator.userAgent;

    if (
      navigator.userAgentData &&
      navigator.userAgentData.getHighEntropyValues
    ) {
      try {
        const dados = await navigator.userAgentData.getHighEntropyValues([
          "model",
          "platform",
        ]);
        if (dados.model) {
          modelo = `${dados.platform} ${dados.model}`;
        } else if (dados.platform) {
          modelo = dados.platform;
        }
      } catch (e) {
        console.warn("Client hints bloqueado ou não suportado");
      }
    } else {
      if (/iPhone/i.test(ua)) modelo = "Apple iPhone";
      else if (/iPad/i.test(ua)) modelo = "Apple iPad";
      else if (/Android/i.test(ua)) {
        const match = ua.match(/\bAndroid[^;]*;([^)]+)\)/);
        if (match && match[1]) {
          let modeloLimpo = match[1].split("Build/")[0].trim();
          if (
            modeloLimpo.includes("AppleWebKit") ||
            modeloLimpo.includes("Chrome")
          ) {
            modeloLimpo = "Dispositivo Android";
          }
          modelo = `Android (${modeloLimpo})`;
        } else {
          modelo = "Android";
        }
      } else if (/Windows/i.test(ua)) modelo = "Windows PC";
      else if (/Macintosh/i.test(ua)) modelo = "Mac Computador";
    }

    const largura = window.screen.width;
    const altura = window.screen.height;
    const ratio = window.devicePixelRatio || 1;
    const tela = `${Math.round(largura * ratio)}x${Math.round(altura * ratio)}`;
    const cores = window.screen.colorDepth
      ? `${window.screen.colorDepth}-bit`
      : "";
    const touch = navigator.maxTouchPoints > 0 ? "Touch: Sim" : "Touch: Não";

    let gpu = "";
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const rendererOriginal = gl.getParameter(
            debugInfo.UNMASKED_RENDERER_WEBGL,
          );
          if (rendererOriginal && rendererOriginal.includes("ANGLE")) {
            const partes = rendererOriginal.split(",");
            if (partes.length > 1) gpu = partes[1].trim();
          } else {
            gpu = rendererOriginal;
          }
        }
      }
    } catch (e) {
      console.warn("WebGL não suportado para captura de GPU");
    }

    const conexao = navigator.connection?.effectiveType
      ? `Rede: ${navigator.connection.effectiveType.toUpperCase()}`
      : "";
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory}GB RAM` : "";
    const nucleos = navigator.hardwareConcurrency
      ? `${navigator.hardwareConcurrency} Núcleos`
      : "";

    const idioma = navigator.language || "";
    const fusoHorario = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    const detalhes = [modelo];
    if (nucleos) detalhes.push(nucleos);
    if (ram) detalhes.push(ram);
    if (tela) detalhes.push(`Tela ${tela}`);
    if (cores) detalhes.push(cores);
    if (gpu) detalhes.push(`GPU: ${gpu}`);
    if (conexao) detalhes.push(conexao);
    if (idioma) detalhes.push(idioma);
    if (fusoHorario) detalhes.push(fusoHorario);
    detalhes.push(touch);

    return detalhes.join(" | ");
  };

  const handleUserChange = (e) => setUser(e.target.value);
  const handleCnpjChange = (e) => setCnpj(formatarCNPJ(e.target.value));

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("device_token");
    const lojaSalva = localStorage.getItem("nome_loja");
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (usuarioSalvo) {
      setUser(usuarioSalvo); // Puxa o último usuário salvo, se houver
    }

    if (tokenSalvo) {
      if (lojaSalva) setNomeLoja(lojaSalva);
      setStatusAcesso("pendente");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cnpjLimpo = cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length === 14 && user.trim() !== "") {
      setLoading(true);
      const modeloAparelho = await capturarNomeAparelho();

      try {
        const response = await fetch(`${API_BASE_URL}/dispositivo/solicitar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cnpj: cnpjLimpo,
            nome_usuario: user.trim(),
            info_dispositivo: `${modeloAparelho} - ${user.trim()}`,
          }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem("device_token", data.device_token);
          localStorage.setItem("usuarioLogado", user.trim());
          localStorage.setItem("cnpj_empregador", cnpjLimpo); 
          localStorage.setItem("cnpj_vinculado", cnpjLimpo); 

          if (data.loja) localStorage.setItem("nome_loja", data.loja);

          setNomeLoja(data.loja || "Empresa");
          setStatusAcesso("pendente");
        } else {
          alert(data.message || "Erro ao solicitar acesso.");
        }
      } catch (error) {
        console.error(error);
        alert(
          "Erro ao conectar com o servidor. Verifique se a API está rodando.",
        );
      } finally {
        setLoading(false);
      }
    } else {
      alert("Por favor, preencha um CNPJ válido e digite seu nome.");
    }
  };

  const cancelarSolicitacao = () => {
    localStorage.removeItem("device_token");
    localStorage.removeItem("nome_loja");
    setStatusAcesso("idle");
  };

  useEffect(() => {
    let interval;

    if (statusAcesso === "pendente") {
      interval = setInterval(async () => {
        const token = localStorage.getItem("device_token");
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE_URL}/dispositivo/status`, {
            method: "GET",
            headers: { "x-device-token": token },
          });

          if (response.status === 404) {
            clearInterval(interval);
            cancelarSolicitacao();
            return;
          }

          const data = await response.json();

          if (data.aprovado) {
            clearInterval(interval);

            if (data.permissoes) {
              localStorage.setItem(
                "permissoes",
                JSON.stringify(data.permissoes),
              );
            }

            if (
              data.clientes &&
              Array.isArray(data.clientes) &&
              data.clientes.length > 0
            ) {
              localStorage.setItem(
                "lista_clientes",
                JSON.stringify(data.clientes),
              );
              localStorage.setItem("cnpj_cliente_ativo", data.clientes[0].cnpj);
            } else {
              const cnpjEmpregador = localStorage.getItem("cnpj_empregador");
              localStorage.setItem("cnpj_cliente_ativo", cnpjEmpregador);
            }

            navigate("/menu-principal");
          } else if (data.status === "recusado") {
            clearInterval(interval);
            setStatusAcesso("recusado");
            localStorage.removeItem("device_token");
          }
        } catch (error) {
          console.error("Erro na verificação automática:", error);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [statusAcesso, navigate, API_BASE_URL]);

  return (
    <div className="relative flex flex-col h-screen w-full items-center justify-center p-4 overflow-x-hidden bg-slate-50 font-sans text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-600/10 -z-10"></div>

      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 border border-slate-200 z-10">
        <div className="text-center mb-8">
          <h1 className="text-slate-900 text-4xl font-bold tracking-tight mb-2 text-[#0d47a1]">
            Eagle
          </h1>
          <p className="text-slate-500 text-sm">Sistema de Gestão</p>
        </div>

        {statusAcesso === "idle" && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cnpj"
                className="text-slate-700 text-sm font-semibold flex items-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-[25px]"
                  translate="no"
                >
                  business
                </span>
                CNPJ da Empresa
              </label>
              <input
                id="cnpj"
                name="cnpj"
                type="text"
                maxLength={18}
                placeholder="00.000.000/0000-00"
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all h-12 px-4 text-base"
                value={cnpj}
                onChange={handleCnpjChange}
                disabled={loading}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="user"
                className="text-slate-700 text-sm font-semibold flex items-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-[25px]"
                  translate="no"
                >
                  person
                </span>
                Colaborador
              </label>
              <input
                id="user"
                name="user"
                type="text"
                placeholder="Digite seu nome"
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all h-12 px-4 text-base"
                value={user}
                onChange={handleUserChange}
                disabled={loading}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || user.trim() === ""}
                className="w-full bg-[#0d47a1] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 group hover:bg-blue-800 hover:shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verificando..." : "Solicitar Acesso"}
                {!loading && (
                  <span
                    className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                    translate="no"
                  >
                    login
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {statusAcesso === "pendente" && (
          <div className="text-center py-6 space-y-4">
            <span
              className="material-symbols-outlined text-6xl text-blue-500 animate-pulse"
              translate="no"
            >
              hourglass_empty
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              Aguardando Liberação
            </h2>
            <p className="text-slate-600 text-sm">
              Sua solicitação para acessar a empresa <strong>{nomeLoja}</strong>{" "}
              foi enviada.
            </p>
            <p className="text-slate-500 text-xs bg-slate-100 p-3 rounded-md mb-4">
              Peça para o gerente aprovar o seu dispositivo no painel de
              controle. Esta tela atualizará automaticamente.
            </p>
            <button
              onClick={cancelarSolicitacao}
              className="mt-4 text-sm text-red-500 hover:text-red-700 underline font-medium"
            >
              Cancelar e voltar ao início
            </button>
          </div>
        )}

        {statusAcesso === "recusado" && (
          <div className="text-center py-6 space-y-4">
            <span
              className="material-symbols-outlined text-6xl text-red-500"
              translate="no"
            >
              block
            </span>
            <h2 className="text-xl font-bold text-slate-800">Acesso Negado</h2>
            <p className="text-slate-600 text-sm">
              O administrador recusou a entrada deste dispositivo no sistema.
            </p>
            <button
              onClick={() => setStatusAcesso("idle")}
              className="mt-4 w-full bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-300 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-slate-400 text-sm flex items-center gap-1 z-10">
        <span className="material-symbols-outlined text-[16px]" translate="no">
          copyright
        </span>
        2026 HDS Software v1.0.0
      </div>
    </div>
  );
}

export default CadastroEmpresa;