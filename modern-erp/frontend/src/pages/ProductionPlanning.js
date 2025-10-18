import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
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
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  useToast,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Flex,
  Spacer,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  NumberInput,
  NumberInputField,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';

export default function ProductionPlanning() {
  const [productionPlans, setProductionPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_no: '',
    plan_date: new Date().toISOString().split('T')[0],
    product_code: '',
    planned_quantity: 0,
    unit_of_measure: '',
    planned_start_date: '',
    planned_end_date: '',
    priority: 'Normal',
    status: 'Planned',
    batch_size: 0,
    number_of_batches: 0,
    remarks: ''
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    fetchProductionPlans();
    fetchProducts();
  }, []);

  const fetchProductionPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production-planning/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductionPlans(data);
      } else {
        throw new Error('Failed to fetch production plans');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch production plans',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedPlan ? `/api/production-planning/plans/${selectedPlan.id}` : '/api/production-planning/plans';
      const method = selectedPlan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Production plan ${selectedPlan ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchProductionPlans();
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save production plan');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production-planning/plans/${selectedPlan.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Production plan deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        fetchProductionPlans();
        setSelectedPlan(null);
      } else {
        throw new Error('Failed to delete production plan');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (planId, newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production-planning/plans/${planId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Status updated to ${newStatus}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchProductionPlans();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (plan = null) => {
    setSelectedPlan(plan);
    if (plan) {
      setFormData({ 
        ...plan,
        plan_date: plan.plan_date?.split('T')[0] || '',
        planned_start_date: plan.planned_start_date?.split('T')[0] || '',
        planned_end_date: plan.planned_end_date?.split('T')[0] || ''
      });
    } else {
      resetForm();
    }
    onOpen();
  };

  const openViewModal = (plan) => {
    setSelectedPlan(plan);
    onViewOpen();
  };

  const resetForm = () => {
    const nextPlanNo = `PLAN${Date.now().toString().slice(-6)}`;
    setFormData({
      plan_no: nextPlanNo,
      plan_date: new Date().toISOString().split('T')[0],
      product_code: '',
      planned_quantity: 0,
      unit_of_measure: '',
      planned_start_date: '',
      planned_end_date: '',
      priority: 'Normal',
      status: 'Planned',
      batch_size: 0,
      number_of_batches: 0,
      remarks: ''
    });
    setSelectedPlan(null);
  };

  const calculateBatches = (totalQuantity, batchSize) => {
    if (batchSize > 0) {
      return Math.ceil(totalQuantity / batchSize);
    }
    return 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'blue',
      'In Progress': 'yellow',
      'Completed': 'green',
      'Cancelled': 'red',
      'On Hold': 'orange'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'gray',
      'Normal': 'blue',
      'High': 'orange',
      'Urgent': 'red'
    };
    return colors[priority] || 'gray';
  };

  const getProductName = (productCode) => {
    const product = products.find(p => p.product_code === productCode);
    return product ? product.product_name : productCode;
  };

  const filteredPlans = productionPlans.filter(plan =>
    plan.plan_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProductName(plan.product_code).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Production Planning</Heading>
        <Spacer />
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
            New Plan
          </Button>
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Plan No.</Th>
              <Th>Product</Th>
              <Th>Planned Qty</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPlans.map((plan) => (
              <Tr key={plan.id}>
                <Td fontWeight="semibold">{plan.plan_no}</Td>
                <Td>{getProductName(plan.product_code)}</Td>
                <Td>{plan.planned_quantity} {plan.unit_of_measure}</Td>
                <Td>{plan.planned_start_date ? new Date(plan.planned_start_date).toLocaleDateString() : '-'}</Td>
                <Td>{plan.planned_end_date ? new Date(plan.planned_end_date).toLocaleDateString() : '-'}</Td>
                <Td>
                  <Badge colorScheme={getPriorityColor(plan.priority)}>
                    {plan.priority}
                  </Badge>
                </Td>
                <Td>
                  <Select
                    size="sm"
                    value={plan.status}
                    onChange={(e) => updateStatus(plan.id, e.target.value)}
                    variant="filled"
                    colorScheme={getStatusColor(plan.status)}
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="On Hold">On Hold</option>
                  </Select>
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => openViewModal(plan)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => openModal(plan)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setSelectedPlan(plan);
                        onDeleteOpen();
                      }}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedPlan ? 'Edit Production Plan' : 'New Production Plan'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Plan Number</FormLabel>
                    <Input
                      value={formData.plan_no}
                      onChange={(e) => setFormData({ ...formData, plan_no: e.target.value })}
                      placeholder="Enter plan number"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Plan Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.plan_date}
                      onChange={(e) => setFormData({ ...formData, plan_date: e.target.value })}
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <FormControl isRequired>
                <FormLabel>Product</FormLabel>
                <Select
                  value={formData.product_code}
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                  placeholder="Select product"
                >
                  {products.map((product) => (
                    <option key={product.product_code} value={product.product_code}>
                      {product.product_code} - {product.product_name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Planned Quantity</FormLabel>
                    <NumberInput
                      value={formData.planned_quantity}
                      onChange={(value) => {
                        const qty = parseFloat(value) || 0;
                        setFormData({ 
                          ...formData, 
                          planned_quantity: qty,
                          number_of_batches: calculateBatches(qty, formData.batch_size)
                        });
                      }}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Unit of Measure</FormLabel>
                    <Input
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                      placeholder="Enter unit"
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                <GridItem>
                  <FormControl>
                    <FormLabel>Planned Start Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.planned_start_date}
                      onChange={(e) => setFormData({ ...formData, planned_start_date: e.target.value })}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Planned End Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.planned_end_date}
                      onChange={(e) => setFormData({ ...formData, planned_end_date: e.target.value })}
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                <GridItem>
                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="On Hold">On Hold</option>
                    </Select>
                  </FormControl>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                <GridItem>
                  <FormControl>
                    <FormLabel>Batch Size</FormLabel>
                    <NumberInput
                      value={formData.batch_size}
                      onChange={(value) => {
                        const batchSize = parseFloat(value) || 0;
                        setFormData({ 
                          ...formData, 
                          batch_size: batchSize,
                          number_of_batches: calculateBatches(formData.planned_quantity, batchSize)
                        });
                      }}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Number of Batches</FormLabel>
                    <NumberInput
                      value={formData.number_of_batches}
                      onChange={(value) => setFormData({ ...formData, number_of_batches: parseInt(value) || 0 })}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </GridItem>
              </Grid>

              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter remarks"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
              {selectedPlan ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Production Plan Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPlan && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Plan Information</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Plan No:</strong> {selectedPlan.plan_no}</Text>
                    <Text><strong>Date:</strong> {new Date(selectedPlan.plan_date).toLocaleDateString()}</Text>
                  </HStack>
                  <HStack spacing={8} mt={2}>
                    <Text><strong>Priority:</strong> <Badge colorScheme={getPriorityColor(selectedPlan.priority)}>{selectedPlan.priority}</Badge></Text>
                    <Text><strong>Status:</strong> <Badge colorScheme={getStatusColor(selectedPlan.status)}>{selectedPlan.status}</Badge></Text>
                  </HStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Product Information</Heading>
                  <Text><strong>Product:</strong> {getProductName(selectedPlan.product_code)}</Text>
                  <Text><strong>Planned Quantity:</strong> {selectedPlan.planned_quantity} {selectedPlan.unit_of_measure}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Schedule</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Start Date:</strong> {selectedPlan.planned_start_date ? new Date(selectedPlan.planned_start_date).toLocaleDateString() : '-'}</Text>
                    <Text><strong>End Date:</strong> {selectedPlan.planned_end_date ? new Date(selectedPlan.planned_end_date).toLocaleDateString() : '-'}</Text>
                  </HStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Batch Information</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Batch Size:</strong> {selectedPlan.batch_size || '-'}</Text>
                    <Text><strong>Number of Batches:</strong> {selectedPlan.number_of_batches || '-'}</Text>
                  </HStack>
                </Box>

                {selectedPlan.remarks && (
                  <Box>
                    <Heading size="sm" mb={2}>Remarks</Heading>
                    <Text>{selectedPlan.remarks}</Text>
                  </Box>
                )}

                <Box>
                  <Heading size="sm" mb={2}>System Information</Heading>
                  <Text><strong>Created By:</strong> {selectedPlan.created_by || '-'}</Text>
                  <Text><strong>Created At:</strong> {new Date(selectedPlan.created_at).toLocaleString()}</Text>
                  <Text><strong>Updated At:</strong> {new Date(selectedPlan.updated_at).toLocaleString()}</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Production Plan
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete production plan "{selectedPlan?.plan_no}"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={loading}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
