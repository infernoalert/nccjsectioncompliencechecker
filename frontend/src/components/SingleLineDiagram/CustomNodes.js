import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, TextField } from '@mui/material';

const CustomNode = ({ data, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const getSvgPath = () => {
    switch (type) {      
      case 'transformer':
        return '/resources/transformer.svg';
      case 'load':
        return '/resources/load.svg';
      case 'meter':
        return '/resources/meter.svg';
      case 'meterMemory':
        return '/resources/meter-memory.svg';
      case 'smartMeter':
        return '/resources/smart-meter.svg';
      case 'authorityMeter':
        return '/resources/authority-meter.svg';
      case 'cloud':
        return '/resources/cloud.svg';
      case 'onPremise':
        return '/resources/on-premise.svg';
      case 'wireless':
        return '/resources/wireless.svg';
      case 'rs485':
        return '/resources/rs485.svg';
      case 'ethernet':
        return '/resources/ethernet.svg';
      default:
        return null;
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.label = label;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setIsEditing(false);
      data.label = label;
    }
  };

  const handleStyle = {
    width: 16,
    height: 16,
    background: data.showHandles ? '#555' : 'transparent',
    border: data.showHandles ? '2px solid #333' : 'none',
    borderRadius: '50%',
    cursor: 'crosshair',
    zIndex: 1000,
  };

  return (
    <div style={{ padding: 10, background: 'white', borderRadius: 5, position: 'relative' }}>
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={handleStyle}
        isConnectable={true}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={getSvgPath()} alt={data.label} width="40" height="40" />
        <div style={{ marginTop: 5, minWidth: '80px', textAlign: 'center' }}>
          {isEditing ? (
            <TextField
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              size="small"
              autoFocus
              variant="standard"
              sx={{
                '& .MuiInputBase-input': {
                  padding: '2px 4px',
                  fontSize: '12px',
                  textAlign: 'center',
                },
              }}
            />
          ) : (
            <div 
              onDoubleClick={handleDoubleClick}
              style={{ 
                fontSize: 12,
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '2px',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                }
              }}
            >
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TextNode = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.text = text;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      setIsEditing(false);
      data.text = text;
    }
  };

  const handleStyle = {
    width: 16,
    height: 16,
    background: data.showHandles ? '#555' : 'transparent',
    border: data.showHandles ? '2px solid #333' : 'none',
    borderRadius: '50%',
    cursor: 'crosshair',
    zIndex: 1000,
    opacity: data.showHandles ? 1 : 0.5,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#777',
      transform: 'scale(1.2)',
    }
  };

  return (
    <div style={{ padding: 10, background: 'white', borderRadius: 5, minWidth: '150px', position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={handleStyle}
        isConnectable={true}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isEditing ? (
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            multiline
            rows={3}
            size="small"
            autoFocus
            variant="outlined"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '12px',
              },
              width: '100%',
            }}
          />
        ) : (
          <div 
            onDoubleClick={handleDoubleClick}
            style={{ 
              fontSize: 12,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              width: '100%',
              minHeight: '60px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              }
            }}
          >
            {text || 'Double click to add text'}
          </div>
        )}
      </div>
    </div>
  );
};

export const LabelNode = memo(({ data }) => (
  <div style={{
    padding: '10px',
    background: '#f8f8f8',
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
    border: '1px solid #ccc',
    width: '100px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    position: 'relative',
    wordWrap: 'break-word',
    overflow: 'hidden'
  }}>
    <Handle
      type="source"
      position={Position.Top}
      id="top"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="target"
      position={Position.Top}
      id="top"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="target"
      position={Position.Right}
      id="right"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="bottom"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="target"
      position={Position.Bottom}
      id="bottom"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="source"
      position={Position.Left}
      id="left"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      style={{
        width: 16,
        height: 16,
        background: 'transparent',
        border: 'none',
        borderRadius: '50%',
        cursor: 'crosshair',
        zIndex: 1000
      }}
      isConnectable={true}
    />
    {data.label}
  </div>
));

// Export memoized versions of CustomNode for each type
export const TransformerNode = memo((props) => <CustomNode {...props} type="transformer" />);
export const LoadNode = memo((props) => <CustomNode {...props} type="load" />);
export const MeterNode = memo((props) => <CustomNode {...props} type="meter" />);
export const MeterMemoryNode = memo((props) => <CustomNode {...props} type="meterMemory" />);
export const SmartMeterNode = memo((props) => <CustomNode {...props} type="smartMeter" />);
export const AuthorityMeterNode = memo((props) => <CustomNode {...props} type="authorityMeter" />);
export const CloudNode = memo((props) => <CustomNode {...props} type="cloud" />);
export const OnPremiseNode = memo((props) => <CustomNode {...props} type="onPremise" />);
export const WirelessNode = memo((props) => <CustomNode {...props} type="wireless" />);
export const RS485Node = memo((props) => <CustomNode {...props} type="rs485" />);
export const EthernetNode = memo((props) => <CustomNode {...props} type="ethernet" />);
export const TextNodeComponent = memo(TextNode); 