import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import "./LeitorCodigo.css";

function LeitorCodigo() {
  const navigate = useNavigate();
  // Alterado para um ID mais simples e direto para evitar bugs de renderização na árvore do DOM
  const qrRegionId = "reader";
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    html5QrcodeRef.current = new Html5Qrcode(qrRegionId);

    const config = {
      fps: 10,
      qrbox: { width: 300, height: 150 },
    };

    html5QrcodeRef.current
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // --- FUNÇÃO DE SUCESSO ---
          alert(`Código detectado: ${decodedText}`);

          // Exemplo de redirecionamento útil após a leitura:
          // navigate(`/produtos?busca=${decodedText}`);

          pararCameraECapitura();
        },
        (errorMessage) => {
          // Erros normais de busca por frame (pode deixar vazio)
        },
      )
      .catch((err) => {
        console.error("Erro ao iniciar a câmera:", err);
        alert(
          "Não foi possível acessar a câmera. Se estiver no celular, certifique-se de que está usando uma conexão segura HTTPS ou localhost.",
        );
        // Se der erro ao abrir, volta para o menu principal ao invés do login
        navigate("/menu-principal");
      });

    return () => {
      pararCameraECapitura();
    };
  }, [navigate]);

  const pararCameraECapitura = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current
        .stop()
        .then(() => html5QrcodeRef.current.clear())
        .catch((err) => console.error("Erro ao parar câmera", err));
    }
  };

  return (
    <div className="leitor-container">
      <header className="leitor-header">
        {/* Alterado aqui: em vez de voltar no histórico (-1), força o redirecionamento para o menu principal */}
        <button
          className="btn-voltar"
          onClick={() => navigate("/menu-principal")}
        >
          ✕ Voltar
        </button>
        <h2>Alinhe o Código de Barras</h2>
      </header>

      {/* Container com o ID atualizado */}
      <div id={qrRegionId} className="camera-view"></div>

      <div className="leitor-footer">
        <p>Aponte para o código de barras do produto</p>
      </div>
    </div>
  );
}

export default LeitorCodigo;
