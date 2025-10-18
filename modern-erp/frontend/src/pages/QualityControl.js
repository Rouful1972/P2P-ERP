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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';

export default function QualityControl() {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [formData, setFormData] = useState({
    test_code: '',
    test_name: '',
    test_category: 'Raw Material',
    test_method: '',
    specification: '',
    acceptance_criteria: '',
    is_active: true
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  const categories = ['All', 'Raw Material', 'Finished Product', 'In-Process', 'Stability'];

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quality-control/tests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        throw new Error('Failed to fetch QC tests');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch quality control tests',
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
      const url = selectedTest ? `/api/quality-control/tests/${selectedTest.id}` : '/api/quality-control/tests';
      const method = selectedTest ? 'PUT' : 'POST';
      
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
          description: `QC test ${selectedTest ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchTests();
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save QC test');
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
      const response = await fetch(`/api/quality-control/tests/${selectedTest.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'QC test deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDeleteClose();
        fetchTests();
        setSelectedTest(null);
      } else {
        throw new Error('Failed to delete QC test');
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

  const openModal = (test = null) => {
    setSelectedTest(test);
    if (test) {
      setFormData({ ...test });
    } else {
      resetForm();
    }
    onOpen();
  };

  const openViewModal = (test) => {
    setSelectedTest(test);
    onViewOpen();
  };

  const resetForm = () => {
    const nextTestCode = `TEST${Date.now().toString().slice(-6)}`;
    setFormData({
      test_code: nextTestCode,
      test_name: '',
      test_category: 'Raw Material',
      test_method: '',
      specification: '',
      acceptance_criteria: '',
      is_active: true
    });
    setSelectedTest(null);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Raw Material': 'blue',
      'Finished Product': 'green',
      'In-Process': 'yellow',
      'Stability': 'purple'
    };
    return colors[category] || 'gray';
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.test_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (test.test_method && test.test_method.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All' || test.test_category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Quality Control Management</Heading>
        <Spacer />
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => openModal()}>
            New Test
          </Button>
        </HStack>
      </Flex>

      <Tabs index={categories.indexOf(activeCategory)} onChange={(index) => setActiveCategory(categories[index])}>
        <TabList>
          {categories.map((category) => (
            <Tab key={category}>{category}</Tab>
          ))}
        </TabList>

        <TabPanels>
          {categories.map((category) => (
            <TabPanel key={category} px={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Test Code</Th>
                      <Th>Test Name</Th>
                      <Th>Category</Th>
                      <Th>Method</Th>
                      <Th>Specification</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredTests.map((test) => (
                      <Tr key={test.id}>
                        <Td fontWeight="semibold">{test.test_code}</Td>
                        <Td>{test.test_name}</Td>
                        <Td>
                          <Badge colorScheme={getCategoryColor(test.test_category)}>
                            {test.test_category}
                          </Badge>
                        </Td>
                        <Td>{test.test_method || '-'}</Td>
                        <Td maxW="200px" isTruncated>{test.specification || '-'}</Td>
                        <Td>
                          <Badge colorScheme={test.is_active ? 'green' : 'red'}>
                            {test.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <IconButton
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              onClick={() => openViewModal(test)}
                            />
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => openModal(test)}
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => {
                                setSelectedTest(test);
                                onDeleteOpen();
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {filteredTests.length === 0 && (
                  <Text textAlign="center" py={8} color="gray.500">
                    No tests found for the selected category and search criteria.
                  </Text>
                )}
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedTest ? 'Edit QC Test' : 'New QC Test'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack width="100%">
                <FormControl isRequired>
                  <FormLabel>Test Code</FormLabel>
                  <Input
                    value={formData.test_code}
                    onChange={(e) => setFormData({ ...formData, test_code: e.target.value })}
                    placeholder="Enter test code"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Test Name</FormLabel>
                  <Input
                    value={formData.test_name}
                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                    placeholder="Enter test name"
                  />
                </FormControl>
              </HStack>

              <HStack width="100%">
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={formData.test_category}
                    onChange={(e) => setFormData({ ...formData, test_category: e.target.value })}
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Finished Product">Finished Product</option>
                    <option value="In-Process">In-Process</option>
                    <option value="Stability">Stability</option>
                    <option value="Microbiological">Microbiological</option>
                    <option value="Environmental">Environmental</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Test Method</FormLabel>
                  <Input
                    value={formData.test_method}
                    onChange={(e) => setFormData({ ...formData, test_method: e.target.value })}
                    placeholder="Enter test method"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Specification</FormLabel>
                <Textarea
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  placeholder="Enter specification details"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Acceptance Criteria</FormLabel>
                <Textarea
                  value={formData.acceptance_criteria}
                  onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                  placeholder="Enter acceptance criteria"
                  rows={3}
                />
              </FormControl>

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
              {selectedTest ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>QC Test Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTest && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Basic Information</Heading>
                  <HStack spacing={8}>
                    <Text><strong>Test Code:</strong> {selectedTest.test_code}</Text>
                    <Text><strong>Status:</strong> <Badge colorScheme={selectedTest.is_active ? 'green' : 'red'}>{selectedTest.is_active ? 'Active' : 'Inactive'}</Badge></Text>
                  </HStack>
                  <HStack spacing={8} mt={2}>
                    <Text><strong>Test Name:</strong> {selectedTest.test_name}</Text>
                    <Text><strong>Category:</strong> <Badge colorScheme={getCategoryColor(selectedTest.test_category)}>{selectedTest.test_category}</Badge></Text>
                  </HStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Test Method</Heading>
                  <Text>{selectedTest.test_method || 'Not specified'}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Specification</Heading>
                  <Text whiteSpace="pre-wrap">{selectedTest.specification || 'Not specified'}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>Acceptance Criteria</Heading>
                  <Text whiteSpace="pre-wrap">{selectedTest.acceptance_criteria || 'Not specified'}</Text>
                </Box>

                <Box>
                  <Heading size="sm" mb={2}>System Information</Heading>
                  <Text><strong>Created By:</strong> {selectedTest.created_by || '-'}</Text>
                  <Text><strong>Created At:</strong> {new Date(selectedTest.created_at).toLocaleString()}</Text>
                  <Text><strong>Updated At:</strong> {new Date(selectedTest.updated_at).toLocaleString()}</Text>
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
              Delete QC Test
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the QC test "{selectedTest?.test_name}"? 
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
