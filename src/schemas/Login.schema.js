import * as yup from 'yup';

const schema = yup.object().shape( {
    email: yup.string().email( 'Invalid email' ).required( 'Email is required' ),
    /*
    * ^: Anchors the expression to the start of the string.
    * (?=.*[a-z]): Positive lookahead assertion for at least one lowercase letter.
    * (?=.*[A-Z]): Positive lookahead assertion for at least one uppercase letter.
    * (?=.*\d): Positive lookahead assertion for at least one digit.
    * (?=.*[@$!%*?&]): Positive lookahead assertion for at least one special character. You can customize the character set within the brackets to include the specific special characters you want to allow.
    * [A-Za-z\d@$!%*?&]{8,}: Matches a string of at least 8 characters that consists of letters (both lowercase and uppercase), digits, and the specified special characters.
    * $: Anchors the expression to the end of the string.
    * */
    password: yup.string()
        .required( 'Password is required' )
        .min( 8, 'Password must be at least 8 characters' )
        .matches( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' ),
} );

export default schema;