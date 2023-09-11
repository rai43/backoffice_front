import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import MerchantsSettings from '../../features/merchantsSettings';

function InternalPage() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setPageTitle({ title: 'Merchants Settings' }));
	}, []);

	return <MerchantsSettings />;
}

export default InternalPage;
