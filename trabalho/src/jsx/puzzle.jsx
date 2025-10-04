// Puzzle.jsx
import React, { useState } from "react";

const tamTabu = 3; // 3x3
const styles = {
  app: { fontFamily: 'Arial, sans-serif', padding: 16 },
  container: { display: 'flex', gap: 40, justifyContent: 'center', marginTop: 16 },
  tabuleiros: { display: 'flex', justifyContent: 'center', gap: 40, marginTop: 16 },
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
  const [heuristicas, setHeuristicas] = useState([]);
  const tabIni = tabuleiroInicial;

  const posicoesAdjacentes = (idx) => {
    const adj = [];
    const row = Math.floor(idx / tamTabu);
    const col = idx % tamTabu;
    if (row > 0) 
      adj.push(idx - tamTabu); // cima
    if (row < tamTabu - 1) 
      adj.push(idx + tamTabu); // baixo
    if (col > 0) 
      adj.push(idx - 1); // esquerda
    if (col < tamTabu - 1) 
      adj.push(idx + 1); // direita
    return adj;
  };

  const moverPeca = (idx) => {
    const vazioIdx = tabuleiroFinal.indexOf(0);
    if (posicoesAdjacentes(idx).includes(vazioIdx)) {
      const novoTab = [...tabuleiroFinal];
      [novoTab[idx], novoTab[vazioIdx]] = [novoTab[vazioIdx], novoTab[idx]];
      setTabuleiroFinal(novoTab);
    }
  };

  const embaralharInicial = () => {
  const passos = 100;
  let novoTab = [...tabuleiroInicial];
  let vazioIdx = novoTab.indexOf(0);
  for (let i = 0; i < passos; i++) {
    const adj = posicoesAdjacentes(vazioIdx);
    const rand = adj[Math.floor(Math.random() * adj.length)];
    [novoTab[vazioIdx], novoTab[rand]] = [novoTab[rand], novoTab[vazioIdx]];
    vazioIdx = rand;
  }
  setTabuleiroInicial(novoTab);
};

  const embaralharFinal = () => {
    const passos = 100;
    let novoTab = [...tabuleiroFinal];
    let vazioIdx = novoTab.indexOf(0);
    for (let i = 0; i < passos; i++) {
      const adj = posicoesAdjacentes(vazioIdx);
      const rand = adj[Math.floor(Math.random() * adj.length)];
      [novoTab[vazioIdx], novoTab[rand]] = [novoTab[rand], novoTab[vazioIdx]];
      vazioIdx = rand;
    }
    setTabuleiroFinal(novoTab);
  };

  // Retorna um objeto com a distância de Manhattan de cada peça
  const calcularManhattan = () => {
    const distancias = {};
    for (let i = 0; i < tabuleiroInicial.length; i++) {
      const valor = tabuleiroInicial[i];
      if (valor != 0) { // ignora o espaço vazio
        const idxAtual = i;
        const idxObjetivo = tabuleiroFinal.indexOf(valor);

        const linhaAtual = Math.floor(idxAtual / tamTabu);
        const colAtual = idxAtual % tamTabu;

        const linhaObjetivo = Math.floor(idxObjetivo / tamTabu);
        const colObjetivo = idxObjetivo % tamTabu;

        distancias[valor] = Math.abs(linhaAtual - linhaObjetivo) + Math.abs(colAtual - colObjetivo);
      }
    }
    console.log(distancias);
    setHeuristicas(distancias);
    return distancias;
  }; 

  const ordenarFila = (fila, adj, tabAtual, heuristicasAtual) => {
  for (let i = 0; i < adj.length; i++) {
    const peca = tabAtual[adj[i]];
    const heur = heuristicasAtual[peca];
    let pos = 0;
    // encontrar a posição certa para inserir
    while (pos < fila.length && heuristicasAtual[fila[pos]] <= heur) {
      pos++;
    }
    fila.splice(pos, 0, peca); // insere na posição correta
  }
};

const calcularHeuristicasAtual = (tabAtual) => {
  const distancias = {};
  for (let i = 0; i < tabAtual.length; i++) {
    const valor = tabAtual[i];
    if (valor !== 0) {
      const idxAtual = i;
      const idxObjetivo = tabuleiroFinal.indexOf(valor);
      const linhaAtual = Math.floor(idxAtual / tamTabu);
      const colAtual = idxAtual % tamTabu;
      const linhaObjetivo = Math.floor(idxObjetivo / tamTabu);
      const colObjetivo = idxObjetivo % tamTabu;
      distancias[valor] = Math.abs(linhaAtual - linhaObjetivo) + Math.abs(colAtual - colObjetivo);
    }
  }
  return distancias;
};

  const arraysIguais = (a, b) => a.every((v, i) => v === b[i]);

  const aEstrelinha = async () => {
  const divSolucoes = document.getElementById("divSolucoesStar");
  let ultimaMovida = null;
  const novoTab = [...tabuleiroInicial];
  let g = 0; // custo acumulado

  while (!arraysIguais(novoTab, tabuleiroFinal)) {
    const idxVazio = novoTab.indexOf(0);
    const adj = posicoesAdjacentes(idxVazio);

    // filtrar para não voltar a última peça movida
    const adjFiltrados = adj.filter(idx => novoTab[idx] !== ultimaMovida);

    // calcular f = g + h para cada adjacente
    const fila = adjFiltrados
      .map(idx => {
        const peca = novoTab[idx];
        const h = heuristicas[peca] || 0;
        return { peca, idx, f: g + h };
      })
      .sort((a, b) => a.f - b.f); 

    const { peca, idx } = fila[0]; 
    ultimaMovida = peca;

    [novoTab[idxVazio], novoTab[idx]] = [novoTab[idx], novoTab[idxVazio]];

    g++;

    setTabuleiroInicial([...novoTab]);

    // mostrar no painel
    const p = document.createElement("p");
    p.innerHTML = `Peça ${peca} movida. (g=${g}, h=${heuristicas[peca]})`;
    divSolucoes.appendChild(p);

    await new Promise(resolve => setTimeout(resolve, 500));
  }
};


//TO ACHANDO QUE VOU TER QUE SOMAR AS HEURISTICAS
  const bestFirst = async () => {
  const divSolucoes = document.getElementById("divSolucoes");
  let ultimaMovida = null;
  let fila = [];
  const novoTab = [...tabuleiroInicial]; // usar um tabuleiro local para controle

  while (!arraysIguais(novoTab, tabuleiroFinal)) {
    const idxVazio = novoTab.indexOf(0);
    const adj = posicoesAdjacentes(idxVazio);
    const adjFiltrados = adj.filter(idx => novoTab[idx] !== ultimaMovida);
    const heuristicasAtual = calcularHeuristicasAtual(novoTab);

    let fila = [];
    ordenarFila(fila, adjFiltrados, novoTab, heuristicasAtual);

    const pecaEscolhida = fila[0];
    ultimaMovida = pecaEscolhida;

    const idxPeca = adj.find(i => novoTab[i] === pecaEscolhida);
    if (idxPeca === undefined) break; // segurança

    [novoTab[idxVazio], novoTab[idxPeca]] = [novoTab[idxPeca], novoTab[idxVazio]];

    setTabuleiroInicial([...novoTab]);

    // mostrar no painel
    const p = document.createElement("p");
    p.innerHTML = `Peça ${pecaEscolhida} movida.`;
    divSolucoes.appendChild(p);

    await new Promise(resolve => setTimeout(resolve, 500));
  }
};



  //o custo é basicamente o acumulo de movimentações pro espaço vazio. nesse caso, geralmente de 1 em 1

  const realizarSolucaoA = async() =>{
    setTabuleiroInicial(tabIni);
    calcularManhattan();
    aEstrelinha();
  };

  const realizarSolucaoB = async() =>{
    setTabuleiroInicial(tabIni);
    calcularManhattan();
    bestFirst();
  };

  const resetInicial = () => setTabuleiroInicial([1,2,3,4,5,6,7,8,0]);
  const resetFinal = () => setTabuleiroFinal([1,2,3,4,5,6,7,8,0]);

  return (
    <div>
      <h1>8Puzzle</h1>
      <div style={styles.tabuleiros}>
          <div style={styles.painel}>
          <h3>Tabuleiro do Puzzle Inicial</h3>
          <div style={styles.tabuleiro}>
            {tabuleiroInicial.map((v,i) => (
              <div
                  key={i}
                  style={{...styles.peca, ...(v===0?styles.vazio:{} )}}
              >
                  {v===0 ? '' : v}
              </div>
              ))}
          </div>
          <div style={styles.botoes}>
              <button onClick={embaralharInicial}>🔀 Embaralhar</button>
              <button onClick={resetInicial}>♻️ Reset</button>
          </div>
          </div>

          <div style={styles.painel}>
          <h3>Tabuleiro do Puzzle Final</h3>
          <div style={styles.tabuleiro}>
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
                <button onClick={embaralharFinal}>🔀 Embaralhar</button>
                <button onClick={resetFinal}>♻️ Reset</button>
            </div>
          </div>
      </div>

      <div style = {styles.painel}>
          <button onClick={realizarSolucaoB}>Best First</button>
          <button onClick={realizarSolucaoA}>A*</button>
          <p>Heuristicas calculadas: </p>
          <ul>
            {Object.entries(heuristicas).map(([peca, heur]) => (
              <li key={peca}>Peça {peca}: {heur}</li>
            ))}
          </ul>
      </div>
      <div style = {styles.tabuleiros}>
        <div id="divSolucoes" style = {styles.painel}>
            <p>Solução Best First: </p>
            
        </div>
        <div id="divSolucoesStar" style = {styles.painel}>
            <p>Solução A*: </p>
            
        </div>
      </div>
    </div>
  );
}

export default Puzzle;
