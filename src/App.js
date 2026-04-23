import React, { useState, useRef } from 'react';
 
// Las 16 piezas correctas van en posiciones 0..15 (img1 en celda 0, img2 en celda 1, etc.)
const TOTAL_PIECES = 16;
const CORRECT_POSITION = Array.from({ length: TOTAL_PIECES }, (_, i) => i + 1); // [1,2,...,16]
 
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
 
export default function PuzzleGame() {
  // grid: array de 16 posiciones, cada una contiene null o el número de pieza (1-16)
  const [grid, setGrid] = useState(Array(TOTAL_PIECES).fill(null));
  // tray: piezas fuera del tablero, barajeadas al inicio
  const [tray, setTray] = useState(() => shuffle(CORRECT_POSITION));
 
  const dragging = useRef(null); // { piece, from: 'tray'|'grid', index }
 
  // Cuántas piezas están en su posición correcta
  const correctCount = grid.filter((piece, i) => piece === i + 1).length;
  const isComplete = correctCount === TOTAL_PIECES;
 
  // ── Handlers drag ──────────────────────────────────────────────
  function handleDragStart(piece, from, index) {
    dragging.current = { piece, from, index };
  }
 
  function handleDropOnCell(cellIndex) {
    if (!dragging.current) return;
    const { piece, from, index } = dragging.current;
 
    const newGrid = [...grid];
    const newTray = [...tray];
 
    const occupant = newGrid[cellIndex]; // pieza que ya está en la celda destino
 
    if (from === 'tray') {
      // Sacar del tray
      newTray.splice(index, 1);
      // Si la celda destino tenía pieza, devolverla al tray
      if (occupant !== null) newTray.push(occupant);
    } else {
      // Viene de otra celda del grid
      if (occupant !== null) {
        // Intercambiar
        newGrid[index] = occupant;
      } else {
        newGrid[index] = null;
      }
    }
 
    newGrid[cellIndex] = piece;
    setGrid(newGrid);
    setTray(newTray);
    dragging.current = null;
  }
 
  function handleDropOnTray() {
    if (!dragging.current) return;
    const { piece, from, index } = dragging.current;
 
    if (from === 'grid') {
      const newGrid = [...grid];
      const newTray = [...tray];
      newGrid[index] = null;
      newTray.push(piece);
      setGrid(newGrid);
      setTray(newTray);
    }
    dragging.current = null;
  }
 
  function handleDragOver(e) {
    e.preventDefault();
  }
 
  function resetGame() {
    setGrid(Array(TOTAL_PIECES).fill(null));
    setTray(shuffle(CORRECT_POSITION));
  }
 
  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Rompecabezas 4×4</h1>
 
      {/* Fila principal: tablero + bandeja */}
      <div style={styles.mainRow}>
 
        {/* Columna izquierda: tablero + progreso */}
        <div style={styles.leftCol}>
          <div style={styles.gridWrapper}>
            <div style={styles.grid}>
              {grid.map((piece, i) => {
                const isCorrect = piece !== null && piece === i + 1;
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.cell,
                      border: isCorrect ? '3px solid #4ade80' : '2px dashed #94a3b8',
                      background: piece ? 'transparent' : 'rgba(148,163,184,0.08)',
                    }}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnCell(i)}
                  >
                    {!piece && (
                      <span style={styles.cellLabel}>{i + 1}</span>
                    )}
                    {piece && (
                      <img
                        src={`/images/img${piece}.jpg`}
                        alt={`Pieza ${piece}`}
                        draggable
                        onDragStart={() => handleDragStart(piece, 'grid', i)}
                        style={{
                          ...styles.pieceImg,
                          outline: isCorrect ? '3px solid #4ade80' : 'none',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* Indicador de progreso debajo del tablero */}
          <div style={styles.progressBar}>
            <div style={styles.progressFill(correctCount)} />
          </div>
          <p style={styles.counter}>
            {isComplete
              ? '¡Rompecabezas completado!'
              : `${correctCount} de ${TOTAL_PIECES} piezas correctas`}
          </p>
 
          <button style={styles.resetBtn} onClick={resetGame}>
            Reiniciar
          </button>
        </div>
 
        {/* Columna derecha: bandeja vertical */}
        <div
          style={styles.tray}
          onDragOver={handleDragOver}
          onDrop={handleDropOnTray}
        >
          <p style={styles.trayLabel}>Piezas disponibles</p>
          <div style={styles.trayPieces}>
            {tray.map((piece, i) => (
              <img
                key={piece}
                src={`/images/img${piece}.jpg`}
                alt={`Pieza ${piece}`}
                draggable
                onDragStart={() => handleDragStart(piece, 'tray', i)}
                style={styles.trayImg}
              />
            ))}
            {tray.length === 0 && (
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Sin piezas</span>
            )}
          </div>
        </div>
 
      </div>
    </div>
  );
}
 
// ── Estilos ──────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px',
    fontFamily: 'Georgia, serif',
    color: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 24,
    letterSpacing: 1,
  },
  mainRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 28,
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  gridWrapper: {
    background: '#1e293b',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 120px)',
    gridTemplateRows: 'repeat(4, 120px)',
    gap: 6,
  },
  cell: {
    width: 120,
    height: 120,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'border-color 0.2s',
    overflow: 'hidden',
  },
  cellLabel: {
    color: '#334155',
    fontSize: 18,
    fontWeight: 700,
    userSelect: 'none',
  },
  pieceImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'grab',
    borderRadius: 4,
    display: 'block',
  },
  progressBar: {
    width: 516,
    height: 10,
    background: '#1e293b',
    borderRadius: 99,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: (correct) => ({
    height: '100%',
    width: `${(correct / TOTAL_PIECES) * 100}%`,
    background: correct === TOTAL_PIECES ? '#4ade80' : '#38bdf8',
    borderRadius: 99,
    transition: 'width 0.4s ease',
  }),
  counter: {
    marginTop: 8,
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 16,
  },
  tray: {
    background: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: 350,
    minHeight: 400,
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  trayLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 0,
  },
  trayPieces: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignContent: 'flex-start',
  },
  trayImg: {
    width: 76,
    height: 76,
    objectFit: 'cover',
    borderRadius: 6,
    cursor: 'grab',
    border: '2px solid #334155',
    transition: 'transform 0.15s, border-color 0.15s',
  },
  resetBtn: {
    marginTop: 8,
    padding: '10px 28px',
    background: 'transparent',
    border: '1.5px solid #38bdf8',
    color: '#38bdf8',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    letterSpacing: 1,
  },
};
 