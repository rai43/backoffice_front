import * as yup from 'yup';

export const schema = yup.object().shape({
  phone_number: yup.string().required('Telephone is required')
});
