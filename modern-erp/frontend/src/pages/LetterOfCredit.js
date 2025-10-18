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
  Switch,
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
  Checkbox,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';

export default function LetterOfCredit() {
  const [letterOfCredits, setLetterOfCredits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLC, setSelectedLC] = useState(null);
  const [formData, setFormData] = useState({
    lc_no: '',
    lc_date: new Date().toISOString().split('T')[0],
    sup_code: '',
    bank_code: '',
    lc_amount: 0,
    currency: 'USD',
    expiry_date: '',
    latest_shipment_date: '',
    payment_terms: '',
    delivery_terms: '',
    port_of_loading: '',
    port_of_discharge: '',
    partial_shipment: true,
    transhipment: true,
    status: 'Open',
    remarks: '',
    items: []
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    fetchLetterOfCredits();
    fetchSuppliers();
    fetchRawMaterials();
  }, []);

  const fetchLetterOfCredits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/letter-of-credit/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLetterOfCredits(data);
      } else {
        throw new Error('Failed to fetch Letter of Credits');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch Letter of Credits',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/suppliers/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
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
      const url = selectedLC ? `/api/letter-of-credit/${selectedLC.id}` : '/api/letter-of-credit/';
      const method = selectedLC ? 'PUT' : 'POST';
      
      // Calculate total amount from items
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const submitData = { ...formData, lc_amount: totalAmount };
      
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
          description: `Letter of Credit ${selectedLC ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchLetterOfCredits();
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save Letter of Credit');
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
      const response = await fetch(`/api/letter-of-credit/${selectedLC.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Letter of Credit deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        fetchLetterOfCredits();
        setSelectedLC(null);
      } else {
        throw new Error('Failed to delete Letter of Credit');
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

  const updateStatus = async (lcId, newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/letter-of-credit/${lcId}/status?status=${newStatus}`, {
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
        fetchLetterOfCredits();
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

  const openModal = (lc = null) => {
    setSelectedLC(lc);
    if (lc) {
      setFormData({ 
        ...lc,
        lc_date: lc.lc_date?.split('T')[0] || '',
        expiry_date: lc.expiry_date?.split('T')[0] || '',
        latest_shipment_date: lc.latest_shipment_date?.split('T')[0] || '',
        items: lc.items || []
      });
    } else {
      resetForm();
    }
    onOpen();
  };

  const openViewModal = (lc) => {
    setSelectedLC(lc);
    onViewOpen();
  };

  const resetForm = () => {
    const nextLCNo = `LC${Date.now().toString().slice(-6)}`;
    setFormData({
      lc_no: nextLCNo,
      lc_date: new Date().toISOString().split('T')[0],
      sup_code: '',
      bank_code: '',
      lc_amount: 0,
      currency: 'USD',
      expiry_date: '',
      latest_shipment_date: '',
      payment_terms: '',
      delivery_terms: '',
      port_of_loading: '',
      port_of_discharge: '',
      partial_shipment: true,
      transhipment: true,
      status: 'Open',
      remarks: '',
      items: []
    });
    setSelectedLC(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        raw_code: '',
        quantity: 0,
        unit_of_measure: '',
        unit_price: 0,
        amount: 0,
        tolerance_percentage: 0
      }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    
    // Calculate amount when quantity or unit price changes
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'green',
      'Amended': 'yellow',
      'Closed': 'gray',
      'Expired': 'red',
      'Cancelled': 'red'
    };
    return colors[status] || 'gray';
  };

  const getSupplierName = (supCode) => {
    const supplier = suppliers.find(s => s.sup_code === supCode);
    return supplier ? supplier.sup_name : supCode;
  };

  const filteredLCs = letterOfCredits.filter(lc =>
    lc.lc_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lc.sup_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSupplierName(lc.sup_code).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Letter of Credit Management</Heading>
        <Spacer />
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search LCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
            New LC
          </Button>
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>LC No.</Th>
              <Th>Date</Th>
              <Th>Supplier</Th>
              <Th>Amount</Th>
              <Th>Currency</Th>
              <Th>Expiry Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredLCs.map((lc) => (
              <Tr key={lc.id}>
                <Td fontWeight="semibold">{lc.lc_no}</Td>
                <Td>{new Date(lc.lc_date).toLocaleDateString()}</Td>
                <Td>{getSupplierName(lc.sup_code)}</Td>
                <Td>{lc.lc_amount ? lc.lc_amount.toFixed(2) : '0.00'}</Td>
                <Td>{lc.currency}</Td>
                <Td>{lc.expiry_date ? new Date(lc.expiry_date).toLocaleDateString() : '-'}</Td>
                <Td>
                  <Select
                    size="sm"
                    value={lc.status}
                    onChange={(e) => updateStatus(lc.id, e.target.value)}
                    variant="filled"
                    colorScheme={getStatusColor(lc.status)}
                  >
                    <option value="Open">Open</option>
                    <option value="Amended">Amended</option>
                    <option value="Closed">Closed</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => openViewModal(lc)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => openModal(lc)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setSelectedLC(lc);
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
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="95vw">
          <ModalHeader>{selectedLC ? 'Edit Letter of Credit' : 'New Letter of Credit'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              {/* Header Information */}
              <Box width="100%">
                <Heading size="md" mb={4}>LC Information</Heading>
                <HStack spacing={4} mb={4}>
                  <FormControl isRequired>
                    <FormLabel>LC Number</FormLabel>
                    <Input
                      value={formData.lc_no}
                      onChange={(e) => setFormData({ ...formData, lc_no: e.target.value })}
                      placeholder="Enter LC number"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>LC Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.lc_date}
                      onChange={(e) => setFormData({ ...formData, lc_date: e.target.value })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      value={formData.sup_code}
                      onChange={(e) => setFormData({ ...formData, sup_code: e.target.value })}
                      placeholder="Select supplier"
                    >
                      {suppliers.map((supplier) => (
                        <option key={supplier.sup_code} value={supplier.sup_code}>
                          {supplier.sup_code} - {supplier.sup_name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel>Bank Code</FormLabel>
                    <Input
                      value={formData.bank_code}
                      onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                      placeholder="Enter bank code"
                    />
                  </FormControl>
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
                      <option value="Open">Open</option>
                      <option value="Amended">Amended</option>
                      <option value="Closed">Closed</option>
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel>Expiry Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Latest Shipment Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.latest_shipment_date}
                      onChange={(e) => setFormData({ ...formData, latest_shipment_date: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel>Port of Loading</FormLabel>
                    <Input
                      value={formData.port_of_loading}
                      onChange={(e) => setFormData({ ...formData, port_of_loading: e.target.value })}
                      placeholder="Enter port of loading"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Port of Discharge</FormLabel>
                    <Input
                      value={formData.port_of_discharge}
                      onChange={(e) => setFormData({ ...formData, port_of_discharge: e.target.value })}
                      placeholder="Enter port of discharge"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel>Payment Terms</FormLabel>
                    <Input
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                      placeholder="Enter payment terms"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Delivery Terms</FormLabel>
                    <Input
                      value={formData.delivery_terms}
                      onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
                      placeholder="Enter delivery terms"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={8} mb={4}>
                  <Checkbox
                    isChecked={formData.partial_shipment}
                    onChange={(e) => setFormData({ ...formData, partial_shipment: e.target.checked })}
                  >
                    Partial Shipment Allowed
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.transhipment}
                    onChange={(e) => setFormData({ ...formData, transhipment: e.target.checked })}
                  >
                    Transhipment Allowed
                  </Checkbox>
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
                  <Heading size="md">LC Items</Heading>
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
                      <FormControl>
                        <FormLabel>Unit of Measure</FormLabel>
                        <Input
                          value={item.unit_of_measure}
                          onChange={(e) => updateItem(index, 'unit_of_measure', e.target.value)}
                          placeholder="Unit"
                        />
                      </FormControl>
                    </HStack>
                    <HStack spacing={4}>
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
                        <FormLabel>Amount</FormLabel>
                        <Input value={item.amount.toFixed(2)} isReadOnly />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Tolerance %</FormLabel>
                        <NumberInput
                          value={item.tolerance_percentage}
                          onChange={(value) => updateItem(index, 'tolerance_percentage', parseFloat(value) || 0)}
                          min={0}
                          max={100}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      <Button colorScheme="red" size="sm" onClick={() => removeItem(index)} mt={8}>
                        Remove
                      </Button>
                    </HStack>
                  </Box>
                ))}

                {formData.items.length === 0 && (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No items added yet. Click "Add Item" to start adding LC items.
                  </Text>
                )}

                {formData.items.length > 0 && (
                  <Box textAlign="right" mt={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      Total Amount: {formData.currency} {formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </Text>
                  </Box>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
              {selectedLC ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Letter of Credit Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLC && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>LC Information</Heading>
                  <HStack spacing={8}>
                    <Text><strong>LC No:</strong> {selectedLC.lc_no}</Text>
                    <Text><strong>Date:</strong> {new Date(selectedLC.lc_date).toLocaleDateString()}</Text>
                    <Text><strong>Status:</strong> <Badge colorScheme={getStatusColor(selectedLC.status)}>{selectedLC.status}</Badge></Text>
                  </HStack>
                  <HStack spacing={8} mt={2}>
                    <Text><strong>Supplier:</strong> {getSupplierName(selectedLC.sup_code)}</Text>
                    <Text><strong>Amount:</strong> {selectedLC.currency} {selectedLC.lc_amount}</Text>
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
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedLC.items?.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.raw_code}</Td>
                          <Td>{item.quantity} {item.unit_of_measure}</Td>
                          <Td>{item.unit_price}</Td>
                          <Td>{item.amount}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {selectedLC.remarks && (
                  <Box>
                    <Heading size="sm" mb={2}>Remarks</Heading>
                    <Text>{selectedLC.remarks}</Text>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Letter of Credit
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete LC "{selectedLC?.lc_no}"? 
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
