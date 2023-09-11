import React from 'react';
import Table, { SelectColumnFilter, StatusPill, AvatarCell, IndeterminateCheckbox } from '../../../components/Table/Table';

const getData = () => {
	const data = [
		{
			name: 'Jane Cooper',
			age: 27,
			email: 'jane.cooper@example.com',
			title: 'Regional Paradigm Technician',
			department: 'Optimization',
			status: 'Active',
			role: 'Admin',
			imgUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
		},
		{
			name: 'Cody Fisher',
			age: 23,
			email: 'cody.fisher@example.com',
			title: 'Product Directives Officer',
			department: 'Intranet',
			status: 'Inactive',
			role: 'Owner',
			imgUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
		},
		{
			name: 'Esther Howard',
			age: 17,
			email: 'esther.howard@example.com',
			title: 'Forward Response Developer',
			department: 'Directives',
			status: 'Active',
			role: 'Member',
			imgUrl: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
		},
		{
			name: 'Jenny Wilson',
			age: 27,
			email: 'jenny.wilson@example.com',
			title: 'Central Security Manager',
			department: 'Program',
			status: 'Active',
			role: 'Member',
			imgUrl: 'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
		},
		{
			name: 'Kristin Watson',
			age: 45,
			email: 'kristin.watson@example.com',
			title: 'Lean Implementation Liaison',
			department: 'Mobility',
			status: 'Inactive',
			role: 'Admin',
			imgUrl: 'https://images.unsplash.com/photo-1532417344469-368f9ae6d187?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
		},
		{
			name: 'Cameron Williamson',
			age: 24,
			email: 'cameron.williamson@example.com',
			title: 'Internal Applications Engineer',
			department: 'Security',
			status: 'Offline',
			role: 'Member',
			imgUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
		},
	];
	return [...data, ...data, ...data];
};
const ClientsTable = () => {
	const columns = React.useMemo(
		() => [
			{
				id: 'selection',
				// The header can use the table's getToggleAllRowsSelectedProps method
				// to render a checkbox
				Header: ({ getToggleAllRowsSelectedProps }) => (
					<div>
						<IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
					</div>
				),
				// The cell can use the individual row's getToggleRowSelectedProps method
				// to the render a checkbox
				Cell: ({ row }) => (
					<div>
						<IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
					</div>
				),
			},
			,
			{
				Header: 'Name',
				accessor: 'name',
				Cell: AvatarCell,
				imgAccessor: 'imgUrl',
				emailAccessor: 'email',
			},
			{
				Header: 'Age',
				accessor: 'age',
			},
			{
				Header: 'Title',
				accessor: 'title',
			},
			{
				Header: 'Status',
				accessor: 'status',
				Filter: SelectColumnFilter,
				filter: 'includes',
				Cell: StatusPill,
			},
			{
				Header: 'Role',
				accessor: 'role',
				Filter: SelectColumnFilter,
				filter: 'includes',
			},
		],
		[]
	);

	const data = React.useMemo(() => getData(), []);

	return (
		<>
			{/*<div className="min-h-screen bg-gray-100 text-gray-900 col-span-2">*/}
			{/*  <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">*/}
			{/*    <div className="mt-4">*/}
			<Table
				columns={columns}
				data={data}
			/>
			{/*    </div>*/}
			{/*  </main>*/}
			{/*</div>*/}
		</>
	);
};

export default ClientsTable;
