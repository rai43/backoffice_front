import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import store from './app/store';
import './index.css';

import App from './App';
const SuspenseContent = lazy(() => import('./containers/SuspenseContent'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<Suspense fallback={<SuspenseContent />}>
		<Provider store={store}>
			<App />
		</Provider>
	</Suspense>
);

// If you want to start measuring performance in your app, pass a functions
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
