import { showNotification } from '../../features/common/headerSlice';

export const handleCopyClick = async (textToCopy, dispatch) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    dispatch(
      showNotification({
        message: 'Text copied to clipboard!',
        status: 1
      })
    );
  } catch (err) {
    dispatch(
      showNotification({
        message: 'Failed to copy text',
        status: 0
      })
    );
  }
};
