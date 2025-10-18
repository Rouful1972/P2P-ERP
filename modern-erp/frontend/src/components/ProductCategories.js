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
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    pcat_code: '',
    pcat_name: '',
    pcat_desc: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/product-categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch product categories',
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
      const url = selectedCategory 
        ? `/api/product-categories/${selectedCategory.pcat_code}`
        : '/api/product-categories/';
      
      const method = selectedCategory ? 'PUT' : 'POST';
      
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
          description: `Product category ${selectedCategory ? 'updated' : 'created'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchCategories();
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

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      pcat_code: category.pcat_code,
      pcat_name: category.pcat_name,
      pcat_desc: category.pcat_desc || '',
      is_active: category.is_active
    });
    onOpen();
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({
      pcat_code: '',
      pcat_name: '',
      pcat_desc: '',
      is_active: true
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setFormData({
      pcat_code: '',
      pcat_name: '',
      pcat_desc: '',
      is_active: true
    });
    onClose();
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete category "${category.pcat_name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/product-categories/${category.pcat_code}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Product category deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchCategories();
        } else {
          throw new Error('Failed to delete category');
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
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Product Categories (PCAT)</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={handleAdd}
          >
            Add Category
          </Button>
        </HStack>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Category Code</Th>
                  <Th>Category Name</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category) => (
                  <Tr key={category.pcat_code}>
                    <Td fontWeight="bold">{category.pcat_code}</Td>
                    <Td>{category.pcat_name}</Td>
                    <Td>{category.pcat_desc || '-'}</Td>
                    <Td>
                      <Badge colorScheme={category.is_active ? 'green' : 'red'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEdit(category)}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(category)}
                        />
                      </HStack>
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
            {selectedCategory ? 'Edit Product Category' : 'Add Product Category'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Category Code</FormLabel>
                  <Input
                    value={formData.pcat_code}
                    onChange={(e) => setFormData({...formData, pcat_code: e.target.value})}
                    placeholder="e.g., TAB, CAP, SYR"
                    disabled={!!selectedCategory}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    value={formData.pcat_name}
                    onChange={(e) => setFormData({...formData, pcat_name: e.target.value})}
                    placeholder="e.g., Tablets, Capsules, Syrups"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.pcat_desc}
                    onChange={(e) => setFormData({...formData, pcat_desc: e.target.value})}
                    placeholder="Category description"
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
                    {selectedCategory ? 'Update' : 'Create'}
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

export default ProductCategories;
