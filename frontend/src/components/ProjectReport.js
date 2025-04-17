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
} from '@mui/material';
import { fetchProject, generateReport } from '../store/slices/projectSlice';

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
const ProjectReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentProject, report, loading, error } = useSelector((state) => state.project);
  
  // Get section from URL query params
  const queryParams = new URLSearchParams(location.search);
  const section = queryParams.get('section') || 'full';

  useEffect(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);

  const handleGenerateReport = () => {
    dispatch(generateReport({ id, section }));
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReport}
            sx={{ mt: 2 }}
          >
            Generate Report
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {report ? (
          <>
            {/* Project Information - Always show */}
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
                  <Typography variant="subtitle1">Owner</Typography>
                  <Typography variant="body1">{report.projectInfo.owner}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Show section-specific content based on the requested section */}
            {section === 'full' && (
              <>
                {/* Building Classification & Climate Zone */}
                {report.buildingClassification && (
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
                    </Grid>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Compliance Pathway */}
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

                <Divider sx={{ my: 3 }} />

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

                <Divider sx={{ my: 3 }} />

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

                <Divider sx={{ my: 3 }} />

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

                <Divider sx={{ my: 3 }} />

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
              </>
            )}

            {/* Section-specific content */}
            {section !== 'full' && (
              <>
                {/* Building Classification & Climate Zone */}
                {section === 'building' && report.buildingClassification && (
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
                    </Grid>
                  </Box>
                )}

                {/* Compliance Pathway */}
                {section === 'compliance' && report.compliancePathway && (
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

                {/* Building Fabric */}
                {section === 'fabric' && report.buildingFabric && (
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
                {section === 'special' && report.specialRequirements && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Special Requirements
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

                {/* Exemptions */}
                {section === 'exemptions' && report.exemptions && (
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
                                <TableCell>Documentation Required</TableCell>
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
                                  <TableCell>
                                    {exemption.documentation_required || 'None specified'}
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

                {/* Other sections */}
                {['energy', 'lighting', 'meters'].includes(section) && report[section] && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      {section.charAt(0).toUpperCase() + section.slice(1)} Requirements
                    </Typography>
                    <Typography variant="body1">
                      {report[section].description}
                    </Typography>
                    {report[section].requirements && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Requirements
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Requirement</TableCell>
                                <TableCell>Details</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(report[section].requirements).map(([key, value], index) => (
                                <TableRow key={index}>
                                  <TableCell>{key}</TableCell>
                                  <TableCell>{JSON.stringify(value)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
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