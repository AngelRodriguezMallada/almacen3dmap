import React, { forwardRef } from 'react';
import { Edges, Text, Billboard } from '@react-three/drei';
import { rackLabel } from '../warehouse';

const RackMesh = forwardRef(function RackMesh(
  { rack, selectedRackId, selectedCode, dimmed, onSelectCell },
  ref
) {
  const { posX, posY, posZ, rotationY, width, height, depth, huecos, alturas, cells, rackId, totalCantidad, lineas, zonaType } = rack;

  const ACCENT = { rack: '#4a5568', kardex: '#3182ce', playa: '#dd6b20' };
  const accent = ACCENT[zonaType] || ACCENT.rack;

  const selectedRack = rackId === selectedRackId;
  const cellW = width / huecos.length;
  const cellH = height / alturas.length;

  const badgeText = `${totalCantidad} uds · ${lineas} ref`;
  const badgeWidth = Math.max(1.7, badgeText.length * 0.19);

  return (
    <group
      ref={ref}
      position={[posX, posY, posZ]}
      rotation={[0, rotationY || 0, 0]}
    >
      {/* Marco del rack (color segun tipo de zona) */}
      <mesh>
        <boxGeometry args={[width + 0.08, height + 0.08, depth + 0.08]} />
        <meshStandardMaterial color="#0e1116" transparent opacity={dimmed ? 0.08 : 0.18} />
        <Edges color={selectedRack ? '#ffffff' : accent} />
      </mesh>

      {/* Celdas: cada hueco x altura */}
      {cells.map((c) => {
        const hasStock = (c.totalCantidad || 0) > 0;
        const isSel = c.code === selectedCode;
        const color = isSel ? '#ffcc00' : hasStock ? '#2f855a' : '#2a3340';
        const x = -width / 2 + cellW * (c.huecoIndex + 0.5);
        const y = -height / 2 + cellH * (c.alturaIndex + 0.5);
        return (
          <mesh
            key={c.code}
            position={[x, y, 0]}
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelectCell(c);
            }}
          >
            <boxGeometry args={[cellW * 0.88, cellH * 0.82, depth * 0.9]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={dimmed ? 0.3 : hasStock || isSel ? 0.92 : 0.5}
            />
            {isSel && <Edges color="#ffffff" />}
          </mesh>
        );
      })}

      {/* Etiqueta del rack */}
      <Text
        position={[0, height / 2 + 0.28, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="bottom"
      >
        {rackLabel(rack)}
      </Text>

      {/* Badge con la cantidad total del rack */}
      {totalCantidad > 0 && (
        <Billboard position={[0, height / 2 + 0.95, 0]}>
          <mesh>
            <planeGeometry args={[badgeWidth, 0.6]} />
            <meshBasicMaterial color={selectedRack ? '#b7791f' : '#12351f'} transparent opacity={0.9} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.28} color="#eafff1" anchorX="center" anchorY="middle">
            {badgeText}
          </Text>
        </Billboard>
      )}
    </group>
  );
});

export default RackMesh;
