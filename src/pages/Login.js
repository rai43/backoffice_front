import React, { lazy } from 'react';

const Login = lazy( () => import('../features/user/Login') );
const ExternalLoginPage = ( props ) => {
    return <div>
        <Login />
    </div>;
};
export default ExternalLoginPage;