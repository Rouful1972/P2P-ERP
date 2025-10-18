import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function StatsCard({ title, stat, icon, change, borderColor, iconColor }) {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={borderColor}
      rounded={'lg'}>
      <Flex justifyContent={'space-between'}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={'medium'} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            {stat}
          </StatNumber>
          {change && (
            <StatHelpText>
              <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
              {Math.abs(change).toFixed(2)}%
            </StatHelpText>
          )}
        </Box>
        <Box
          my={'auto'}
          color={iconColor}
          alignContent={'center'}>
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
}

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/reports/dashboard').then(res => res.data),
  });

  const borderColor = useColorModeValue('gray.800', 'gray.500');
  const iconColor = useColorModeValue('gray.800', 'gray.200');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return <Box>Loading dashboard...</Box>;
  }

  const statusData = dashboardData?.status_counts?.requisitions 
    ? Object.entries(dashboardData.status_counts.requisitions).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }} mb={8}>
        <StatsCard
          title={'Raw Materials'}
          stat={dashboardData?.totals?.raw_materials || 0}
          icon={<Box fontSize="2xl">📦</Box>}
          borderColor={borderColor}
          iconColor={iconColor}
        />
        <StatsCard
          title={'Products'}
          stat={dashboardData?.totals?.products || 0}
          icon={<Box fontSize="2xl">💊</Box>}
          borderColor={borderColor}
          iconColor={iconColor}
        />
        <StatsCard
          title={'Suppliers'}
          stat={dashboardData?.totals?.suppliers || 0}
          icon={<Box fontSize="2xl">🏭</Box>}
          borderColor={borderColor}
          iconColor={iconColor}
        />
        <StatsCard
          title={'Active Plans'}
          stat={dashboardData?.status_counts?.production_plans?.Planned || 0}
          icon={<Box fontSize="2xl">📋</Box>}
          borderColor={borderColor}
          iconColor={iconColor}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        {/* Requisition Status Chart */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Purchase Requisition Status</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Status Summary */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>System Status</Heading>
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text>Database Health</Text>
                  <Badge colorScheme="green">Healthy</Badge>
                </HStack>
                <Progress value={100} colorScheme="green" />
              </Box>
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text>System Performance</Text>
                  <Badge colorScheme="green">Good</Badge>
                </HStack>
                <Progress value={85} colorScheme="green" />
              </Box>
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text>Storage Usage</Text>
                  <Badge colorScheme="yellow">75%</Badge>
                </HStack>
                <Progress value={75} colorScheme="yellow" />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Recent Requisitions */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Recent Purchase Requisitions</Heading>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Req No.</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData?.recent_activity?.requisitions?.map((req) => (
                  <Tr key={req.id}>
                    <Td>{req.req_no}</Td>
                    <Td>{new Date(req.req_date).toLocaleDateString()}</Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          req.status === 'Approved' ? 'green' :
                          req.status === 'Draft' ? 'gray' :
                          req.status === 'Submitted' ? 'blue' : 'red'
                        }
                      >
                        {req.status}
                      </Badge>
                    </Td>
                    <Td>${req.total_amount || 0}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Recent Production Plans */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Recent Production Plans</Heading>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Plan No.</Th>
                  <Th>Product</Th>
                  <Th>Quantity</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData?.recent_activity?.production_plans?.map((plan) => (
                  <Tr key={plan.id}>
                    <Td>{plan.plan_no}</Td>
                    <Td>{plan.product_code}</Td>
                    <Td>{plan.planned_quantity}</Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          plan.status === 'Completed' ? 'green' :
                          plan.status === 'Planned' ? 'gray' :
                          plan.status === 'In Progress' ? 'blue' : 'red'
                        }
                      >
                        {plan.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
