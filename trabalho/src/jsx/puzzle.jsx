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
  const [tabuleiroInicialA, setTabuleiroInicialA] = useState([...tabuleiroInicial]);
  const [mostrarTabA, setMostrarTabA] = useState(false);
  let qtdePassosA = 0;
  let qtdePassosB = 0;

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
  setTabuleiroInicialA([...novoTab]);
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

  const calcularHeuristicaAtual = (tabAtual) => {
    let soma=0;
    for (let i = 0; i < tabAtual.length; i++) {
      const valor = tabAtual[i];
      if (valor !== 0) {
        const idxAtual = i;
        const idxObjetivo = tabuleiroFinal.indexOf(valor);
        const linhaAtual = Math.floor(idxAtual / tamTabu);
        const colAtual = idxAtual % tamTabu;
        const linhaObjetivo = Math.floor(idxObjetivo / tamTabu);
        const colObjetivo = idxObjetivo % tamTabu;
        soma+= Math.abs(linhaAtual - linhaObjetivo) + Math.abs(colAtual - colObjetivo);
      }
    }
    return soma;
  };

  const aEstrelinha = async () => {
     console.log("comecaou 2");
    const divSolucoes = document.getElementById("divSolucoesStar");
    divSolucoes.innerHTML="";
    const p = document.createElement("p");
    p.innerHTML = "Solução A*:";
    divSolucoes.appendChild(p);
    const novoTab = [...tabuleiroInicialA];
    const objetivo = tabuleiroFinal.join(",");
    const visitados = new Set();
    const fila = []; // fronteira (lista de estados)
    let somaH;
    let g = 0; // custo acumulado

    somaH = calcularHeuristicaAtual(novoTab);
      // adiciona o estado inicial na fila
    const estadoInicial = {
      tab: novoTab,
      str: novoTab.join(","),
      h: calcularHeuristicaAtual(novoTab),
      g: 0,
      total: 0+calcularHeuristicaAtual(novoTab),
      pai: null
    };
    fila.push(estadoInicial);

    let encontrado = false;
    let estadoObjetivo = null;

    while (fila.length > 0 && !encontrado) {

      // ordena a fila pelo valor da heurística (menor primeiro)
      for (let i = 0; i < fila.length - 1; i++) {
        for (let j = i + 1; j < fila.length; j++) {
          if (fila[j].total < fila[i].total) {
            const aux = fila[i];
            fila[i] = fila[j];
            fila[j] = aux;
          }
        }
      }

      const atual = fila[0]; // menor heurística
      fila.splice(0, 1); // remove o primeiro

      if (!visitados.has(atual.str)) {
        visitados.add(atual.str);

        // se chegou ao estado objetivo
        if (atual.str === objetivo) {
          encontrado = true;
          estadoObjetivo = atual;
        } 
        else {
          const idxVazio = atual.tab.indexOf(0);
          const adj = posicoesAdjacentes(idxVazio);

          // gera os estados filhos manualmente
          for (let i = 0; i < adj.length; i++) {
            const idx = adj[i];
            const novoTab = [...atual.tab];
            const temp = novoTab[idxVazio];
            novoTab[idxVazio] = novoTab[idx];
            novoTab[idx] = temp;

            const strNovo = novoTab.join(",");
            if (!visitados.has(strNovo)) {
              const filho = {
                tab: novoTab,
                str: strNovo,
                h: calcularHeuristicaAtual(novoTab),
                g: atual.g + 1,
                total: calcularHeuristicaAtual(novoTab)+atual.g+1,
                pai: atual
              };
              fila.push(filho);
            }
          }
        }
      }
    }

    qtdePassosA = visitados.size;

      // se não achou nenhuma solução
    if (!encontrado) {
      const p = document.createElement("p");
      p.innerHTML = "Nenhuma solução encontrada pelo Best-First.";
      divSolucoes.appendChild(p);
    } 
    else {
      // reconstrói o caminho até o estado inicial
      const caminho = [];
      let atual = estadoObjetivo;
      while (atual !== null) {
        caminho.push(atual.tab);
        atual = atual.pai;
      }
      caminho.reverse();
      const tamanhoCaminho = caminho.length - 1;

      // anima passo a passo
      for (let i = 1; i < caminho.length; i++) {
        const anterior = caminho[i - 1];
        const atual = caminho[i];
        const idxAntVazio = anterior.indexOf(0);
        const pecaMovida = atual[idxAntVazio];

        setTabuleiroInicialA([...atual]);

        const p = document.createElement("p");
        p.innerHTML = `Peça ${pecaMovida} movida.`;
        divSolucoes.appendChild(p);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const divAvaliacoes = document.getElementById("avaliacoes");
      const p = document.createElement("p");
      p.innerHTML = `Qtde nós visitados: ${qtdePassosB}`;
      divAvaliacoes.appendChild(p);
      const pp = document.createElement("p");
      pp.innerHTML = `Tamanho do caminho: ${tamanhoCaminho}`;
      divAvaliacoes.appendChild(pp);
    }
  };

const bestFirst = async () => {
  console.log("comecaou");
  const divSolucoes = document.getElementById("divSolucoes");
  divSolucoes.innerHTML="";
  const p = document.createElement("p");
  p.innerHTML = "Solução Best First:";
  divSolucoes.appendChild(p);
  const inicio = [...tabuleiroInicial];
  const objetivo = tabuleiroFinal.join(",");
  const visitados = new Set();
  const fila = []; // fronteira (lista de estados)
  let soma;

  soma = calcularHeuristicaAtual(inicio);

  // adiciona o estado inicial na fila
  const estadoInicial = {
    tab: inicio,
    str: inicio.join(","),
    h: calcularHeuristicaAtual(inicio),
    pai: null
  };
  fila.push(estadoInicial);

  let encontrado = false;
  let estadoObjetivo = null;

  while (fila.length > 0 && !encontrado) {
    // ordena a fila pelo valor da heurística (menor primeiro)
    for (let i = 0; i < fila.length - 1; i++) {
      for (let j = i + 1; j < fila.length; j++) {
        if (fila[j].h < fila[i].h) {
          const aux = fila[i];
          fila[i] = fila[j];
          fila[j] = aux;
        }
      }
    }

    const atual = fila[0]; // menor heurística
    fila.splice(0, 1); // remove o primeiro

    if (!visitados.has(atual.str)) {
      visitados.add(atual.str);

      // se chegou ao estado objetivo
      if (atual.str === objetivo) {
        encontrado = true;
        estadoObjetivo = atual;
      } else {
        const idxVazio = atual.tab.indexOf(0);
        const adj = posicoesAdjacentes(idxVazio);

        // gera os estados filhos manualmente
        for (let i = 0; i < adj.length; i++) {
          const idx = adj[i];
          const novoTab = [...atual.tab];
          const temp = novoTab[idxVazio];
          novoTab[idxVazio] = novoTab[idx];
          novoTab[idx] = temp;

          const strNovo = novoTab.join(",");
          if (!visitados.has(strNovo)) {
            const filho = {
              tab: novoTab,
              str: strNovo,
              h: calcularHeuristicaAtual(novoTab),
              pai: atual
            };
            fila.push(filho);
          }
        }
      }
    }
  }

  qtdePassosB = visitados.size;

  // se não achou nenhuma solução
  if (!encontrado) {
    const p = document.createElement("p");
    p.innerHTML = "Nenhuma solução encontrada pelo Best-First.";
    divSolucoes.appendChild(p);
  } else {
    // reconstrói o caminho até o estado inicial
    const caminho = [];
    let atual = estadoObjetivo;
    while (atual !== null) {
      caminho.push(atual.tab);
      atual = atual.pai;
    }
    caminho.reverse();
    const tamanhoCaminho = caminho.length - 1;

    // anima passo a passo
    for (let i = 1; i < caminho.length; i++) {
      const anterior = caminho[i - 1];
      const atual = caminho[i];
      const idxAntVazio = anterior.indexOf(0);
      const pecaMovida = atual[idxAntVazio];

      setTabuleiroInicial([...atual]);

      const p = document.createElement("p");
      p.innerHTML = `Peça ${pecaMovida} movida.`;
      divSolucoes.appendChild(p);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const divAvaliacoes = document.getElementById("avaliacoes");
    let p = document.createElement("p");
    p.innerHTML = `Qtde nós visitados: ${qtdePassosB}`;
    divAvaliacoes.appendChild(p);
    const pp = document.createElement("p");
    pp.innerHTML = `Tamanho do caminho: ${tamanhoCaminho}`;
    divAvaliacoes.appendChild(pp);
  }
};

  //o custo é basicamente o acumulo de movimentações pro espaço vazio. nesse caso, geralmente de 1 em 1

  const realizarSolucao = async () => {
    const divAvaliacoes = document.getElementById("avaliacoes");
    divAvaliacoes.innerHTML="";
  qtdePassosA = 0;
  qtdePassosB = 0;

  //setTabuleiroInicialA([...tabuleiroInicial]); // atualiza para a busca
  setMostrarTabA(true); // mostra o tabuleiro A*

  const texto3 = document.createElement("p");
  texto3.innerHTML="Avaliacoes";
  divAvaliacoes.appendChild(texto3);

  const texto = document.createElement("p");
  texto.innerHTML="Best First";
  divAvaliacoes.appendChild(texto);
  let tInicio = performance.now();
  await bestFirst();
  let tFim = performance.now();
  let tempoGasto = (tFim - tInicio)/1000; // em milissegundos
  const p = document.createElement("p");
  p.innerHTML = `Tempo gasto: ${tempoGasto} s`;
  divAvaliacoes.appendChild(p);

  const texto2 = document.createElement("p");
  texto2.innerHTML="A*";
  divAvaliacoes.appendChild(texto2);
  tInicio = performance.now();
  await aEstrelinha();
  tFim = performance.now();
  tempoGasto = (tFim - tInicio)/1000;
  const pp = document.createElement("p");
  pp.innerHTML = `Tempo gasto: ${tempoGasto} s`;
  divAvaliacoes.appendChild(pp);
};

  const resetInicial = () => setTabuleiroInicial([1,2,3,4,5,6,7,8,0]);
  const resetFinal = () => setTabuleiroFinal([1,2,3,4,5,6,7,8,0]);

  return (
    <div>
      <h1>8Puzzle</h1>
      <div id="tabuleiros" style={styles.tabuleiros}>
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
            {mostrarTabA && (
              <div style={styles.painel}>
                <h3>Tabuleiro inicial A*</h3>
                <div style={styles.tabuleiro}>
                  {tabuleiroInicialA.map((v, i) => (
                    <div key={i} style={{ ...styles.peca, ...(v === 0 ? styles.vazio : {}) }}>
                      {v === 0 ? "" : v}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
          <button onClick={realizarSolucao}>Realizar Busca</button>
      </div>
      <div style = {styles.tabuleiros}>
        <div id="divSolucoes" style = {styles.painel}>
            <p>Solução Best First: </p>
            
        </div>
        <div id="divSolucoesStar" style = {styles.painel}>
            <p>Solução A*: </p>
            
        </div>

        <div id="avaliacoes">
              
        </div>
      </div>
    </div>
  );
}

export default Puzzle;
