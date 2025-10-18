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

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    emp_code: '',
    emp_office_name: '',
    dept_code: '',
    job_category: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

      const [employeesRes, departmentsRes] = await Promise.all([
        fetch('/api/employees/', { headers }),
        fetch('/api/departments/', { headers })
      ]);

      const [employeesData, departmentsData] = await Promise.all([
        employeesRes.json(),
        departmentsRes.json()
      ]);

      setEmployees(employeesData);
      setDepartments(departmentsData);
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
      const url = selectedEmployee 
        ? `/api/employees/${selectedEmployee.emp_code}`
        : '/api/employees/';
      
      const method = selectedEmployee ? 'PUT' : 'POST';
      
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
          description: `Employee ${selectedEmployee ? 'updated' : 'created'} successfully`,
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

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      emp_code: employee.emp_code,
      emp_office_name: employee.emp_office_name,
      dept_code: employee.dept_code,
      job_category: employee.job_category || '',
      is_active: employee.is_active
    });
    onOpen();
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setFormData({
      emp_code: '',
      emp_office_name: '',
      dept_code: '',
      job_category: '',
      is_active: true
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedEmployee(null);
    setFormData({
      emp_code: '',
      emp_office_name: '',
      dept_code: '',
      job_category: '',
      is_active: true
    });
    onClose();
  };

  const getDepartmentName = (deptCode) => {
    const dept = departments.find(d => d.dept_code === deptCode);
    return dept ? dept.dept_name : deptCode;
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Employee Management</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={handleAdd}
          >
            Add Employee
          </Button>
        </HStack>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Employee Code</Th>
                  <Th>Employee Name</Th>
                  <Th>Department</Th>
                  <Th>Job Category</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {employees.map((employee) => (
                  <Tr key={employee.emp_code}>
                    <Td fontWeight="bold">{employee.emp_code}</Td>
                    <Td>{employee.emp_office_name}</Td>
                    <Td>{getDepartmentName(employee.dept_code)}</Td>
                    <Td>{employee.job_category || '-'}</Td>
                    <Td>
                      <Badge colorScheme={employee.is_active ? 'green' : 'red'}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEdit(employee)}
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
            {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Employee Code</FormLabel>
                  <Input
                    value={formData.emp_code}
                    onChange={(e) => setFormData({...formData, emp_code: e.target.value})}
                    placeholder="e.g., EMP001, EMP002"
                    disabled={!!selectedEmployee}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Employee Name</FormLabel>
                  <Input
                    value={formData.emp_office_name}
                    onChange={(e) => setFormData({...formData, emp_office_name: e.target.value})}
                    placeholder="e.g., John Doe - Production Manager"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={formData.dept_code}
                    onChange={(e) => setFormData({...formData, dept_code: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    {departments.filter(d => d.is_active).map(dept => (
                      <option key={dept.dept_code} value={dept.dept_code}>
                        {dept.dept_name} ({dept.dept_code})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Job Category</FormLabel>
                  <Select
                    value={formData.job_category}
                    onChange={(e) => setFormData({...formData, job_category: e.target.value})}
                  >
                    <option value="">Select Job Category</option>
                    <option value="1">1 - Executive</option>
                    <option value="2">2 - Manager</option>
                    <option value="3">3 - Supervisor</option>
                    <option value="4">4 - Officer</option>
                    <option value="5">5 - Other (Excluded from BOM)</option>
                  </Select>
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
                    {selectedEmployee ? 'Update' : 'Create'}
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

export default Employees;
