import Subtitle from '../Typography/Subtitle';

function TitleCard({ title, children, topMargin, containerStyle, TopSideButtons }) {
	return (
		<div className={'card w-full p-6 bg-base-100 shadow-xl ' + containerStyle + ' ' + (topMargin || ' mt-6')}>
			{/* Title for Card */}
			<Subtitle styleClasses={TopSideButtons ? 'inline-block' : ''}>
				{title}

				{/* Top side button, show only if present */}
				{TopSideButtons && <div className='inline-block float-right'>{TopSideButtons}</div>}
			</Subtitle>

			<div className='divider mt-2'></div>

			{/** Card Body */}
			<div className='h-full w-full pb-3 bg-base-100 overflow-auto'>{children}</div>
		</div>
	);
}

export default TitleCard;
