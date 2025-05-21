import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, type }) => {
  const getSvgPath = () => {
    switch (type) {
      case 'powerSource':
        return '/resources/power-source.svg';
      case 'transformer':
        return '/resources/transformer.svg';
      case 'load':
        return '/resources/load.svg';
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 10, background: 'white', borderRadius: 5 }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={getSvgPath()} alt={data.label} width="40" height="40" />
        <div style={{ marginTop: 5, fontSize: 12 }}>{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const PowerSourceNode = memo((props) => <CustomNode {...props} type="powerSource" />);
export const TransformerNode = memo((props) => <CustomNode {...props} type="transformer" />);
export const LoadNode = memo((props) => <CustomNode {...props} type="load" />); 