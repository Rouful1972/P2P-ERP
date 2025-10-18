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
  Divider,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';

export default function PurchaseRequisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [formData, setFormData] = useState({
    req_no: '',
    req_date: new Date().toISOString().split('T')[0],
    department: '',
    requested_by: '',
    priority: 'Medium',
    status: 'Draft',
    currency: 'USD',
    required_date: '',
    remarks: '',
    items: []
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    fetchRequisitions();
    fetchRawMaterials();
  }, []);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/procurement/requisitions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequisitions(data);
      } else {
        throw new Error('Failed to fetch requisitions');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch purchase requisitions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/raw-materials/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRawMaterials(data);
      }
    } catch (error) {
      console.error('Failed to fetch raw materials:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedRequisition ? `/api/procurement/requisitions/${selectedRequisition.id}` : '/api/procurement/requisitions';
      const method = selectedRequisition ? 'PUT' : 'POST';
      
      // Calculate total amount
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const submitData = { ...formData, total_amount: totalAmount };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Purchase requisition ${selectedRequisition ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchRequisitions();
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save purchase requisition');
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

  const updateStatus = async (reqId, newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/procurement/requisitions/${reqId}/status?status=${newStatus}`, {
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
        fetchRequisitions();
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

  const openModal = (requisition = null) => {
    setSelectedRequisition(requisition);
    if (requisition) {
      setFormData({ 
        ...requisition,
        req_date: requisition.req_date?.split('T')[0] || '',
        required_date: requisition.required_date?.split('T')[0] || '',
        items: requisition.items || []
      });
    } else {
      resetForm();
    }
    onOpen();
  };

  const openViewModal = (requisition) => {
    setSelectedRequisition(requisition);
    onViewOpen();
  };

  const resetForm = () => {
    const nextReqNo = `REQ${Date.now().toString().slice(-6)}`;
    setFormData({
      req_no: nextReqNo,
      req_date: new Date().toISOString().split('T')[0],
      department: '',
      requested_by: '',
      priority: 'Medium',
      status: 'Draft',
      currency: 'USD',
      required_date: '',
      remarks: '',
      items: []
    });
    setSelectedRequisition(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        raw_code: '',
        raw_name: '',
        quantity: 0,
        unit_price: 0,
        total_price: 0,
        remarks: ''
      }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    
    // Update raw material name when code changes
    if (field === 'raw_code') {
      const rawMaterial = rawMaterials.find(rm => rm.raw_code === value);
      if (rawMaterial) {
        updatedItems[index].raw_name = rawMaterial.raw_name;
      }
    }
    
    // Calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'gray',
      'Submitted': 'yellow',
      'Approved': 'green',
      'Rejected': 'red',
      'Cancelled': 'red'
    };
    return colors[status] || 'gray';
  };

  const filteredRequisitions = requisitions.filter(req =>
    req.req_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requested_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Purchase Requisitions</Heading>
        <Spacer />
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
            New Requisition
          </Button>
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Req. No.</Th>
              <Th>Date</Th>
              <Th>Department</Th>
              <Th>Requested By</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Total Amount</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRequisitions.map((req) => (
              <Tr key={req.id}>
                <Td fontWeight="semibold">{req.req_no}</Td>
                <Td>{new Date(req.req_date).toLocaleDateString()}</Td>
                <Td>{req.department}</Td>
                <Td>{req.requested_by}</Td>
                <Td>
                  <Badge colorScheme={req.priority === 'High' ? 'red' : req.priority === 'Medium' ? 'yellow' : 'green'}>
                    {req.priority}
                  </Badge>
                </Td>
                <Td>
                  <Select
                    size="sm"
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    variant="filled"
                    colorScheme={getStatusColor(req.status)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </Td>
                <Td>{req.total_amount ? `${req.currency} ${req.total_amount.toFixed(2)}` : '-'}</Td>
                <Td>
                  <HStack>
                    <IconButton
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => openViewModal(req)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => openModal(req)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>{selectedRequisition ? 'Edit Purchase Requisition' : 'New Purchase Requisition'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              {/* Header Information */}
              <Box width="100%">
                <Heading size="md" mb={4}>Header Information</Heading>
                <HStack spacing={4} mb={4}>
                  <FormControl isRequired>
                    <FormLabel>Requisition No.</FormLabel>
                    <Input
                      value={formData.req_no}
                      onChange={(e) => setFormData({ ...formData, req_no: e.target.value })}
                      placeholder="Enter requisition number"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Requisition Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.req_date}
                      onChange={(e) => setFormData({ ...formData, req_date: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Required Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.required_date}
                      onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} mb={4}>
                  <FormControl isRequired>
                    <FormLabel>Department</FormLabel>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Enter department"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Requested By</FormLabel>
                    <Input
                      value={formData.requested_by}
                      onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                      placeholder="Enter requester name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="BDT">BDT</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Remarks</FormLabel>
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter remarks"
                  />
                </FormControl>
              </Box>

              <Divider />

              {/* Items Section */}
              <Box width="100%">
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Requisition Items</Heading>
                  <Button size="sm" colorScheme="green" onClick={addItem}>
                    Add Item
                  </Button>
                </Flex>

                {formData.items.map((item, index) => (
                  <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md" mb={4}>
                    <HStack spacing={4} mb={2}>
                      <FormControl isRequired>
                        <FormLabel>Raw Material</FormLabel>
                        <Select
                          value={item.raw_code}
                          onChange={(e) => updateItem(index, 'raw_code', e.target.value)}
                          placeholder="Select raw material"
                        >
                          {rawMaterials.map((rm) => (
                            <option key={rm.raw_code} value={rm.raw_code}>
                              {rm.raw_code} - {rm.raw_name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput
                          value={item.quantity}
                          onChange={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
                          min={0}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Unit Price</FormLabel>
                        <NumberInput
                          value={item.unit_price}
                          onChange={(value) => updateItem(index, 'unit_price', parseFloat(value) || 0)}
                          min={0}
                          precision={2}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Total Price</FormLabel>
                        <Input value={item.total_price.toFixed(2)} isReadOnly />
                      </FormControl>
                      <Button colorScheme="red" size="sm" onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    </HStack>
                    <FormControl>
                      <FormLabel>Item Remarks</FormLabel>
                      <Input
                        value={item.remarks}
                        onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                        placeholder="Enter item remarks"
                      />
                    </FormControl>
                  </Box>
                ))}

                {formData.items.length === 0 && (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No items added yet. Click "Add Item" to start adding requisition items.
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
              {selectedRequisition ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Purchase Requisition Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequisition && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Basic Information</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Req. No:</strong> {selectedRequisition.req_no}</Text>
                    <Text><strong>Date:</strong> {new Date(selectedRequisition.req_date).toLocaleDateString()}</Text>
                    <Text><strong>Status:</strong> <Badge colorScheme={getStatusColor(selectedRequisition.status)}>{selectedRequisition.status}</Badge></Text>
                  </HStack>
                  <HStack spacing={8} mt={2}>
                    <Text><strong>Department:</strong> {selectedRequisition.department}</Text>
                    <Text><strong>Requested By:</strong> {selectedRequisition.requested_by}</Text>
                    <Text><strong>Priority:</strong> {selectedRequisition.priority}</Text>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <Heading size="sm" mb={2}>Items</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Raw Material</Th>
                        <Th>Quantity</Th>
                        <Th>Unit Price</Th>
                        <Th>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedRequisition.items?.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.raw_code} - {item.raw_name}</Td>
                          <Td>{item.quantity}</Td>
                          <Td>{item.unit_price}</Td>
                          <Td>{item.total_price}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {selectedRequisition.remarks && (
                  <Box>
                    <Heading size="sm" mb={2}>Remarks</Heading>
                    <Text>{selectedRequisition.remarks}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
