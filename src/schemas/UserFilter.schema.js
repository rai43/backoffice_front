import * as yup from 'yup';

const schema = yup.object().shape({
  nom: yup.string().required('Last name is required'),
  prenom: yup.string().required('First name is required'),
  telephone: yup.string().required('Telephone is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  adresse: yup.string().required('Address is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  userType: yup.string().required('User type is required')
});

export const schemaNoPassword = yup.object().shape({
  nom: yup.string().required('Last name is required'),
  prenom: yup.string().required('First name is required'),
  telephone: yup.string().required('Telephone is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  adresse: yup.string().required('Address is required'),
  userType: yup.string().required('User type is required')
});

export default schema;
