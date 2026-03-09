import type { FastifyInstance } from "fastify";
import { createUserController } from "../controllers/users/create-user-controller";
import { deleteUserController } from "../controllers/users/delete-user-controller";
import { getUserController } from "../controllers/users/get-user-controller";
import { getUsersController } from "../controllers/users/get-users-controller";
import { getUsersWithoutQueryController } from "../controllers/users/get-users-without-query-controller";
import { requestVerificationController } from "../controllers/users/request-verification-controller";
import { updateUserController } from "../controllers/users/update-user-controller";
import { updateUserEmailController } from "../controllers/users/update-user-email-controller";
import { updateUserPasswordController } from "../controllers/users/update-user-password-controller";
import { verifyUserController } from "../controllers/users/verify-user-controller";

export const registerUserRoutes = (app: FastifyInstance) => {
	app.register(createUserController);
	app.register(deleteUserController);
	app.register(getUserController);
	app.register(getUsersController);
	app.register(getUsersWithoutQueryController);
	app.register(requestVerificationController);
	app.register(updateUserController);
	app.register(updateUserEmailController);
	app.register(updateUserPasswordController);
	app.register(verifyUserController);
};
