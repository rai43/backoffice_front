import * as yup from 'yup';

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const schema = yup.object().shape({
  merchant_name: yup.string().required('Merchant name is required'),
  phone_number: yup.string().required('Telephone is required'),
  latitude: yup.number().required('Telephone is required'),
  longitude: yup.number().required('Telephone is required')
  // profile_picture: yup
  // 	.mixed()
  // 	.test('fileSize', 'The maximum size of an image is 5 Mo.', (file) => (file ? file.size <= MAX_FILE_SIZE : true))
  // 	.test('fileType', 'Only these formats are accepted .jpg, .jpeg, .png and .webp', (file) => (file ? ACCEPTED_IMAGE_TYPES.includes(file.type) : true)),
});
