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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';

export default function DrugRegistration() {
  const [registrations, setRegistrations] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [formData, setFormData] = useState({
    drug_letter_ref_no: '',
    drug_letter_date: '',
    product_code: '',
    registration_type: 'New',
    application_date: '',
    approval_date: '',
    expiry_date: '',
    registration_number: '',
    status: 'Applied',
    regulatory_authority: '',
    remarks: ''
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    fetchRegistrations();
    fetchProducts();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/drug-management/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        throw new Error('Failed to fetch drug registrations');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch drug registrations',
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
      const url = selectedRegistration ? `/api/drug-management/registrations/${selectedRegistration.id}` : '/api/drug-management/registrations';
      const method = selectedRegistration ? 'PUT' : 'POST';
      
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
          description: `Drug registration ${selectedRegistration ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchRegistrations();
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save drug registration');
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
      const response = await fetch(`/api/drug-management/registrations/${selectedRegistration.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Drug registration deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        fetchRegistrations();
        setSelectedRegistration(null);
      } else {
        throw new Error('Failed to delete drug registration');
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

  const updateStatus = async (registrationId, newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/drug-management/registrations/${registrationId}/status?status=${newStatus}`, {
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
        fetchRegistrations();
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

  const openModal = (registration = null) => {
    setSelectedRegistration(registration);
    if (registration) {
      setFormData({ 
        ...registration,
        drug_letter_date: registration.drug_letter_date?.split('T')[0] || '',
        application_date: registration.application_date?.split('T')[0] || '',
        approval_date: registration.approval_date?.split('T')[0] || '',
        expiry_date: registration.expiry_date?.split('T')[0] || ''
      });
    } else {
      resetForm();
    }
    onOpen();
  };

  const openViewModal = (registration) => {
    setSelectedRegistration(registration);
    onViewOpen();
  };

  const resetForm = () => {
    const nextRefNo = `REG${Date.now().toString().slice(-6)}`;
    setFormData({
      drug_letter_ref_no: nextRefNo,
      drug_letter_date: '',
      product_code: '',
      registration_type: 'New',
      application_date: '',
      approval_date: '',
      expiry_date: '',
      registration_number: '',
      status: 'Applied',
      regulatory_authority: '',
      remarks: ''
    });
    setSelectedRegistration(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'blue',
      'Under Review': 'yellow',
      'Approved': 'green',
      'Rejected': 'red',
      'Expired': 'gray',
      'Cancelled': 'red'
    };
    return colors[status] || 'gray';
  };

  const getProductName = (productCode) => {
    const product = products.find(p => p.product_code === productCode);
    return product ? product.product_name : productCode;
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.drug_letter_ref_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reg.registration_number && reg.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Drug Registration Management</Heading>
        <Spacer />
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
            New Registration
          </Button>
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Ref. No.</Th>
              <Th>Product</Th>
              <Th>Type</Th>
              <Th>Application Date</Th>
              <Th>Status</Th>
              <Th>Approval Date</Th>
              <Th>Expiry Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRegistrations.map((reg) => (
              <Tr key={reg.id}>
                <Td fontWeight="semibold">{reg.drug_letter_ref_no}</Td>
                <Td>{getProductName(reg.product_code)}</Td>
                <Td>{reg.registration_type}</Td>
                <Td>{reg.application_date ? new Date(reg.application_date).toLocaleDateString() : '-'}</Td>
                <Td>
                  <Select
                    size="sm"
                    value={reg.status}
                    onChange={(e) => updateStatus(reg.id, e.target.value)}
                    variant="filled"
                    colorScheme={getStatusColor(reg.status)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </Td>
                <Td>{reg.approval_date ? new Date(reg.approval_date).toLocaleDateString() : '-'}</Td>
                <Td>{reg.expiry_date ? new Date(reg.expiry_date).toLocaleDateString() : '-'}</Td>
                <Td>
                  <HStack>
                    <IconButton
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => openViewModal(reg)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => openModal(reg)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setSelectedRegistration(reg);
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
          <ModalHeader>{selectedRegistration ? 'Edit Drug Registration' : 'New Drug Registration'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack width="100%">
                <FormControl isRequired>
                  <FormLabel>Reference No.</FormLabel>
                  <Input
                    value={formData.drug_letter_ref_no}
                    onChange={(e) => setFormData({ ...formData, drug_letter_ref_no: e.target.value })}
                    placeholder="Enter reference number"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Letter Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.drug_letter_date}
                    onChange={(e) => setFormData({ ...formData, drug_letter_date: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
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
                <FormControl>
                  <FormLabel>Registration Type</FormLabel>
                  <Select
                    value={formData.registration_type}
                    onChange={(e) => setFormData({ ...formData, registration_type: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Variation">Variation</option>
                    <option value="Transfer">Transfer</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Application Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.application_date}
                    onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Approval Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.approval_date}
                    onChange={(e) => setFormData({ ...formData, approval_date: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Registration Number</FormLabel>
                  <Input
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="Enter registration number"
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Regulatory Authority</FormLabel>
                  <Input
                    value={formData.regulatory_authority}
                    onChange={(e) => setFormData({ ...formData, regulatory_authority: e.target.value })}
                    placeholder="Enter regulatory authority"
                  />
                </FormControl>
              </HStack>

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
              {selectedRegistration ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Drug Registration Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRegistration && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Basic Information</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Ref. No:</strong> {selectedRegistration.drug_letter_ref_no}</Text>
                    <Text><strong>Status:</strong> <Badge colorScheme={getStatusColor(selectedRegistration.status)}>{selectedRegistration.status}</Badge></Text>
                  </HStack>
                  <HStack spacing={8} mt={2}>
                    <Text><strong>Product:</strong> {getProductName(selectedRegistration.product_code)}</Text>
                    <Text><strong>Type:</strong> {selectedRegistration.registration_type}</Text>
                  </HStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Dates</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Letter Date:</strong> {selectedRegistration.drug_letter_date ? new Date(selectedRegistration.drug_letter_date).toLocaleDateString() : '-'}</Text>
                    <Text><strong>Application:</strong> {selectedRegistration.application_date ? new Date(selectedRegistration.application_date).toLocaleDateString() : '-'}</Text>
                  </HStack>
                  <HStack spacing={8} mt={2}>
                    <Text><strong>Approval:</strong> {selectedRegistration.approval_date ? new Date(selectedRegistration.approval_date).toLocaleDateString() : '-'}</Text>
                    <Text><strong>Expiry:</strong> {selectedRegistration.expiry_date ? new Date(selectedRegistration.expiry_date).toLocaleDateString() : '-'}</Text>
                  </HStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Registration Details</Heading>
                  <Text><strong>Registration Number:</strong> {selectedRegistration.registration_number || '-'}</Text>
                  <Text><strong>Regulatory Authority:</strong> {selectedRegistration.regulatory_authority || '-'}</Text>
                </Box>

                {selectedRegistration.remarks && (
                  <Box>
                    <Heading size="sm" mb={2}>Remarks</Heading>
                    <Text>{selectedRegistration.remarks}</Text>
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
              Delete Drug Registration
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the drug registration "{selectedRegistration?.drug_letter_ref_no}"? 
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
