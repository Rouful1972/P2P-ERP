import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Textarea,
  Switch,
  useDisclosure,
  useToast,
  Heading,
  Text,
  Badge,
  IconButton,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Divider,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckIcon, UnlockIcon } from '@chakra-ui/icons';

const BillOfMaterials = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBom, setSelectedBom] = useState(null);
  const [productCategories, setProductCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    pcat_code: '',
    product_code: '',
    batch_size: '',
    batch_unit: '',
    bom_ratio: '',
    annex_ratio: '',
    batch_qnty: '',
    batch_qnty_unit: '',
    pack1: '',
    pack2: '',
    pack3: '',
    per_unit_wt: '',
    per_unit_wt_unit: '',
    std_avg_wt: '',
    bmr_no: '',
    version_no: '',
    eff_dt: '',
    prod_ld_time: '',
    prod_dosage_form: '',
    bom_code: '',
    label_ratio: '',
    per_unit_solid_unit: '',
    dml_valid_upto: '',
    granul_method: '',
    max_bt_per_day: '',
    mon_sfty_stock: '',
    bpr_version_no: '',
    bpr_eff_dt: '',
    bcr_version_no: '',
    bcr_eff_dt: '',
    opl_p_code: '',
    batch_per_large_unit: '',
    batch_per_large_qnty: '',
    note: '',
    initiator: '',
    is_active: true,
    details: []
  });
  const [bomDetail, setBomDetail] = useState({
    pcat_code: '',
    p_code: '',
    raw_code: '',
    raw_type: '',
    declared_qnty: '',
    declared_unit: '',
    qty_per_batch: '',
    overage: '',
    seq: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDetailOpen, 
    onOpen: onDetailOpen, 
    onClose: onDetailClose 
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all required data
      const [bomsRes, categoriesRes, productsRes, rawMatsRes, employeesRes] = await Promise.all([
        fetch('/api/bom/', { headers }),
        fetch('/api/lovs/product-categories', { headers }),
        fetch('/api/lovs/products', { headers }),
        fetch('/api/lovs/raw-materials', { headers }),
        fetch('/api/lovs/employees', { headers })
      ]);

      const [bomsData, categoriesData, productsData, rawMatsData, employeesData] = await Promise.all([
        bomsRes.json(),
        categoriesRes.json(),
        productsRes.json(),
        rawMatsRes.json(),
        employeesRes.json()
      ]);

      setBoms(bomsData);
      setProductCategories(categoriesData);
      setProducts(productsData);
      setRawMaterials(rawMatsData);
      setEmployees(employeesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = selectedBom 
        ? `/api/bom/${selectedBom.id}`
        : '/api/bom/';
      
      const method = selectedBom ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `BOM ${selectedBom ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchData();
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Operation failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleApprove = async (bomId) => {
    const approverCode = prompt('Enter approver employee code:');
    if (!approverCode) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bom/${bomId}/approve?approver_emp_code=${approverCode}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'BOM approved successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Approval failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAuthorize = async (bomId) => {
    const authorizerCode = prompt('Enter authorizer employee code:');
    if (!authorizerCode) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bom/${bomId}/authorize?authorizer_emp_code=${authorizerCode}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'BOM authorized successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Authorization failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const addBomDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, bomDetail]
    });
    setBomDetail({
      pcat_code: formData.pcat_code,
      p_code: formData.product_code,
      raw_code: '',
      raw_type: '',
      declared_qnty: '',
      declared_unit: '',
      qty_per_batch: '',
      overage: '',
      seq: formData.details.length + 1,
      is_active: true
    });
    onDetailClose();
  };

  const handleEdit = (bom) => {
    setSelectedBom(bom);
    setFormData({
      pcat_code: bom.pcat_code,
      product_code: bom.product_code,
      batch_size: bom.batch_size,
      batch_unit: bom.batch_unit || '',
      bom_ratio: bom.bom_ratio || '',
      annex_ratio: bom.annex_ratio || '',
      batch_qnty: bom.batch_qnty || '',
      batch_qnty_unit: bom.batch_qnty_unit || '',
      pack1: bom.pack1 || '',
      pack2: bom.pack2 || '',
      pack3: bom.pack3 || '',
      per_unit_wt: bom.per_unit_wt || '',
      per_unit_wt_unit: bom.per_unit_wt_unit || '',
      std_avg_wt: bom.std_avg_wt || '',
      bmr_no: bom.bmr_no || '',
      version_no: bom.version_no,
      eff_dt: bom.eff_dt || '',
      prod_ld_time: bom.prod_ld_time || '',
      prod_dosage_form: bom.prod_dosage_form || '',
      bom_code: bom.bom_code || '',
      label_ratio: bom.label_ratio || '',
      per_unit_solid_unit: bom.per_unit_solid_unit || '',
      dml_valid_upto: bom.dml_valid_upto || '',
      granul_method: bom.granul_method || '',
      max_bt_per_day: bom.max_bt_per_day || '',
      mon_sfty_stock: bom.mon_sfty_stock || '',
      bpr_version_no: bom.bpr_version_no || '',
      bpr_eff_dt: bom.bpr_eff_dt || '',
      bcr_version_no: bom.bcr_version_no || '',
      bcr_eff_dt: bom.bcr_eff_dt || '',
      opl_p_code: bom.opl_p_code || '',
      batch_per_large_unit: bom.batch_per_large_unit || '',
      batch_per_large_qnty: bom.batch_per_large_qnty || '',
      note: bom.note || '',
      initiator: bom.initiator || '',
      is_active: bom.is_active,
      details: bom.details || []
    });
    onOpen();
  };

  const handleAdd = () => {
    setSelectedBom(null);
    setFormData({
      pcat_code: '',
      product_code: '',
      batch_size: '',
      batch_unit: '',
      bom_ratio: '',
      annex_ratio: '',
      batch_qnty: '',
      batch_qnty_unit: '',
      pack1: '',
      pack2: '',
      pack3: '',
      per_unit_wt: '',
      per_unit_wt_unit: '',
      std_avg_wt: '',
      bmr_no: '',
      version_no: '',
      eff_dt: '',
      prod_ld_time: '',
      prod_dosage_form: '',
      bom_code: '',
      label_ratio: '',
      per_unit_solid_unit: '',
      dml_valid_upto: '',
      granul_method: '',
      max_bt_per_day: '',
      mon_sfty_stock: '',
      bpr_version_no: '',
      bpr_eff_dt: '',
      bcr_version_no: '',
      bcr_eff_dt: '',
      opl_p_code: '',
      batch_per_large_unit: '',
      batch_per_large_qnty: '',
      note: '',
      initiator: '',
      is_active: true,
      details: []
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedBom(null);
    onClose();
  };

  const getWorkflowStatus = (bom) => {
    if (bom.auth_by && bom.auth_dt) {
      return { status: 'Authorized', color: 'green' };
    } else if (bom.aprv_by && bom.aprv_dt) {
      return { status: 'Approved', color: 'yellow' };
    } else {
      return { status: 'Draft', color: 'gray' };
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Enhanced Bill of Materials (BOM)</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={handleAdd}
          >
            Create BOM
          </Button>
        </HStack>

        <Alert status="info">
          <AlertIcon />
          <Text>
            This enhanced BOM module supports all pharma-specific fields including batch sizes, 
            granulation methods, BPR/BCR versions, and approval workflows as per your business requirements.
          </Text>
        </Alert>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Product Code</Th>
                  <Th>Product Category</Th>
                  <Th>Version</Th>
                  <Th>Batch Size</Th>
                  <Th>BMR No</Th>
                  <Th>Workflow Status</Th>
                  <Th>Initiator</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {boms.map((bom) => {
                  const workflowStatus = getWorkflowStatus(bom);
                  return (
                    <Tr key={bom.id}>
                      <Td fontWeight="bold">{bom.product_code}</Td>
                      <Td>{bom.pcat_code}</Td>
                      <Td>{bom.version_no}</Td>
                      <Td>{bom.batch_size} {bom.batch_unit}</Td>
                      <Td>{bom.bmr_no || '-'}</Td>
                      <Td>
                        <Badge colorScheme={workflowStatus.color}>
                          {workflowStatus.status}
                        </Badge>
                      </Td>
                      <Td>{bom.initiator || '-'}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEdit(bom)}
                          />
                          {workflowStatus.status === 'Draft' && (
                            <IconButton
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleApprove(bom.id)}
                              title="Approve BOM"
                            />
                          )}
                          {workflowStatus.status === 'Approved' && (
                            <IconButton
                              icon={<UnlockIcon />}
                              size="sm"
                              colorScheme="purple"
                              onClick={() => handleAuthorize(bom.id)}
                              title="Authorize BOM"
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {/* Enhanced BOM Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            {selectedBom ? 'Edit BOM' : 'Create New BOM'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <Tabs>
                <TabList>
                  <Tab>Basic Information</Tab>
                  <Tab>Production Details</Tab>
                  <Tab>Quality & Documents</Tab>
                  <Tab>Raw Materials</Tab>
                </TabList>

                <TabPanels>
                  {/* Basic Information Tab */}
                  <TabPanel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>Product Category</FormLabel>
                          <Select
                            value={formData.pcat_code}
                            onChange={(e) => setFormData({...formData, pcat_code: e.target.value})}
                          >
                            <option value="">Select Category</option>
                            {productCategories.map(cat => (
                              <option key={cat.pcat_code} value={cat.pcat_code}>
                                {cat.pcat_name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>Product Code</FormLabel>
                          <Select
                            value={formData.product_code}
                            onChange={(e) => setFormData({...formData, product_code: e.target.value})}
                          >
                            <option value="">Select Product</option>
                            {products.filter(p => !formData.pcat_code || p.pcat_code === formData.pcat_code).map(product => (
                              <option key={product.p_code} value={product.p_code}>
                                {product.p_desc}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>Version No</FormLabel>
                          <Input
                            value={formData.version_no}
                            onChange={(e) => setFormData({...formData, version_no: e.target.value})}
                            placeholder="e.g., V001"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>Batch Size</FormLabel>
                          <NumberInput>
                            <NumberInputField
                              value={formData.batch_size}
                              onChange={(e) => setFormData({...formData, batch_size: e.target.value})}
                              placeholder="Batch size"
                            />
                          </NumberInput>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Batch Unit</FormLabel>
                          <Input
                            value={formData.batch_unit}
                            onChange={(e) => setFormData({...formData, batch_unit: e.target.value})}
                            placeholder="e.g., KG, Tablets"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Initiator</FormLabel>
                          <Select
                            value={formData.initiator}
                            onChange={(e) => setFormData({...formData, initiator: e.target.value})}
                          >
                            <option value="">Select Initiator</option>
                            {employees.map(emp => (
                              <option key={emp.emp_code} value={emp.emp_code}>
                                {emp.emp_office_name} ({emp.emp_code})
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </TabPanel>

                  {/* Production Details Tab */}
                  <TabPanel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>BMR No</FormLabel>
                          <Input
                            value={formData.bmr_no}
                            onChange={(e) => setFormData({...formData, bmr_no: e.target.value})}
                            placeholder="Batch Manufacturing Record No"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Production Lead Time (days)</FormLabel>
                          <NumberInput>
                            <NumberInputField
                              value={formData.prod_ld_time}
                              onChange={(e) => setFormData({...formData, prod_ld_time: e.target.value})}
                            />
                          </NumberInput>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Max Batches Per Day</FormLabel>
                          <NumberInput>
                            <NumberInputField
                              value={formData.max_bt_per_day}
                              onChange={(e) => setFormData({...formData, max_bt_per_day: e.target.value})}
                            />
                          </NumberInput>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Granulation Method</FormLabel>
                          <Input
                            value={formData.granul_method}
                            onChange={(e) => setFormData({...formData, granul_method: e.target.value})}
                            placeholder="e.g., Wet granulation, Dry granulation"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Production Dosage Form</FormLabel>
                          <Input
                            value={formData.prod_dosage_form}
                            onChange={(e) => setFormData({...formData, prod_dosage_form: e.target.value})}
                            placeholder="e.g., Tablet, Capsule"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Monthly Safety Stock</FormLabel>
                          <NumberInput>
                            <NumberInputField
                              value={formData.mon_sfty_stock}
                              onChange={(e) => setFormData({...formData, mon_sfty_stock: e.target.value})}
                            />
                          </NumberInput>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </TabPanel>

                  {/* Quality & Documents Tab */}
                  <TabPanel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>BPR Version No</FormLabel>
                          <Input
                            value={formData.bpr_version_no}
                            onChange={(e) => setFormData({...formData, bpr_version_no: e.target.value})}
                            placeholder="Batch Production Record Version"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>BPR Effective Date</FormLabel>
                          <Input
                            type="date"
                            value={formData.bpr_eff_dt}
                            onChange={(e) => setFormData({...formData, bpr_eff_dt: e.target.value})}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>BCR Version No</FormLabel>
                          <Input
                            value={formData.bcr_version_no}
                            onChange={(e) => setFormData({...formData, bcr_version_no: e.target.value})}
                            placeholder="Batch Control Record Version"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>DML Valid Until</FormLabel>
                          <Input
                            type="date"
                            value={formData.dml_valid_upto}
                            onChange={(e) => setFormData({...formData, dml_valid_upto: e.target.value})}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Effective Date</FormLabel>
                          <Input
                            type="date"
                            value={formData.eff_dt}
                            onChange={(e) => setFormData({...formData, eff_dt: e.target.value})}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={3}>
                        <FormControl>
                          <FormLabel>Notes</FormLabel>
                          <Textarea
                            value={formData.note}
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                            placeholder="Additional notes and comments"
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </TabPanel>

                  {/* Raw Materials Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md">Raw Material Details</Heading>
                        <Button colorScheme="blue" onClick={onDetailOpen}>
                          Add Raw Material
                        </Button>
                      </HStack>

                      <Box overflowX="auto">
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Seq</Th>
                              <Th>Raw Material</Th>
                              <Th>Type</Th>
                              <Th>Qty per Batch</Th>
                              <Th>Overage %</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {formData.details.map((detail, index) => (
                              <Tr key={index}>
                                <Td>{detail.seq}</Td>
                                <Td>{detail.raw_code}</Td>
                                <Td>{detail.raw_type}</Td>
                                <Td>{detail.qty_per_batch} {detail.declared_unit}</Td>
                                <Td>{detail.overage || 0}%</Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => {
                                      const updatedDetails = formData.details.filter((_, i) => i !== index);
                                      setFormData({...formData, details: updatedDetails});
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Divider my={6} />

              <HStack spacing={4} justify="end">
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" colorScheme="blue">
                  {selectedBom ? 'Update BOM' : 'Create BOM'}
                </Button>
              </HStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Raw Material Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Raw Material</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Raw Material</FormLabel>
                <Select
                  value={bomDetail.raw_code}
                  onChange={(e) => setBomDetail({...bomDetail, raw_code: e.target.value})}
                >
                  <option value="">Select Raw Material</option>
                  {rawMaterials.map(raw => (
                    <option key={raw.raw_code} value={raw.raw_code}>
                      {raw.raw_desc} ({raw.raw_code})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Raw Material Type</FormLabel>
                <Select
                  value={bomDetail.raw_type}
                  onChange={(e) => setBomDetail({...bomDetail, raw_type: e.target.value})}
                >
                  <option value="">Select Type</option>
                  <option value="API">API</option>
                  <option value="EXC">Excipient</option>
                  <option value="PKG">Packaging</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Quantity per Batch</FormLabel>
                <NumberInput>
                  <NumberInputField
                    value={bomDetail.qty_per_batch}
                    onChange={(e) => setBomDetail({...bomDetail, qty_per_batch: e.target.value})}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Unit</FormLabel>
                <Input
                  value={bomDetail.declared_unit}
                  onChange={(e) => setBomDetail({...bomDetail, declared_unit: e.target.value})}
                  placeholder="e.g., KG, GM, ML"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Overage %</FormLabel>
                <NumberInput>
                  <NumberInputField
                    value={bomDetail.overage}
                    onChange={(e) => setBomDetail({...bomDetail, overage: e.target.value})}
                  />
                </NumberInput>
              </FormControl>

              <HStack spacing={4} w="100%" justify="end">
                <Button onClick={onDetailClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={addBomDetail}>
                  Add Material
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BillOfMaterials;
