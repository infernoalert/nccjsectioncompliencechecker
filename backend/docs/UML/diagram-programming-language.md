# Diagram Programming Language Commands

## Basic Commands

### Node Management
- `add <node-type> <x> <y>` - Add a new node of specified type at coordinates (x,y)
  - Example: `add,smart-meter,4,-8`
  - **Accepted node types:**
    - smart-meter
    - general-meter
    - auth-meter
    - memory-meter
    - transformer
    - load
    - cloud
    - wireless
    - rs485
    - ethernet
    - onpremise
    -
  - Only these node types are accepted for the `add` command. Any other value will result in an error.

- `delete <node-id>` - Delete a node by its ID
  - Example: `delete,node1`

- `move <node-id> <x> <y>` - Move a node to new coordinates
  - Example: `move,node1,5,6`

### Connection Management
- `connect <source-node> <target-node> [connection-type]` - Create a connection between nodes
  - Example: `connect,node1,node2,wireless`

- `disconnect <source-node> <target-node>` - Remove a connection between nodes
  - Example: `disconnect,node1,node2`

### Node Properties
- `set-property <node-id> <property> <value>` - Set a property for a node
  - Example: `set-property,node1,label,Main Meter`

- `get-property <node-id> <property>` - Get a property value for a node
  - Example: `get-property,node1,label`

### Layout
- `layout <layout-type>` - Apply a layout algorithm
  - Example: `layout,grid`
  - Available layout types:
    - grid
    - hierarchical
    - force-directed
    - circular

### Group Management
- `group <group-name> <node-id1> <node-id2> ...` - Create a group of nodes
  - Example: `group,substation,meter1,meter2,meter3`

- `ungroup <group-name>` - Remove a group
  - Example: `ungroup,substation`

### View Operations
- `zoom <level>` - Set zoom level
  - Example: `zoom,1.5`

- `pan <x> <y>` - Pan the view
  - Example: `pan,100,100`

- `fit` - Fit all nodes in view
  - Example: `fit`

### Export/Import
- `export <format> <filename>` - Export diagram to file
  - Example: `export,png,diagram.png`
  - Available formats:
    - png
    - svg
    - json

- `import <filename>` - Import diagram from file
  - Example: `import,diagram.json`

### Style Management
- `style <node-id> <style-property> <value>` - Set style for a node
  - Example: `style,node1,color,red`

- `style-group <group-name> <style-property> <value>` - Set style for a group
  - Example: `style-group,substation,color,blue`

### Validation
- `validate` - Validate the diagram structure
  - Example: `validate`

- `check-connections` - Check for broken or invalid connections
  - Example: `check-connections`

## Command Syntax Rules

1. Commands are case-insensitive
2. Parameters are separated by commas
3. Coordinates use x,y format
4. Node IDs must be unique
5. Property names are case-sensitive
6. Values can be strings, numbers, or booleans

## Examples

### Creating a Simple Meter Network
```
add,smart-meter,0,0
add,transformer,4,0
add,load,8,0
connect,smart-meter,transformer,wireless
connect,transformer,load,ethernet
style,smart-meter,color,green
group,network,smart-meter,transformer,load
```

### Creating a Hierarchical Structure
```
add,cloud,0,0
add,smart-meter,4,4
add,smart-meter,4,-4
add,load,8,4
add,load,8,-4
connect,cloud,smart-meter,wireless
connect,smart-meter,load,ethernet
layout,hierarchical
```

## Error Messages

Common error messages and their meanings:

1. `Invalid node type: <type>` - The specified node type is not supported
2. `Node not found: <id>` - The referenced node does not exist
3. `Invalid coordinates: <x>,<y>` - The coordinates are out of bounds
4. `Connection already exists` - Attempting to create a duplicate connection
5. `Invalid property: <property>` - The specified property is not valid for the node type
6. `Group not found: <name>` - The referenced group does not exist
7. `Invalid layout type: <type>` - The specified layout type is not supported 