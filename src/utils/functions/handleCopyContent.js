import html2canvas from 'html2canvas';

import { showNotification } from '../../features/common/headerSlice';

const handleCopyContent = async (contentId, dispatch) => {
  const content = document.getElementById(contentId);
  const canvas = await html2canvas(content);
  canvas.toBlob((blob) => {
    const item = new ClipboardItem({ 'image/png': blob });
    navigator.clipboard.write([item]);
  });

  dispatch(
    showNotification({
      message: 'Copied',
      status: 1
    })
  );
};

export default handleCopyContent;
