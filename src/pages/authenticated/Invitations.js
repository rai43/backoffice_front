import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Customers from '../../features/client';

function InternalPage() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setPageTitle({ title: 'Invitations' }));
	}, []);

	return <div>Invitations</div>
	// return <Customers />;
}

export default InternalPage;
