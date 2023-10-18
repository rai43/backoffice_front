import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import DynamicAssignment from '../../features/DynamicAssignment/index';

function InternalPage() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setPageTitle({ title: 'Dynamic Livreurs Assignment' }));
	}, []);

	return <DynamicAssignment />;
}

export default InternalPage;
