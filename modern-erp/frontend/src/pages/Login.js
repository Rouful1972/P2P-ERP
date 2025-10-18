import React, { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  IconProps,
  Icon,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const avatars = [
  {
    name: 'Ryan Florence',
    url: 'https://bit.ly/ryan-florence',
  },
  {
    name: 'Segun Adebayo',
    url: 'https://bit.ly/sage-adebayo',
  },
  {
    name: 'Kent Dodds',
    url: 'https://bit.ly/kent-c-dodds',
  },
  {
    name: 'Prosper Otemuyiwa',
    url: 'https://bit.ly/prosper-baba',
  },
  {
    name: 'Christian Nwamba',
    url: 'https://bit.ly/code-beast',
  },
];

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();
  const avatarSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const flexMinWidth = useBreakpointValue({ base: '44px', md: '60px' });
  const flexMinHeight = useBreakpointValue({ base: '44px', md: '60px' });
  const blurWidth = useBreakpointValue({ base: '100%', md: '40vw', lg: '30vw' });
  const blurZIndex = useBreakpointValue({ base: -1, md: -1, lg: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await login(formData.username, formData.password);
        if (!result.success) {
          // Ensure error is always a string
          const errorMsg = typeof result.error === 'string' ? result.error : 'Login failed';
          setError(errorMsg);
        }
      } else {
        const result = await register(formData);
        if (result.success) {
          toast({
            title: 'Registration successful',
            description: 'You can now log in with your credentials.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          setIsLogin(true);
          setFormData({ username: '', password: '', email: '', full_name: '' });
        } else {
          // Ensure error is always a string
          const errorMsg = typeof result.error === 'string' ? result.error : 'Registration failed';
          setError(errorMsg);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position={'relative'}>
      <Container
        as={SimpleGrid}
        maxW={'7xl'}
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 10, sm: 20, lg: 32 }}>
        <Stack spacing={{ base: 10, md: 20 }}>
          <Heading
            lineHeight={1.1}
            fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}>
            Pharmaceutical{' '}
            <Text
              as={'span'}
              bgGradient="linear(to-r, brand.400,brand.600)"
              bgClip="text">
              P2P ERP
            </Text>{' '}
            System
          </Heading>
          <Stack direction={'row'} spacing={4} align={'center'}>
            <AvatarGroup>
              {avatars.map((avatar) => (
                <Avatar
                  key={avatar.name}
                  name={avatar.name}
                  src={avatar.url}
                  size={avatarSize}
                  position={'relative'}
                  zIndex={2}
                  _before={{
                    content: '""',
                    width: 'full',
                    height: 'full',
                    rounded: 'full',
                    transform: 'scale(1.125)',
                    bgGradient: 'linear(to-bl, brand.400,brand.600)',
                    position: 'absolute',
                    zIndex: -1,
                    top: 0,
                    left: 0,
                  }}
                />
              ))}
            </AvatarGroup>
            <Text fontFamily={'heading'} fontSize={{ base: '4xl', md: '6xl' }}>
              +
            </Text>
            <Flex
              align={'center'}
              justify={'center'}
              fontFamily={'heading'}
              fontSize={{ base: 'sm', md: 'lg' }}
              bg={'gray.800'}
              color={'white'}
              rounded={'full'}
              minWidth={flexMinWidth}
              minHeight={flexMinHeight}
              position={'relative'}
              _before={{
                content: '""',
                width: 'full',
                height: 'full',
                rounded: 'full',
                transform: 'scale(1.125)',
                bgGradient: 'linear(to-bl, orange.400,yellow.400)',
                position: 'absolute',
                zIndex: -1,
                top: 0,
                left: 0,
              }}>
              YOU
            </Flex>
          </Stack>
        </Stack>
        <Stack
          bg={'gray.50'}
          rounded={'xl'}
          p={{ base: 4, sm: 6, md: 8 }}
          spacing={{ base: 8 }}
          maxW={{ lg: 'lg' }}>
          <Stack spacing={4}>
            <Heading
              color={'gray.800'}
              lineHeight={1.1}
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}>
              {isLogin ? 'Sign in to your account' : 'Create your account'}
              <Text
                as={'span'}
                bgGradient="linear(to-r, brand.400,brand.600)"
                bgClip="text">
                !
              </Text>
            </Heading>
            <Text color={'gray.500'} fontSize={{ base: 'sm', sm: 'md' }}>
              {isLogin 
                ? 'Access your pharmaceutical ERP system' 
                : 'Join the pharmaceutical ERP system'}
            </Text>
          </Stack>
          <Box as={'form'} mt={10} onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              {!isLogin && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      placeholder="John Doe"
                      bg={'gray.100'}
                      border={0}
                      color={'gray.500'}
                      _placeholder={{
                        color: 'gray.500',
                      }}
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      placeholder="john@company.com"
                      bg={'gray.100'}
                      border={0}
                      color={'gray.500'}
                      _placeholder={{
                        color: 'gray.500',
                      }}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </FormControl>
                </>
              )}
              
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  placeholder="username"
                  bg={'gray.100'}
                  border={0}
                  color={'gray.500'}
                  _placeholder={{
                    color: 'gray.500',
                  }}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  placeholder="password"
                  bg={'gray.100'}
                  border={0}
                  color={'gray.500'}
                  _placeholder={{
                    color: 'gray.500',
                  }}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </FormControl>
            </Stack>
            <Button
              fontFamily={'heading'}
              mt={8}
              w={'full'}
              bgGradient="linear(to-r, brand.400,brand.600)"
              color={'white'}
              _hover={{
                bgGradient: 'linear(to-r, brand.400,brand.600)',
                boxShadow: 'xl',
              }}
              type="submit"
              isLoading={loading}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            <Stack pt={6}>
              <Text align={'center'}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <Text 
                  as="span" 
                  color={'brand.400'} 
                  cursor="pointer"
                  onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Text>
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
      <Blur
        position={'absolute'}
        top={-10}
        left={-10}
        style={{ filter: 'blur(70px)' }}
        width={blurWidth}
        zIndex={blurZIndex}
      />
    </Box>
  );
}

export const Blur = (props) => {
  const { width, zIndex, ...otherProps } = props;
  
  return (
    <Icon
      width={width}
      zIndex={zIndex}
      height="560px"
      viewBox="0 0 528 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...otherProps}>
      <circle cx="71" cy="61" r="111" fill="#F56565" />
      <circle cx="244" cy="106" r="139" fill="#ED64A6" />
      <circle cy="291" r="139" fill="#ED64A6" />
      <circle cx="80.5" cy="189.5" r="101.5" fill="#ED8936" />
      <circle cx="196.5" cy="317.5" r="101.5" fill="#ECC94B" />
      <circle cx="70.5" cy="458.5" r="101.5" fill="#48BB78" />
      <circle cx="426.5" cy="-0.5" r="101.5" fill="#4299E1" />
    </Icon>
  );
};
