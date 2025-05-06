import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { fetchProject, generateReport } from '../store/slices/projectSlice';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Import the new dynamic renderer
import DynamicSectionRenderer from './DynamicSectionRenderer';

/**
 * ProjectReport Component - Refactored for Dynamic Sections
 *
 * Displays a compliance report, rendering core sections directly and
 * dynamically rendering sections loaded from JSON via the backend's
 * 'dynamicSections' array.
 */

// --- PDF Styles (Keep as is for now, but PDFReport needs updating) ---
const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    section: { marginBottom: 15 }, // Adjusted spacing
    sectionTitle: { fontSize: 16, marginBottom: 8, fontWeight: 'bold' }, // Adjusted size/weight
    subsectionTitle: { fontSize: 14, marginBottom: 6, fontWeight: 'bold' }, // Adjusted size/weight
    text: { fontSize: 10, marginBottom: 4, lineHeight: 1.3 }, // Adjusted size/spacing
    table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 10 },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f0f0f0', padding: 3 },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 3 },
    tableCellHeader: { margin: 'auto', fontSize: 9, fontWeight: 'bold' },
    tableCell: { margin: 'auto', fontSize: 9 },
    listItem: { fontSize: 10, marginBottom: 2 },
    // Add more styles as needed for dynamic content types
});

// --- PDF Document Component (Needs significant updates for dynamicSections) ---
// Placeholder - This needs to be refactored to iterate through dynamicSections
// and render content blocks similar to DynamicSectionRenderer.
const PDFReport = ({ report }) => {
     if (!report) return null; // Handle case where report is not yet loaded

     // Helper to render PDF content blocks (basic example)
     const renderPdfBlock = (block, index) => {
         switch (block.contentType) {
             case 'paragraph': return <Text key={index} style={styles.text}>{block.text}</Text>;
             case 'heading': return <Text key={index} style={styles.subsectionTitle}>{block.text}</Text>;
             case 'list': return (
                 <View key={index} style={{ marginLeft: 10 }}>
                     {block.items?.map((item, i) => <Text key={i} style={styles.listItem}>• {item}</Text>)}
                 </View>
             );
             // --- TODO: Add cases for table, keyValue, paragraphList etc. ---
             default: return <Text key={index} style={{...styles.text, color: 'red'}}>Unsupported type: {block.contentType}</Text>;
         }
     };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>NCC Section J Compliance Report</Text>
                    <Text style={styles.text}>Generated on {new Date().toLocaleDateString()}</Text>

                    {/* --- Render Core Sections --- */}
                    {report.projectInfo && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Project Information</Text>
                            <Text style={styles.text}>Project Name: {report.projectInfo.name}</Text>
                            <Text style={styles.text}>Building Type: {report.projectInfo.buildingType}</Text>
                            <Text style={styles.text}>Location: {report.projectInfo.location}</Text>
                            <Text style={styles.text}>Floor Area: {report.projectInfo.floorArea} m²</Text>
                            <Text style={styles.text}>Habitable Rooms Area: {report.projectInfo.totalAreaOfHabitableRooms ?? 'N/A'} m²</Text>
                        </View>
                    )}
                    {report.buildingClassification && (
                         <View style={styles.section}>
                             <Text style={styles.sectionTitle}>Building Classification & Climate Zone</Text>
                             <Text style={styles.text}>Classification: {report.buildingClassification.classType} - {report.buildingClassification.name}</Text>
                             {report.climateZone && <Text style={styles.text}>Climate Zone: {report.climateZone.name}</Text>}
                             {/* Add more details if needed */}
                         </View>
                    )}
                    {/* Add other core sections like J1P2 Calc if needed */}
                    {report.j1p2calc && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>J1P2 Calculations</Text>
                            {/* Render J1P2 calc details */}
                             <Text style={styles.text}>Heating Load: {report.j1p2calc.totalheatingload?.descriptionValue}</Text>
                             <Text style={styles.text}>Cooling Load: {report.j1p2calc.totalcoolingload?.descriptionValue}</Text>
                             <Text style={styles.text}>Thermal Load: {report.j1p2calc.thermalenergyload?.descriptionValue}</Text>
                        </View>
                    )}


                    {/* --- Render Dynamic Sections --- */}
                    {report.dynamicSections && report.dynamicSections.map((section) => (
                        <View key={section.sectionId} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            {section.contentBlocks?.map((block, index) => renderPdfBlock(block, index))}
                        </View>
                    ))}

                </View>
            </Page>
        </Document>
    );
};


const ProjectReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { currentProject, report, loading, error } = useSelector((state) => state.project);
    const [showPDF, setShowPDF] = useState(false);

    // Get section from URL query params
    const queryParams = new URLSearchParams(location.search);
    const sectionParam = queryParams.get('section') || 'full'; // Use consistent naming

    useEffect(() => {
        // Fetch basic project details on load if needed (optional)
        // dispatch(fetchProject(id));

        // Automatically generate report on load or when section changes
        dispatch(generateReport({ id, section: sectionParam }));

    }, [dispatch, id, sectionParam]); // Re-run if id or sectionParam changes

    const handleGenerateReport = () => {
        // Manually trigger report generation if needed (button kept for now)
        dispatch(generateReport({ id, section: sectionParam }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        if (report) { // Only show PDF if report data exists
             setShowPDF(true);
        } else {
            alert("Please generate the report first."); // Or disable the button
        }
    };

    const handleClosePDF = () => {
        setShowPDF(false);
    };

    // --- Loading and Error States ---
    if (loading && !report) { // Show loading only if report isn't already loaded
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">Error loading report: {typeof error === 'object' ? error.message : error}</Alert>
            </Container>
        );
    }

    // --- Report Rendering ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        NCC Section J Compliance Report
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {/* Display project name if available */}
                        Project: {report?.projectInfo?.name || currentProject?.name || `ID: ${id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Generated on {new Date().toLocaleDateString()} {/* Consider adding time */}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {/* Keep Generate button if manual trigger is desired */}
                        {/* <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateReport}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Refresh Report'}
                        </Button> */}
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            disabled={!report || loading}
                        >
                            Print Report
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handleExportPDF}
                            disabled={!report || loading}
                        >
                            Download PDF
                        </Button>
                    </Box>
                </Box>

                {/* PDF Viewer Modal */}
                {showPDF && report && (
                    <Box
                        sx={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1300,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Paper sx={{ width: '90%', height: '90%', p: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                <Button onClick={handleClosePDF} size="small">Close</Button>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                    <PDFReport report={report} />
                                </PDFViewer>
                            </Box>
                        </Paper>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Report Content Area */}
                {report ? (
                    <>
                        {/* --- Render Core/Static Sections --- */}
                        {report.projectInfo && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" gutterBottom>Project Information</Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Name:</strong> {report.projectInfo.name}</Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Type:</strong> {report.projectInfo.buildingType}</Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Location:</strong> {report.projectInfo.location}</Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Floor Area:</strong> {report.projectInfo.floorArea} m²</Typography></Grid>
                                    <Grid item xs={12} sm={6}><Typography variant="body1"><strong>Habitable Rooms Area:</strong> {report.projectInfo.totalAreaOfHabitableRooms ?? 'N/A'} m²</Typography></Grid>
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                            </Box>
                        )}

                        {report.buildingClassification && (
                             <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" gutterBottom>Building Classification & Climate Zone</Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body1"><strong>Classification:</strong> {report.buildingClassification.classType} - {report.buildingClassification.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{report.buildingClassification.description}</Typography>
                                    </Grid>
                                    {report.climateZone && (
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body1"><strong>Climate Zone:</strong> {report.climateZone.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{report.climateZone.description}</Typography>
                                            {/* Conditionally display extra climate data */}
                                            {report.climateZone.annualHeatingDegreeHours !== undefined && <Typography variant="caption" display="block">Heating Degree Hours: {report.climateZone.annualHeatingDegreeHours}</Typography>}
                                            {report.climateZone.annualCoolingDegreeHours !== undefined && <Typography variant="caption" display="block">Cooling Degree Hours: {report.climateZone.annualCoolingDegreeHours}</Typography>}
                                            {report.climateZone.annualDehumidificationGramHours !== undefined && <Typography variant="caption" display="block">Dehumid. Gram Hours: {report.climateZone.annualDehumidificationGramHours}</Typography>}
                                        </Grid>
                                    )}
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                            </Box>
                        )}

                        {/* Add other core sections like Compliance Pathway, Building Fabric if they are still static */}

                        {/* Render J1P2 Calculations if present */}
                        {report.j1p2calc && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" gutterBottom>J1P2 Calculations</Typography>
                                <Grid container spacing={1}>
                                    {Object.entries(report.j1p2calc).map(([key, value]) => (
                                        <Grid item xs={12} key={key}>
                                            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {value?.description}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Value:</strong> {value?.descriptionValue}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                            </Box>
                        )}

                        {/* --- Render Dynamic Sections --- */}
                        {report.dynamicSections && report.dynamicSections.length > 0 ? (
                            report.dynamicSections.map((section) => (
                                <DynamicSectionRenderer key={section.sectionId} section={section} />
                            ))
                        ) : (
                             <Typography variant="body1" color="text.secondary" sx={{my: 3}}>
                                 No applicable dynamic sections found for this project or report view.
                             </Typography>
                        )}

                        {/* --- REMOVED OLD HARDCODED SECTIONS --- */}
                        {/* The specific JSX for rendering Exemptions, Energy Use, J3D3, */}
                        {/* Elemental Provisions J3, Verification Methods etc. that was here */}
                        {/* previously should be removed as it's now handled by DynamicSectionRenderer */}


                    </>
                ) : (
                    // Display message if report hasn't loaded or is empty
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                         {loading ? (
                             <CircularProgress />
                         ) : (
                             <>
                                <Typography variant="h6" gutterBottom>
                                    Report Data Not Available
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Please ensure the project ID is correct and try generating the report again.
                                </Typography>
                                <Button onClick={handleGenerateReport} sx={{mt: 2}}>Retry</Button>
                             </>
                         )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ProjectReport;
