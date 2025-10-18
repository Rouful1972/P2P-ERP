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
  TableContainer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  useToast,
  Badge,
  HStack,
  VStack,
  Text,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  InputGroup,
  InputLeftElement,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const dosageForms = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Cream', 
  'Drops', 'Spray', 'Powder', 'Gel', 'Lotion', 'Solution'
];

const drugCategories = [
  'Prescription', 'OTC', 'Controlled', 'Narcotic', 'Biologic', 'Vaccine'
];

const packTypes = [
  'Strip', 'Bottle', 'Vial', 'Tube', 'Sachet', 'Blister', 'Box', 'Pouch'
];

const storageConditions = [
  'Room Temperature', 'Cool Place', 'Refrigerated', 'Frozen', 'Controlled Temperature'
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productCategories, setProductCategories] = useState([]); // Add this line
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    product_desc: '',
    pcat_code: '', // Add this field
    dosage_form: '',
    strength: '',
    pack_size: '',
    generic_name: '',
    therapeutic_class: '',
    drug_category: '',
    shelf_life_months: '',
    storage_condition: '',
    pack_type: '',
    mrp: '',
    trade_price: '',
    is_active: true
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose
  } = useDisclosure();

  const cancelRef = React.useRef();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/api/products/');
      return response.data;
    }
  });

  // Fetch product categories
  const { data: categoriesData } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const response = await api.get('/api/product-categories/');
      return response.data;
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await api.post('/api/products/', productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast({
        title: 'Product created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error creating product',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/api/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast({
        title: 'Product updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error updating product',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast({
        title: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting product',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
      setFilteredProducts(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (categoriesData) {
      setProductCategories(categoriesData);
    }
  }, [categoriesData]);

  const resetForm = () => {
    setFormData({
      product_code: '',
      product_name: '',
      product_desc: '',
      pcat_code: '', // Reset this field
      dosage_form: '',
      strength: '',
      pack_size: '',
      generic_name: '',
      therapeutic_class: '',
      drug_category: '',
      shelf_life_months: '',
      storage_condition: '',
      pack_type: '',
      mrp: '',
      trade_price: '',
      is_active: true
    });
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      product_code: product.product_code,
      product_name: product.product_name,
      product_desc: product.product_desc || '',
      pcat_code: product.pcat_code || '', // Set this field
      dosage_form: product.dosage_form || '',
      strength: product.strength || '',
      pack_size: product.pack_size || '',
      generic_name: product.generic_name || '',
      therapeutic_class: product.therapeutic_class || '',
      drug_category: product.drug_category || '',
      shelf_life_months: product.shelf_life_months || '',
      storage_condition: product.storage_condition || '',
      pack_type: product.pack_type || '',
      mrp: product.mrp || '',
      trade_price: product.trade_price || '',
      is_active: product.is_active
    });
    onOpen();
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    onViewOpen();
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    onDeleteOpen();
  };

  const handleSubmit = () => {
    // Convert string numbers to proper types
    const submitData = {
      ...formData,
      shelf_life_months: formData.shelf_life_months ? parseInt(formData.shelf_life_months) : null,
      mrp: formData.mrp ? parseFloat(formData.mrp) : null,
      trade_price: formData.trade_price ? parseFloat(formData.trade_price) : null,
    };

    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: submitData });
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const activeProducts = filteredProducts.filter(p => p.is_active);
  const inactiveProducts = filteredProducts.filter(p => !p.is_active);

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex>
          <Heading>Products Management</Heading>
          <Spacer />
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Add Product
          </Button>
        </Flex>

        {/* Statistics */}
        <StatGroup>
          <Stat>
            <StatLabel>Total Products</StatLabel>
            <StatNumber>{filteredProducts.length}</StatNumber>
            <StatHelpText>All products</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Active Products</StatLabel>
            <StatNumber>{activeProducts.length}</StatNumber>
            <StatHelpText>Currently active</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Inactive Products</StatLabel>
            <StatNumber>{inactiveProducts.length}</StatNumber>
            <StatHelpText>Discontinued</StatHelpText>
          </Stat>
        </StatGroup>

        {/* Search */}
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by product name, code, or generic name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {/* Products Table */}
        <Card>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Product Code</Th>
                    <Th>Product Name</Th>
                    <Th>Generic Name</Th>
                    <Th>Dosage Form</Th>
                    <Th>Strength</Th>
                    <Th>Pack Size</Th>
                    <Th>MRP</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center">Loading...</Td>
                    </Tr>
                  ) : filteredProducts.length === 0 ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center">No products found</Td>
                    </Tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <Tr key={product.id}>
                        <Td fontWeight="bold">{product.product_code}</Td>
                        <Td>{product.product_name}</Td>
                        <Td>{product.generic_name || '-'}</Td>
                        <Td>{product.dosage_form || '-'}</Td>
                        <Td>{product.strength || '-'}</Td>
                        <Td>{product.pack_size || '-'}</Td>
                        <Td>{product.mrp ? `$${product.mrp}` : '-'}</Td>
                        <Td>
                          <Badge colorScheme={product.is_active ? 'green' : 'red'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleView(product)}
                              aria-label="View product"
                            />
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="yellow"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                              aria-label="Edit product"
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDelete(product)}
                              aria-label="Delete product"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Product Code</FormLabel>
                  <Input
                    value={formData.product_code}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                    placeholder="Enter 5-character product code"
                    maxLength={5}
                  />
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl isRequired>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </FormControl>
              </GridItem>

              <GridItem colSpan={3}>
                <FormControl>
                  <FormLabel>Product Description</FormLabel>
                  <Textarea
                    value={formData.product_desc}
                    onChange={(e) => setFormData({ ...formData, product_desc: e.target.value })}
                    placeholder="Enter product description"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Product Category</FormLabel>
                  <Select
                    value={formData.pcat_code}
                    onChange={(e) => setFormData({ ...formData, pcat_code: e.target.value })}
                    placeholder="Select product category"
                  >
                    {productCategories.map(category => (
                      <option key={category.pcat_code} value={category.pcat_code}>
                        {category.pcat_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Dosage Form</FormLabel>
                  <Select
                    value={formData.dosage_form}
                    onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                    placeholder="Select dosage form"
                  >
                    {dosageForms.map(form => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Strength</FormLabel>
                  <Input
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g., 500mg, 10ml"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Pack Size</FormLabel>
                  <Input
                    value={formData.pack_size}
                    onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                    placeholder="e.g., 10's, 100ml"
                  />
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Generic Name</FormLabel>
                  <Input
                    value={formData.generic_name}
                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    placeholder="Enter generic name"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Therapeutic Class</FormLabel>
                  <Input
                    value={formData.therapeutic_class}
                    onChange={(e) => setFormData({ ...formData, therapeutic_class: e.target.value })}
                    placeholder="e.g., Antibiotic, Analgesic"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Drug Category</FormLabel>
                  <Select
                    value={formData.drug_category}
                    onChange={(e) => setFormData({ ...formData, drug_category: e.target.value })}
                    placeholder="Select category"
                  >
                    {drugCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Shelf Life (Months)</FormLabel>
                  <NumberInput>
                    <NumberInputField
                      value={formData.shelf_life_months}
                      onChange={(e) => setFormData({ ...formData, shelf_life_months: e.target.value })}
                      placeholder="Enter shelf life"
                    />
                  </NumberInput>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Storage Condition</FormLabel>
                  <Select
                    value={formData.storage_condition}
                    onChange={(e) => setFormData({ ...formData, storage_condition: e.target.value })}
                    placeholder="Select storage condition"
                  >
                    {storageConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Pack Type</FormLabel>
                  <Select
                    value={formData.pack_type}
                    onChange={(e) => setFormData({ ...formData, pack_type: e.target.value })}
                    placeholder="Select pack type"
                  >
                    {packTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>MRP</FormLabel>
                  <NumberInput>
                    <NumberInputField
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="Enter MRP"
                    />
                  </NumberInput>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Trade Price</FormLabel>
                  <NumberInput>
                    <NumberInputField
                      value={formData.trade_price}
                      onChange={(e) => setFormData({ ...formData, trade_price: e.target.value })}
                      placeholder="Enter trade price"
                    />
                  </NumberInput>
                </FormControl>
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={createProductMutation.isLoading || updateProductMutation.isLoading}
            >
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Product Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">Product Code:</Text>
                  <Text>{selectedProduct.product_code}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Product Name:</Text>
                  <Text>{selectedProduct.product_name}</Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text fontWeight="bold">Description:</Text>
                  <Text>{selectedProduct.product_desc || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Generic Name:</Text>
                  <Text>{selectedProduct.generic_name || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Dosage Form:</Text>
                  <Text>{selectedProduct.dosage_form || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Strength:</Text>
                  <Text>{selectedProduct.strength || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Pack Size:</Text>
                  <Text>{selectedProduct.pack_size || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Therapeutic Class:</Text>
                  <Text>{selectedProduct.therapeutic_class || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Drug Category:</Text>
                  <Text>{selectedProduct.drug_category || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Shelf Life:</Text>
                  <Text>{selectedProduct.shelf_life_months ? `${selectedProduct.shelf_life_months} months` : 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Storage Condition:</Text>
                  <Text>{selectedProduct.storage_condition || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Pack Type:</Text>
                  <Text>{selectedProduct.pack_type || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">MRP:</Text>
                  <Text>{selectedProduct.mrp ? `$${selectedProduct.mrp}` : 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Trade Price:</Text>
                  <Text>{selectedProduct.trade_price ? `$${selectedProduct.trade_price}` : 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Status:</Text>
                  <Badge colorScheme={selectedProduct.is_active ? 'green' : 'red'}>
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Created By:</Text>
                  <Text>{selectedProduct.created_by || 'N/A'}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Created At:</Text>
                  <Text>{new Date(selectedProduct.created_at).toLocaleString()}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Updated At:</Text>
                  <Text>{new Date(selectedProduct.updated_at).toLocaleString()}</Text>
                </GridItem>
              </Grid>
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
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete product "{selectedProduct?.product_name}"? 
              This action will deactivate the product.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete} 
                ml={3}
                isLoading={deleteProductMutation.isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
