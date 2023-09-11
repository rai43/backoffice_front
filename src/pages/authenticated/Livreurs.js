import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Livreur from '../../features/livreurs';

function InternalPage() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setPageTitle({ title: 'Livreurs' }));
	}, []);

	return <Livreur />;
}

export default InternalPage;
