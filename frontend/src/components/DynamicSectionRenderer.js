import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    ListItemText,
    Paper,
    Divider,
    Button
} from '@mui/material';

/**
 * Renders a single content block based on its contentType.
 * @param {object} block - The content block object from the dynamic section data.
 * @param {number} index - The index of the block for key generation.
 * @returns {JSX.Element|null} - The rendered Material UI component or null.
 */
const renderContentBlock = (block, index) => {
    // Basic validation
    if (!block || !block.contentType) {
        console.warn("Skipping invalid content block:", block);
        return null;
    }

    switch (block.contentType) {
        case 'paragraph':
            return (
                <Typography key={index} variant="body1" paragraph>
                    {block.text}
                </Typography>
            );

        case 'heading':
            // Determine heading level, default to h6 (Typography variant mapping might differ slightly)
            const headingLevel = `h${Math.max(3, Math.min(6, block.level || 6))}`; // Ensure h3-h6
            return (
                <Typography key={index} variant={headingLevel} gutterBottom sx={{ mt: 2 }}>
                    {block.text}
                </Typography>
            );

        case 'list':
            return (
                <Box key={index}>
                    {block.title && (
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                            {block.title}
                        </Typography>
                    )}
                    <List dense sx={{ mb: 1 }}>
                        {block.items && block.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex} sx={{ py: 0.5 }}>
                                <ListItemText primary={item} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            );

        case 'paragraphList':
             return (
                <Box key={index} sx={{ mb: 1 }}>
                    {block.paragraphs && block.paragraphs.map((para, paraIndex) => (
                        <Typography key={paraIndex} variant="body1" paragraph>
                            {para}
                        </Typography>
                    ))}
                </Box>
             );

        case 'keyValue':
            return (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1">{block.label}:</Typography>
                    <Typography variant="body1">{block.value}</Typography>
                </Box>
            );

        case 'table':
            return (
                <Box key={index} sx={{ my: 2 }}>
                    {(block.tableTitle || block.title) && (
                        <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                            {block.tableTitle || block.title}
                        </Typography>
                    )}
                    <TableContainer component={Paper} elevation={2}>
                        <Table size="small">
                            {block.headers && (
                                <TableHead sx={{ backgroundColor: 'grey.200' }}>
                                    <TableRow>
                                        {block.headers.map((header, hIndex) => (
                                            <TableCell key={hIndex} sx={{ fontWeight: 'bold' }}>
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                            )}
                            <TableBody>
                                {block.rows && block.rows.map((row, rIndex) => (
                                    <TableRow key={rIndex}>
                                        {/* Assuming row is an array */}
                                        {Array.isArray(row) && row.map((cell, cIndex) => (
                                            <TableCell key={cIndex}>
                                                {/* Handle null/undefined gracefully */}
                                                {cell === null || cell === undefined ? '-' : String(cell)}
                                            </TableCell>
                                        ))}
                                        {/* Add logic here if row is an object */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {block.notes && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                            {block.notes}
                        </Typography>
                    )}
                </Box>
            );

        case 'button':
            return (
                <Box key={index} sx={{ my: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        href={block.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {block.text}
                    </Button>
                </Box>
            );

        case 'note':
             return (
                <Typography key={index} variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                    {block.text}
                </Typography>
             );

        default:
            console.warn(`Unsupported contentType: ${block.contentType}`, block);
            return (
                 <Typography key={index} color="error" sx={{ my: 1 }}>
                     Unsupported content type: {block.contentType}
                 </Typography>
            );
    }
};

/**
 * Renders a dynamic section including its title and content blocks.
 * @param {object} props - Component props.
 * @param {object} props.section - The dynamic section object from the report data.
 * @returns {JSX.Element} - The rendered section.
 */
const DynamicSectionRenderer = ({ section }) => {
    if (!section || !section.contentBlocks) {
        return null; // Don't render anything if section or blocks are missing
    }

    return (
        <Box sx={{ mb: 4 }}>
            {/* Render Section Title */}
            <Typography variant="h4" gutterBottom>
                {section.title || 'Untitled Section'}
            </Typography>

            {/* Render Content Blocks */}
            {section.contentBlocks.map((block, index) => renderContentBlock(block, index))}

            {/* Add a divider after each dynamic section for visual separation */}
            <Divider sx={{ mt: 2 }} />
        </Box>
    );
};

export default DynamicSectionRenderer;

