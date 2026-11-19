import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerificacaoAcesso = () => {
  const navigate = useNavigate();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [status, setStatus] = useState("inicial"); // inicial, aguardando, recusado
  const [mensagem, setMensagem] = useState("");

  // Descobre a URL da API automaticamente (Localhost ou IP da rede)
  const host = window.location.hostname;
  const API_URL = (host === "localhost" || host === "127.0.0.1" || host === "")
    ? "http://localhost:3000/api"
    : `http://${host}:3000/api`;

  // 1. Obtém ou cria o UUID do aparelho no localStorage
  const getDeviceUuid = () => {
    let uuid = localStorage.getItem("device_uuid");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("device_uuid", uuid);
    }
    return uuid;
  };

  // 2. Identifica o navegador/modelo do celular
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "Dispositivo Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "Dispositivo iOS (iPhone)";
    return "Navegador Web / PC";
  };

  // 3. Envia a solicitação de acesso para a API
  const solicitarAcesso = async (e) => {
    e.preventDefault();
    if (!nomeUsuario.trim()) return alert("Digite seu nome!");

    const payload = {
      nome_usuario: nomeUsuario,
      info_dispositivo: `${getDeviceInfo()} (${getDeviceUuid().slice(0, 8)})`,
      device_uuid: getDeviceUuid(),
    };

    try {
      const response = await fetch(`${API_URL}/solicitar-acesso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("aguardando");
        setMensagem("Solicitação enviada! Aguarde a aprovação do administrador.");
      } else {
        alert(data.message || "Erro ao solicitar acesso.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  // 4. Monitora a aprovação em tempo real (Polling a cada 3s)
  useEffect(() => {
    let interval;

    if (status === "aguardando") {
      interval = setInterval(async () => {
        try {
          const uuid = getDeviceUuid();
          const response = await fetch(`${API_URL}/checar-status/${uuid}`);
          const data = await response.json();

          if (data.aprovado) {
            clearInterval(interval);
            // Salva as permissões vindas do banco no localStorage
            localStorage.setItem("permissoes", JSON.stringify(data.permissoes));
            localStorage.setItem("usuarioLogado", nomeUsuario);
            
            // Redireciona para o Menu Principal
            navigate("/menu");
          } else if (data.status === "recusado") {
            clearInterval(interval);
            setStatus("recusado");
            setMensagem("Sua solicitação foi recusada pelo administrador.");
          }
        } catch (err) {
          console.error("Erro ao verificar status:", err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [status, navigate, nomeUsuario]);

  return (
    <div className="acesso-container">
      <div className="acesso-card">
        <h2>Eagle Gestão</h2>
        <p>Identificação de Dispositivo</p>

        {status === "inicial" && (
          <form onSubmit={solicitarAcesso}>
            <input
              type="text"
              placeholder="Digite seu nome ou identificação"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              required
            />
            <button type="submit">Solicitar Acesso</button>
          </form>
        )}

        {status === "aguardando" && (
          <div className="status-box aguardando">
            <div className="spinner"></div>
            <p>{mensagem}</p>
            <small>Dispositivo: {getDeviceInfo()}</small>
          </div>
        )}

        {status === "recusado" && (
          <div className="status-box recusado">
            <p>❌ {mensagem}</p>
            <button onClick={() => setStatus("inicial")}>Tentar Novamente</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificacaoAcesso;