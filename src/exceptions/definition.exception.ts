import ExceptionAttribute from './attribute.exception';

// 400
export const badRequest = new ExceptionAttribute( 400, 90000, 'Bad request' );
export const badData = new ExceptionAttribute( 400, 90001, 'Invalid data' ); 
export const needUserUuid = new ExceptionAttribute( 400, 90005, 'Need userUuid' ); 
export const upsertFail = new ExceptionAttribute( 400, 90006, 'Upsert fail' );
export const updateFail = new ExceptionAttribute( 400, 90007, 'Update fail' );
export const createFail = new ExceptionAttribute( 400, 90008, 'Create fail' );
export const deleteFail = new ExceptionAttribute( 400, 90009, 'Delete fail' );
export const notFoundData = new ExceptionAttribute( 400, 90050, 'Empty Data' );

// 401
export const unAuthorized = new ExceptionAttribute( 401, 90100, 'Have no authorization' );
export const unAuthorizedToken = new ExceptionAttribute( 400, 90101, 'Unauthorized Token' );
export const expiredToken = new ExceptionAttribute( 400, 90102, 'expired Token' );

// 404
export const notFoundRoute = new ExceptionAttribute( 404, 90400, 'Not found route' );

// 500
export const ServerErrorForLogout = new ExceptionAttribute( 500, 95001, 'Server Error' );

// 502
export const econnrefused = new ExceptionAttribute( 502, 90502, 'Server connection refused' );
