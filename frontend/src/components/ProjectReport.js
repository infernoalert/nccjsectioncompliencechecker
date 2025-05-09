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

/**
 * ProjectReport Component
 * 
 * This component generates a comprehensive compliance report for NCC Section J requirements.
 * It displays:
 * - Project details and metadata
 * - Building classification and climate zone information
 * - Compliance pathway details
 * - Building fabric specifications
 * - Special requirements and exemptions
 * - Compliance results with pass/fail status
 * - Documentation requirements and status
 * 
 * The report can be viewed on screen or downloaded as a PDF (future enhancement).
 */

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
});

// PDF Document Component
const PDFReport = ({ report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>NCC Section J Compliance Report</Text>
        <Text style={styles.text}>Generated on {new Date().toLocaleDateString()}</Text>
        
        {/* Project Information */}
        <Text style={styles.sectionTitle}>Project Information</Text>
        <Text style={styles.text}>Project Name: {report.projectInfo.name}</Text>
        <Text style={styles.text}>Building Type: {report.projectInfo.buildingType}</Text>
        <Text style={styles.text}>Location: {report.projectInfo.location}</Text>
        <Text style={styles.text}>Floor Area: {report.projectInfo.floorArea} m²</Text>
        <Text style={styles.text}>
          Total Area of Habitable Rooms: {report.projectInfo.totalAreaOfHabitableRooms || 'Not applicable'} m²
        </Text>

        {/* Building Classification & Climate Zone */}
        <Text style={styles.sectionTitle}>Building Classification & Climate Zone</Text>
        <Text style={styles.text}>Building Classification: {report.buildingClassification.classType}</Text>
        <Text style={styles.text}>Description: {report.buildingClassification.description}</Text>
        <Text style={styles.text}>Climate Zone: {report.climateZone.name}</Text>
        <Text style={styles.text}>Description: {report.climateZone.description}</Text>

        {/* Climate Data for Class_2 and Class_4 buildings */}
        {(report.buildingClassification.classType === 'Class_2' || 
          report.buildingClassification.classType === 'Class_4') && 
          report.climateZone.annualHeatingDegreeHours && (
          <>
            <Text style={styles.text}>Annual Heating Degree Hours: {report.climateZone.annualHeatingDegreeHours}</Text>
            <Text style={styles.text}>Annual Cooling Degree Hours: {report.climateZone.annualCoolingDegreeHours}</Text>
            <Text style={styles.text}>Annual Dehumidification Gram Hours: {report.climateZone.annualDehumidificationGramHours}</Text>
          </>
        )}

        {/* Compliance Pathway */}
        {report.compliancePathway && (
          <>
            <Text style={styles.sectionTitle}>Compliance Pathway</Text>
            <Text style={styles.text}>Name: {report.compliancePathway.name}</Text>
            <Text style={styles.text}>Description: {report.compliancePathway.description}</Text>
          </>
        )}

        {/* Performance Requirement */}
        <Text style={styles.sectionTitle}>Performance Requirement</Text>
        
        {/* Energy Use Requirements */}
        {report.energyUse && (
          <>
            <Text style={styles.subsectionTitle}>J1P1: Energy Use</Text>
            <Text style={styles.text}>Description: {report.energyUse.description}</Text>
            {report.energyUse.requirements ? (
              report.energyUse.requirements.map((requirement, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.text}>Condition: {requirement.condition}</Text>
                  {requirement.description.map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.text}>{line}</Text>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.text}>Energy Use Limit: {report.energyUse.limit}</Text>
            )}
          </>
        )}

        {/* J1P2 Calculations */}
        {report.j1p2calc && (
          <>
            <Text style={styles.subsectionTitle}>J1P2: Thermal Energy Load Assessment</Text>
            {Object.entries(report.j1p2calc).map(([key, value]) => (
              <View key={key} style={styles.section}>
                <Text style={styles.text}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}: {value.description}
                </Text>
                <Text style={styles.text}>Value: {value.descriptionValue}</Text>
              </View>
            ))}
          </>
        )}

        {/* J1P3 Energy Usage */}
        {report.j1p3energyusage && (
          <>
            <Text style={styles.subsectionTitle}>{report.j1p3energyusage.title}</Text>
            {report.j1p3energyusage.description.map((line, index) => (
              <Text key={index} style={styles.text}>{line}</Text>
            ))}
          </>
        )}

        {/* J1P4 EVSE */}
        {report.j1p4evse && (
          <>
            <Text style={styles.subsectionTitle}>{report.j1p4evse.title}</Text>
            {report.j1p4evse.description.map((line, index) => (
              <Text key={index} style={styles.text}>{line}</Text>
            ))}
          </>
        )}

        {/* Verification Methods */}
        {report.verificationMethods && (
          <>
            <Text style={styles.subsectionTitle}>Verification Methods</Text>
            {report.verificationMethods.methods.map((method, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.text}>Condition: {method.condition}</Text>
                {method.description.map((line, lineIndex) => (
                  <Text key={lineIndex} style={styles.text}>{line}</Text>
                ))}
              </View>
            ))}
          </>
        )}

        {/* DTS - Deemed-to-Satisfy */}
        <Text style={styles.sectionTitle}>DTS - Deemed-to-Satisfy</Text>

        {/* Building Fabric */}
        {report.buildingFabric && (
          <>
            <Text style={styles.subsectionTitle}>Building Fabric Specifications</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>Component</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>Specification</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>Compliance Status</Text>
                </View>
              </View>
              {Object.entries(report.buildingFabric).map(([component, details]) => (
                <View key={component} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{component}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{details.specification}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{details.compliant ? 'Compliant' : 'Non-compliant'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Special Requirements */}
        {report.specialRequirements && (
          <>
            <Text style={styles.subsectionTitle}>Special Requirements & Exemptions</Text>
            {report.specialRequirements.length > 0 ? (
              report.specialRequirements.map((req, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.text}>Name: {req.name}</Text>
                  <Text style={styles.text}>Description: {req.description}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.text}>No special requirements specified</Text>
            )}
          </>
        )}

        {/* Exemptions */}
        {report.exemptions && (
          <>
            <Text style={styles.subsectionTitle}>Exemptions</Text>
            {report.exemptions.exemptions && report.exemptions.exemptions.length > 0 ? (
              <>
                <Text style={styles.text}>{report.exemptions.message}</Text>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>Exemption</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>Description</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>Conditions</Text>
                    </View>
                  </View>
                  {report.exemptions.exemptions.map((exemption, index) => (
                    <View key={index} style={styles.tableRow}>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{exemption.name}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{exemption.description || 'No description available'}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{exemption.conditions || exemption.threshold || 'No specific conditions'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.text}>No exemptions specified</Text>
            )}
          </>
        )}

        {/* Documentation */}
        {report.documentation && (
          <>
            <Text style={styles.subsectionTitle}>Documentation</Text>
            {report.documentation.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Document Name</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Type</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>Status</Text>
                  </View>
                </View>
                {report.documentation.map((doc, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{doc.name}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{doc.type}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{doc.status === 'provided' ? 'Provided' : 'Pending'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.text}>No documentation required</Text>
            )}
          </>
        )}
      </View>
    </Page>
  </Document>
);

const ProjectReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentProject, report, loading, error } = useSelector((state) => state.project);
  const [showPDF, setShowPDF] = useState(false);
  
  // Get section from URL query params
  const queryParams = new URLSearchParams(location.search);
  const section = queryParams.get('section') || 'full';

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);

  const handleGenerateReport = () => {
    dispatch(generateReport({ id, section }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setShowPDF(true);
  };

  const handleClosePDF = () => {
    setShowPDF(false);
  };

  const renderJ3D3Requirements = () => {
    if (!report?.j3d3Requirements) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          J3D3: Reducing heating and cooling loads
        </Typography>
        
        {/* General Requirements */}
        {report.j3d3Requirements.general_requirements?.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Requirements
            </Typography>
            <List>
              {report.j3d3Requirements.general_requirements.description.map((req, index) => (
                <ListItem key={index}>
                  <ListItemText primary={req} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Specific Requirements */}
        {report.j3d3Requirements.specific_requirements?.requirements && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Specific Requirements
            </Typography>
            <List>
              {report.j3d3Requirements.specific_requirements.requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemText primary={req} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Thermal Breaks */}
        {report.j3d3Requirements.thermal_breaks && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thermal Breaks
            </Typography>
            <List>
              {Object.values(report.j3d3Requirements.thermal_breaks).map((breakType, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={breakType?.condition}
                    secondary={breakType?.requirements?.join('. ')}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Floor Requirements */}
        {report.j3d3Requirements.floor_requirements?.requirements && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Floor Requirements
            </Typography>
            <List>
              {report.j3d3Requirements.floor_requirements.requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemText primary={req} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Building Sealing */}
        {report.j3d3Requirements.building_sealing && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Building Sealing
            </Typography>
            <List>
              {Object.values(report.j3d3Requirements.building_sealing).map((sealingType, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={sealingType?.condition}
                    secondary={sealingType?.requirements?.join('. ')}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{typeof error === 'object' ? error.message : error}</Alert>
      </Container>
    );
  }

  if (!currentProject) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Project not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            NCC Section J Compliance Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Generated on {new Date().toLocaleDateString()}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print Report
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
            >
              Download PDF
            </Button>
          </Box>
        </Box>

        {/* PDF Viewer Modal */}
        {showPDF && report && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '90%', height: '90%', bgcolor: 'white', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button onClick={handleClosePDF}>Close</Button>
              </Box>
              <PDFViewer style={{ width: '100%', height: '90%' }}>
                <PDFReport report={report} />
              </PDFViewer>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {report ? (
          <>
            {/* General Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                General
              </Typography>

              {/* Project Information Subsection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Project Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Project Name</Typography>
                    <Typography variant="body1">{report.projectInfo.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Building Type</Typography>
                    <Typography variant="body1">{report.projectInfo.buildingType}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Location</Typography>
                    <Typography variant="body1">{report.projectInfo.location}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Floor Area</Typography>
                    <Typography variant="body1">{report.projectInfo.floorArea} m²</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Total Area of Habitable Rooms</Typography>
                    <Typography variant="body1">
                      {report.projectInfo.totalAreaOfHabitableRooms !== null 
                        ? `${report.projectInfo.totalAreaOfHabitableRooms} m²` 
                        : 'Not applicable'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Building Classification & Climate Zone Subsection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Building Classification & Climate Zone
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Building Classification</Typography>
                    <Typography variant="body1">
                      {report.buildingClassification.classType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.buildingClassification.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Climate Zone</Typography>
                    <Typography variant="body1">
                      {report.climateZone.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.climateZone.description}
                    </Typography>
                  </Grid>
                  {/* Display climate data for Class_2 and Class_4 buildings */}
                  {(report.buildingClassification.classType === 'Class_2' || 
                    report.buildingClassification.classType === 'Class_4') && 
                    report.climateZone.annualHeatingDegreeHours && (
                    <>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1">Annual Heating Degree Hours</Typography>
                        <Typography variant="body1">
                          {report.climateZone.annualHeatingDegreeHours}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1">Annual Cooling Degree Hours</Typography>
                        <Typography variant="body1">
                          {report.climateZone.annualCoolingDegreeHours}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1">Annual Dehumidification Gram Hours</Typography>
                        <Typography variant="body1">
                          {report.climateZone.annualDehumidificationGramHours}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>

              {/* Compliance Pathway Subsection */}
              {report.compliancePathway && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Compliance Pathway
                  </Typography>
                  <Typography variant="body1">
                    {report.compliancePathway.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {report.compliancePathway.description}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Performance Requirement Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Performance Requirement
              </Typography>

              {/* Energy Use Requirements Subsection */}
              {report.energyUse ? (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    J1P1: Energy Use
                  </Typography>
                  {report.energyUse.requirements ? (
                    // Display energy efficiency requirements for Class_2 and Class_4 buildings
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Description</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {report.energyUse.description}
                        </Typography>
                      </Grid>
                      {report.energyUse.requirements.map((requirement, index) => (
                        <Grid item xs={12} key={index}>
                          <Typography variant="subtitle1">{requirement.condition}</Typography>
                          {requirement.description.map((line, lineIndex) => (
                            <Typography key={lineIndex} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {line}
                            </Typography>
                          ))}
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    // Display J1P1 requirements for other building classes
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Energy Use Limit</Typography>
                        <Typography variant="body1">
                          {report.energyUse.limit}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Description</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {report.energyUse.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              ) : (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    J1P1: Energy Use
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Not applicable to this building type.
                  </Typography>
                </Box>
              )}

              {/* J1P2 Calculation Subsection - Only for Class_2 and Class_4 buildings */}
              {report.j1p2calc && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    J1P2: Thermal Energy Load Assessment
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(report.j1p2calc).map(([key, value]) => (
                      <Grid item xs={12} key={key}>
                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {value.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Value: {value.descriptionValue}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* J1P3 Energy Usage Subsection - Only for Class_2 and Class_4 buildings */}
              {report.j1p3energyusage && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    {report.j1p3energyusage.title}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {report.j1p3energyusage.description.map((line, index) => (
                        <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {line}
                        </Typography>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* J1P4 EVSE Subsection - Applies to all building classes */}
              {report.j1p4evse && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    {report.j1p4evse.title}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {report.j1p4evse.description.map((line, index) => (
                        <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {line}
                        </Typography>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Verification Methods Subsection */}
              {report.verificationMethods && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Verification Methods
                  </Typography>
                  <Grid container spacing={2}>
                    {report.verificationMethods.methods.map((method, index) => (
                      <Grid item xs={12} key={index}>
                        <Typography variant="subtitle1" gutterBottom>
                          {method.condition}
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {method.description.map((line, lineIndex) => (
                            <Typography 
                              key={lineIndex} 
                              variant="body2" 
                              color="text.secondary"
                              component="li"
                            >
                              {line}
                            </Typography>
                          ))}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* DTS - Deemed-to-Satisfy Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                DTS - Deemed-to-Satisfy
              </Typography>

              {/* J2 Energy Efficiency Subsection */}
              {report.energyUse && report.energyUse.requirements && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    J2 Energy Efficiency
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Description</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.energyUse.description}
                      </Typography>
                    </Grid>
                    {report.energyUse.requirements.map((requirement, index) => (
                      <Grid item xs={12} key={index}>
                        <Typography variant="subtitle1">{requirement.condition}</Typography>
                        {requirement.description.map((line, lineIndex) => (
                          <Typography key={lineIndex} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {line}
                          </Typography>
                        ))}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* J3D3 Requirements Subsection - Only for Class_2 and Class_4 buildings */}
              {report.j3d3Requirements && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    {report.j3d3Requirements.general?.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {report.j3d3Requirements.general?.description}
                  </Typography>

                  {/* General Requirements */}
                  {report.j3d3Requirements.general?.requirements && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        General Requirements
                      </Typography>
                      <Grid container spacing={2}>
                        {report.j3d3Requirements.general.requirements.map((req, index) => (
                          <Grid item xs={12} key={index}>
                            <Typography variant="subtitle1">{req.condition}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {req.description}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* J3D7 Ceiling Insulation Table */}
                  {report.j3d3Requirements.general?.tables?.j3d7_ceiling_insulation && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {report.j3d3Requirements.general.tables.j3d7_ceiling_insulation.title}
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              {report.j3d3Requirements.general.tables.j3d7_ceiling_insulation.headers.map((header, index) => (
                                <TableCell 
                                  key={index}
                                  align={report.j3d3Requirements.general.tables.j3d7_ceiling_insulation.format.alignment[index]}
                                  sx={{ width: report.j3d3Requirements.general.tables.j3d7_ceiling_insulation.format.width[index] }}
                                >
                                  {header}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {report.j3d3Requirements.general.tables.j3d7_ceiling_insulation.rows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell 
                                    key={cellIndex}
                                    align={report.j3d3Requirements.general.tables.j3d7_ceiling_insulation.format.alignment[cellIndex]}
                                  >
                                    {cell === null ? '-' : cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Elemental Provisions J3 */}
                  {report.elementalProvisionsJ3 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h5" gutterBottom>
                        {report.elementalProvisionsJ3.ceilingFan?.title || 'Elemental Provisions for a Sole-Occupancy Unit J3'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1">Description</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {report.elementalProvisionsJ3.ceilingFan?.description}
                          </Typography>

                          {/* General Requirements */}
                          {report.elementalProvisionsJ3.ceilingFan?.generalRequirements?.map((req, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography variant="subtitle1">{req.condition}</Typography>
                              <List>
                                {req.description.map((desc, descIndex) => (
                                  <ListItem key={descIndex}>
                                    <ListItemText primary={desc} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          ))}

                          {/* Climate Zone Specific Requirements */}
                          {report.elementalProvisionsJ3.ceilingFan?.climateZoneSpecific && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1">
                                {report.elementalProvisionsJ3.ceilingFan.climateZoneSpecific.condition}
                              </Typography>
                              <List>
                                {report.elementalProvisionsJ3.ceilingFan.climateZoneSpecific.requirements.map((req, index) => (
                                  <ListItem key={index}>
                                    <ListItemText primary={req} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {/* Table J3D4 */}
                          {report.elementalProvisionsJ3.ceilingFan?.table && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {report.elementalProvisionsJ3.ceilingFan.table.title}
                              </Typography>
                              <TableContainer component={Paper}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      {report.elementalProvisionsJ3.ceilingFan.table.headers.map((header, index) => (
                                        <TableCell 
                                          key={index}
                                          align={report.elementalProvisionsJ3.ceilingFan.table.format.alignment[index]}
                                          sx={{ width: report.elementalProvisionsJ3.ceilingFan.table.format.width[index] }}
                                        >
                                          {header}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {report.elementalProvisionsJ3.ceilingFan.table.rows.map((row, rowIndex) => (
                                      <TableRow key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                          <TableCell 
                                            key={cellIndex}
                                            align={report.elementalProvisionsJ3.ceilingFan.table.format.alignment[cellIndex]}
                                          >
                                            {cell}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Climate Zone Specific Requirements */}
                  {report.j3d3Requirements.climateZone && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Climate Zone Specific Requirements
                      </Typography>
                      <Grid container spacing={2}>
                        {report.j3d3Requirements.climateZone.heating_load_limit && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Heating Load Limit</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {report.j3d3Requirements.climateZone.heating_load_limit}
                            </Typography>
                          </Grid>
                        )}
                        {report.j3d3Requirements.climateZone.cooling_load_limit && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Cooling Load Limit</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {report.j3d3Requirements.climateZone.cooling_load_limit}
                            </Typography>
                          </Grid>
                        )}
                        {report.j3d3Requirements.climateZone.additional_requirements?.map((req, index) => (
                          <Grid item xs={12} key={index}>
                            <Typography variant="body2" color="text.secondary">
                              {req}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Floor Area Requirements */}
                  {report.j3d3Requirements.floorArea && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Floor Area Requirements
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1">
                            {report.j3d3Requirements.floorArea.condition}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {report.j3d3Requirements.floorArea.description}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}

              {/* Building Fabric */}
              {report.buildingFabric && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Building Fabric Specifications
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Component</TableCell>
                          <TableCell>Specification</TableCell>
                          <TableCell>Compliance Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(report.buildingFabric).map(([component, details]) => (
                          <TableRow key={component}>
                            <TableCell>{component}</TableCell>
                            <TableCell>{details.specification}</TableCell>
                            <TableCell>
                              <Typography
                                color={details.compliant ? 'success.main' : 'error.main'}
                              >
                                {details.compliant ? 'Compliant' : 'Non-compliant'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Special Requirements */}
              {report.specialRequirements && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Special Requirements & Exemptions
                  </Typography>
                  {report.specialRequirements.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Special Requirements
                      </Typography>
                      <ul>
                        {report.specialRequirements.map((req, index) => (
                          <li key={index}>
                            <Typography variant="body1">{req.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {req.description}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  ) : (
                    <Typography variant="body1">No special requirements specified</Typography>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Other 2 Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Other 2
              </Typography>

              {/* Exemptions */}
              {report.exemptions && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Exemptions
                  </Typography>
                  {report.exemptions.exemptions && report.exemptions.exemptions.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        {report.exemptions.message}
                      </Typography>
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Exemption</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Conditions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {report.exemptions.exemptions.map((exemption, index) => (
                              <TableRow key={index}>
                                <TableCell>{exemption.name}</TableCell>
                                <TableCell>
                                  {exemption.description || 'No description available'}
                                </TableCell>
                                <TableCell>
                                  {exemption.conditions || exemption.threshold || 'No specific conditions'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : (
                    <Typography variant="body1">{report.exemptions.message || 'No exemptions apply to this building.'}</Typography>
                  )}
                </Box>
              )}

              {/* Compliance Results */}
              {report.complianceResults && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Compliance Results
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Requirement</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.complianceResults.checks.map((check, index) => (
                          <TableRow key={index}>
                            <TableCell>{check.requirement}</TableCell>
                            <TableCell>
                              <Typography
                                color={check.passed ? 'success.main' : 'error.main'}
                              >
                                {check.passed ? 'Passed' : 'Failed'}
                              </Typography>
                            </TableCell>
                            <TableCell>{check.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Documentation */}
              {report.documentation && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Documentation
                  </Typography>
                  {report.documentation.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Document Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {report.documentation.map((doc, index) => (
                            <TableRow key={index}>
                              <TableCell>{doc.name}</TableCell>
                              <TableCell>{doc.type}</TableCell>
                              <TableCell>
                                <Typography
                                  color={doc.status === 'provided' ? 'success.main' : 'warning.main'}
                                >
                                  {doc.status === 'provided' ? 'Provided' : 'Pending'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body1">No documentation required</Typography>
                  )}
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No report generated yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Click the "Generate Report" button above to create a compliance report.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectReport; 