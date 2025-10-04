// Puzzle.jsx
import React, { useState } from "react";

const tamTabu = 3; // 3x3
const styles = {
  app: { fontFamily: 'Arial, sans-serif', padding: 16 },
  container: { display: 'flex', gap: 40, justifyContent: 'center', marginTop: 16 },
  painel: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  tabuleiro: { display: 'grid', gridTemplateColumns: `repeat(${tamTabu}, 70px)`, gap: 8, margin: '10px 0' },
  peca: { width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, borderRadius: 6, border: '1px solid #666', background: '#eee', cursor: 'pointer', transition: 'all 0.2s ease' },
  vazio: { background: '#fff', border: '1px dashed #bbb', cursor: 'default' },
  botoes: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  painelDireita: { minWidth: 420 }
};

function Puzzle() {
  const [tabuleiroInicial, setTabuleiroInicial] = useState([1,2,3,4,5,6,7,8,0]); // 0 = espaço vazio
    const [tabuleiroFinal, setTabuleiroFinal] = useState([1,2,3,4,5,6,7,8,0]);

  const posicoesAdjacentes = (idx) => {
    const adj = [];
    const row = Math.floor(idx / tamTabu);
    const col = idx % tamTabu;
    if (row > 0) adj.push(idx - tamTabu); // cima
    if (row < tamTabu - 1) adj.push(idx + tamTabu); // baixo
    if (col > 0) adj.push(idx - 1); // esquerda
    if (col < tamTabu - 1) adj.push(idx + 1); // direita
    return adj;
  };

  const moverPeca = (idx) => {
    const vazioIdx = tabuleiroInicial.indexOf(0);
    if (posicoesAdjacentes(idx).includes(vazioIdx)) {
      const novoTab = [...tabuleiroInicial];
      [novoTab[idx], novoTab[vazioIdx]] = [novoTab[vazioIdx], novoTab[idx]];
      setTabuleiroInicial(novoTab);
    }
  };

  const embaralhar = () => {
    let novoTab = [...tabuleiroInicial];
    for (let i = 0; i < 100; i++) {
      const vazioIdx = novoTab.indexOf(0);
      const adj = posicoesAdjacentes(vazioIdx);
      const rand = adj[Math.floor(Math.random() * adj.length)];
      [novoTab[vazioIdx], novoTab[rand]] = [novoTab[rand], novoTab[vazioIdx]];
    }
    setTabuleiroInicial(novoTab);
  };

  const reset = () => setTabuleiroInicial([1,2,3,4,5,6,7,8,0]);

  return (
    <div>
        <div style={styles.painel}>
        <h3>Tabuleiro do Puzzle</h3>
        <div style={styles.tabuleiroInicial}>
            {tabuleiroInicial.map((v,i) => (
            <div
                key={i}
                style={{...styles.peca, ...(v===0?styles.vazio:{} )}}
                onClick={() => v!==0 && moverPeca(i)}
            >
                {v===0 ? '' : v}
            </div>
            ))}
        </div>
        <div style={styles.botoes}>
            <button onClick={embaralhar}>🔀 Embaralhar</button>
            <button onClick={reset}>♻️ Reset</button>
        </div>
        </div>

        <div style={styles.painel}>
        <h3>Tabuleiro do Puzzle</h3>
        <div style={styles.tabuleiroFinal}>
            {tabuleiroFinal.map((v,i) => (
            <div
                key={i}
                style={{...styles.peca, ...(v===0?styles.vazio:{} )}}
                onClick={() => v!==0 && moverPeca(i)}
            >
                {v===0 ? '' : v}
            </div>
            ))}
        </div>
        <div style={styles.botoes}>
            <button onClick={embaralhar}>🔀 Embaralhar</button>
            <button onClick={reset}>♻️ Reset</button>
        </div>
        </div>
    </div>
  );
}

export default Puzzle;
