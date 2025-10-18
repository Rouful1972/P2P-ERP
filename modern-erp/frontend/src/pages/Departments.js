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
  Textarea,
  Switch,
  useDisclosure,
  useToast,
  Heading,
  Text,
  Badge,
  IconButton,
  HStack,
  VStack
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    dept_code: '',
    dept_name: '',
    dept_desc: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/departments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch departments',
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
      const url = selectedDepartment 
        ? `/api/departments/${selectedDepartment.dept_code}`
        : '/api/departments/';
      
      const method = selectedDepartment ? 'PUT' : 'POST';
      
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
          description: `Department ${selectedDepartment ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchDepartments();
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

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setFormData({
      dept_code: department.dept_code,
      dept_name: department.dept_name,
      dept_desc: department.dept_desc || '',
      is_active: department.is_active
    });
    onOpen();
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    setFormData({
      dept_code: '',
      dept_name: '',
      dept_desc: '',
      is_active: true
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedDepartment(null);
    setFormData({
      dept_code: '',
      dept_name: '',
      dept_desc: '',
      is_active: true
    });
    onClose();
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Department Management</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={handleAdd}
          >
            Add Department
          </Button>
        </HStack>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Department Code</Th>
                  <Th>Department Name</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {departments.map((department) => (
                  <Tr key={department.dept_code}>
                    <Td fontWeight="bold">{department.dept_code}</Td>
                    <Td>{department.dept_name}</Td>
                    <Td>{department.dept_desc || '-'}</Td>
                    <Td>
                      <Badge colorScheme={department.is_active ? 'green' : 'red'}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEdit(department)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedDepartment ? 'Edit Department' : 'Add Department'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Department Code</FormLabel>
                  <Input
                    value={formData.dept_code}
                    onChange={(e) => setFormData({...formData, dept_code: e.target.value})}
                    placeholder="e.g., 055, 080, 097"
                    disabled={!!selectedDepartment}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Department Name</FormLabel>
                  <Input
                    value={formData.dept_name}
                    onChange={(e) => setFormData({...formData, dept_name: e.target.value})}
                    placeholder="e.g., Production Planning, Quality Control"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.dept_desc}
                    onChange={(e) => setFormData({...formData, dept_desc: e.target.value})}
                    placeholder="Department description"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active Status</FormLabel>
                  <Switch
                    isChecked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                </FormControl>

                <HStack spacing={4} w="100%" justify="end">
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" colorScheme="blue">
                    {selectedDepartment ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Departments;
