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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    sup_code: '',
    sup_name: '',
    address_1: '',
    address_2: '',
    address_3: '',
    address_4: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    contact_person: '',
    mobile: '',
    country_code: '',
    currency: 'USD',
    payment_terms: '',
    credit_limit: '',
    is_active: true
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
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
      } else {
        throw new Error('Failed to fetch suppliers');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch suppliers',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedSupplier ? `/api/suppliers/${selectedSupplier.id}` : '/api/suppliers/';
      const method = selectedSupplier ? 'PUT' : 'POST';
      
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
          description: `Supplier ${selectedSupplier ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchSuppliers();
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save supplier');
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
      const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Supplier deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        fetchSuppliers();
        setSelectedSupplier(null);
      } else {
        throw new Error('Failed to delete supplier');
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

  const openModal = (supplier = null) => {
    setSelectedSupplier(supplier);
    if (supplier) {
      setFormData({ ...supplier });
    } else {
      resetForm();
    }
    onOpen();
  };

  const resetForm = () => {
    setFormData({
      sup_code: '',
      sup_name: '',
      address_1: '',
      address_2: '',
      address_3: '',
      address_4: '',
      phone: '',
      fax: '',
      email: '',
      website: '',
      contact_person: '',
      mobile: '',
      country_code: '',
      currency: 'USD',
      payment_terms: '',
      credit_limit: '',
      is_active: true
    });
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.sup_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.sup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Suppliers Management</Heading>
        <Spacer />
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
            Add Supplier
          </Button>
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Contact Person</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSuppliers.map((supplier) => (
              <Tr key={supplier.id}>
                <Td fontWeight="semibold">{supplier.sup_code}</Td>
                <Td>{supplier.sup_name}</Td>
                <Td>{supplier.contact_person || '-'}</Td>
                <Td>{supplier.phone || '-'}</Td>
                <Td>{supplier.email || '-'}</Td>
                <Td>
                  <Badge colorScheme={supplier.is_active ? 'green' : 'red'}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => openModal(supplier)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setSelectedSupplier(supplier);
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
          <ModalHeader>{selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack width="100%">
                <FormControl isRequired>
                  <FormLabel>Supplier Code</FormLabel>
                  <Input
                    value={formData.sup_code}
                    onChange={(e) => setFormData({ ...formData, sup_code: e.target.value })}
                    placeholder="Enter supplier code"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Supplier Name</FormLabel>
                  <Input
                    value={formData.sup_name}
                    onChange={(e) => setFormData({ ...formData, sup_name: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Contact Person</FormLabel>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Enter contact person"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Mobile</FormLabel>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter mobile number"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address Line 1</FormLabel>
                <Input
                  value={formData.address_1}
                  onChange={(e) => setFormData({ ...formData, address_1: e.target.value })}
                  placeholder="Enter address line 1"
                />
              </FormControl>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Address Line 2</FormLabel>
                  <Input
                    value={formData.address_2}
                    onChange={(e) => setFormData({ ...formData, address_2: e.target.value })}
                    placeholder="Enter address line 2"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Address Line 3</FormLabel>
                  <Input
                    value={formData.address_3}
                    onChange={(e) => setFormData({ ...formData, address_3: e.target.value })}
                    placeholder="Enter address line 3"
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Country Code</FormLabel>
                  <Input
                    value={formData.country_code}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                    placeholder="Enter country code"
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
                    <option value="INR">INR</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Payment Terms</FormLabel>
                  <Input
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="Enter payment terms"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Credit Limit</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    placeholder="Enter credit limit"
                  />
                </FormControl>
              </HStack>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active Status</FormLabel>
                <Switch
                  isChecked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
              {selectedSupplier ? 'Update' : 'Create'}
            </Button>
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
              Delete Supplier
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the supplier "{selectedSupplier?.sup_name}"? 
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
