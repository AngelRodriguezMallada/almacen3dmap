import React, { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';
import RackMesh from './RackMesh';

export default function Scene3D({ racks, meta, selectedRackId, selectedCode, dimmedRackIds, litCells, onSelectCell, onSelectRack, onDeselect, onMoveRack, editMode }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const selectedRef = useCallback((node) => {
    if (node) setSelectedNode(node);
  }, []);

  useEffect(() => {
    setSelectedNode(null);
  }, [selectedRackId]);

  const cx = meta?.cx || 0;
  const cz = meta?.cz || 0;

  return (
    <Canvas shadows camera={{ position: [cx + 26, 30, cz + 34], fov: 50 }}>
      <color attach="background" args={['#12151a']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[30, 40, 20]} intensity={0.9} castShadow />

      <Grid
        position={[cx, 0, cz]}
        args={[meta?.width || 60, meta?.depth || 40]}
        cellColor="#2a2f3a"
        sectionColor="#3a4150"
        fadeDistance={200}
        infiniteGrid={false}
      />

      <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={onDeselect}>
        <planeGeometry args={[meta?.width || 60, meta?.depth || 40]} />
        <meshStandardMaterial color="#1a1e25" />
      </mesh>

      {racks.map((rack) => (
        <RackMesh
          key={rack.rackId}
          ref={rack.rackId === selectedRackId ? selectedRef : undefined}
          rack={rack}
          selectedRackId={selectedRackId}
          selectedCode={selectedCode}
          litCells={litCells}
          dimmed={dimmedRackIds ? !dimmedRackIds.has(rack.rackId) : false}
          onSelectCell={onSelectCell}
        />
      ))}

      {editMode && selectedRackId && selectedNode && (
        <TransformControls
          object={selectedNode}
          mode="translate"
          showY={false}
          onMouseUp={() => {
            if (!selectedNode) return;
            const { x, z } = selectedNode.position;
            onMoveRack(selectedRackId, { posX: x, posZ: z });
          }}
        />
      )}

      <OrbitControls makeDefault target={[cx, 0, cz]} minDistance={5} maxDistance={260} />
    </Canvas>
  );
}
