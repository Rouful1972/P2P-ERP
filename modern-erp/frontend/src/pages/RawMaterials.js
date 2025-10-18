import React, { useState } from 'react';
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
  Badge,
  IconButton,
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
  useToast,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function RawMaterials() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch raw materials
  const { data: rawMaterials, isLoading, error } = useQuery({
    queryKey: ['rawMaterials'],
    queryFn: () => api.get('/api/raw-materials/').then(res => res.data),
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return api.put(`/api/raw-materials/${editingItem.id}`, data);
      } else {
        return api.post('/api/raw-materials/', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rawMaterials']);
      toast({
        title: editingItem ? 'Raw material updated' : 'Raw material created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/raw-materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['rawMaterials']);
      toast({
        title: 'Raw material deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleClose = () => {
    setEditingItem(null);
    reset();
    onClose();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Set form values
    Object.keys(item).forEach(key => {
      setValue(key, item[key]);
    });
    onOpen();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this raw material?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) return <Spinner size="xl" />;
  if (error) return (
    <Alert status="error">
      <AlertIcon />
      Error loading raw materials: {error.message}
    </Alert>
  );

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Raw Materials</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen}>
          Add Raw Material
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>UOM</Th>
              <Th>Shelf Life (Months)</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rawMaterials?.map((item) => (
              <Tr key={item.id}>
                <Td fontWeight="bold">{item.raw_code}</Td>
                <Td>{item.raw_name}</Td>
                <Td>{item.raw_type}</Td>
                <Td>{item.unit_of_measure}</Td>
                <Td>{item.shelf_life_months}</Td>
                <Td>
                  <Badge colorScheme={item.is_active ? 'green' : 'red'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      icon={<FiEdit />}
                      size="sm"
                      onClick={() => handleEdit(item)}
                      aria-label="Edit"
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal for Add/Edit */}
      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {editingItem ? 'Edit Raw Material' : 'Add Raw Material'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isInvalid={errors.raw_code} mb={4}>
                <FormLabel>Raw Material Code</FormLabel>
                <Input
                  {...register('raw_code', { required: 'Raw material code is required' })}
                  placeholder="e.g., RM001"
                />
              </FormControl>

              <FormControl isInvalid={errors.raw_name} mb={4}>
                <FormLabel>Raw Material Name</FormLabel>
                <Input
                  {...register('raw_name', { required: 'Raw material name is required' })}
                  placeholder="e.g., Paracetamol"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('raw_desc')}
                  placeholder="Description of the raw material"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Raw Material Type</FormLabel>
                <Select {...register('raw_type')} placeholder="Select type">
                  <option value="API">API (Active Pharmaceutical Ingredient)</option>
                  <option value="EXC">Excipient</option>
                  <option value="PKG">Packaging Material</option>
                  <option value="CHM">Chemical</option>
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Raw Material Grade</FormLabel>
                <Select {...register('raw_grade')} placeholder="Select grade">
                  <option value="IP">IP (Indian Pharmacopoeia)</option>
                  <option value="BP">BP (British Pharmacopoeia)</option>
                  <option value="USP">USP (United States Pharmacopoeia)</option>
                  <option value="EP">EP (European Pharmacopoeia)</option>
                  <option value="JP">JP (Japanese Pharmacopoeia)</option>
                  <option value="NF">NF (National Formulary)</option>
                  <option value="FCC">FCC (Food Chemicals Codex)</option>
                  <option value="TECH">Technical Grade</option>
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Form Type</FormLabel>
                <Select {...register('form_type')} placeholder="Select form">
                  <option value="PWD">Powder</option>
                  <option value="LIQ">Liquid</option>
                  <option value="GRN">Granules</option>
                  <option value="CRY">Crystals</option>
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Specification Group</FormLabel>
                <Select {...register('spec_group')} placeholder="Select spec group">
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="C">Group C</option>
                  <option value="D">Group D</option>
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Unit of Measure</FormLabel>
                <Select {...register('unit_of_measure')} placeholder="Select UOM">
                  <option value="KG">Kilograms</option>
                  <option value="LTR">Liters</option>
                  <option value="PCS">Pieces</option>
                  <option value="MTR">Meters</option>
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Shelf Life (Months)</FormLabel>
                <Input
                  type="number"
                  {...register('shelf_life_months')}
                  placeholder="e.g., 24"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Storage Condition</FormLabel>
                <Input
                  {...register('storage_condition')}
                  placeholder="e.g., Store in cool, dry place"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>CAS Number</FormLabel>
                <Input
                  {...register('cas_number')}
                  placeholder="e.g., 103-90-2"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Molecular Formula</FormLabel>
                <Input
                  {...register('molecular_formula')}
                  placeholder="e.g., C8H9NO2"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Molecular Weight</FormLabel>
                <Input
                  type="number"
                  step="0.0001"
                  {...register('molecular_weight')}
                  placeholder="e.g., 151.163"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>HS Code</FormLabel>
                <Input
                  {...register('hs_code')}
                  placeholder="e.g., 2924.29.00"
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                colorScheme="brand"
                isLoading={mutation.isPending}
              >
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}
