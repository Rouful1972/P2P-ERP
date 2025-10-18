import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  HStack,
  VStack,
  Drawer,
  DrawerContent,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiUsers,
  FiPackage,
  FiClipboard,
  FiTruck,
  FiBarChart2,
  FiFileText,
  FiShield,
  FiCreditCard,
  FiLayers,
  FiGrid,
  FiUser,
  FiFolder,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LinkItems = [
  { name: 'Dashboard', icon: FiHome, href: '/dashboard' },
  { name: 'Raw Materials', icon: FiPackage, href: '/raw-materials' },
  { name: 'Products', icon: FiStar, href: '/products' },
  { name: 'Product Categories', icon: FiGrid, href: '/product-categories' },
  { name: 'Suppliers', icon: FiUsers, href: '/suppliers' },
  { name: 'Bill of Materials', icon: FiClipboard, href: '/bom' },
  { name: 'Departments', icon: FiFolder, href: '/departments' },
  { name: 'Employees', icon: FiUser, href: '/employees' },
  { name: 'Procurement', icon: FiTruck, href: '/procurement' },
  { name: 'Production Planning', icon: FiTrendingUp, href: '/production' },
  { name: 'Quality Control', icon: FiShield, href: '/quality' },
  { name: 'Drug Registration', icon: FiFileText, href: '/drugs' },
  { name: 'Letter of Credit', icon: FiCreditCard, href: '/lc' },
  { name: 'Reports', icon: FiBarChart2, href: '/reports' },
];

export default function Layout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const sidebarBg = useColorModeValue('white', 'gray.900');
  const sidebarBorderColor = useColorModeValue('gray.200', 'gray.700');
  const navBg = useColorModeValue('white', 'gray.900');
  const navBorderColor = useColorModeValue('gray.200', 'gray.700');
  const menuBg = useColorModeValue('white', 'gray.900');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
        sidebarBg={sidebarBg}
        sidebarBorderColor={sidebarBorderColor}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent 
            onClose={onClose} 
            sidebarBg={sidebarBg}
            sidebarBorderColor={sidebarBorderColor}
          />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav 
        onOpen={onOpen} 
        navBg={navBg}
        navBorderColor={navBorderColor}
        menuBg={menuBg}
        menuBorderColor={menuBorderColor}
      />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

const SidebarContent = ({ onClose, sidebarBg, sidebarBorderColor, ...rest }) => {
  return (
    <Box
      transition="3s ease"
      bg={sidebarBg}
      borderRight="1px"
      borderRightColor={sidebarBorderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold" color="brand.500">
          Pharma ERP
        </Text>
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, href, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link to={href} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.400' : 'transparent'}
        color={isActive ? 'white' : 'inherit'}
        _hover={{
          bg: isActive ? 'brand.500' : 'brand.400',
          color: 'white',
        }}
        {...rest}>
        {icon && (
          <Box
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

const MobileNav = ({ onOpen, navBg, navBorderColor, menuBg, menuBorderColor, ...rest }) => {
  const { user, logout } = useAuth();
  
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={navBg}
      borderBottomWidth="1px"
      borderBottomColor={navBorderColor}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
        color="brand.500">
        Pharma ERP
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        />
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar
                  size={'sm'}
                  name={user?.full_name || user?.username}
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2">
                  <Text fontSize="sm">{user?.full_name || user?.username}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {user?.email}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={menuBg}
              borderColor={menuBorderColor}>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem onClick={logout}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
