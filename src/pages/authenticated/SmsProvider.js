import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import SmsPorvider from '../../features/smsPorvider';

function InternalPage() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setPageTitle({ title: 'Sms Provider' }));
	}, []);

	return <SmsPorvider />;
}

export default InternalPage;
