import type { FastifyInstance } from "fastify";
import { assignTaskController } from "../controllers/tasks/assign-task-controller";
import { createTaskController } from "../controllers/tasks/create-task-controller";
import { deleteTaskController } from "../controllers/tasks/delete-task-controller";
import { getAssignmentsController } from "../controllers/tasks/get-assignments-controller";
import { getTasksController } from "../controllers/tasks/get-tasks-controller";
import { updateAssignmentController } from "../controllers/tasks/update-assignment-controller";
import { updateTaskController } from "../controllers/tasks/update-task-controller";
import { updateTaskStatusController } from "../controllers/tasks/update-task-status-controller";

export const registerTaskRoutes = (app: FastifyInstance) => {
	app.register(assignTaskController);
	app.register(createTaskController);
	app.register(deleteTaskController);
	app.register(getAssignmentsController);
	app.register(getTasksController);
	app.register(updateAssignmentController);
	app.register(updateTaskController);
	app.register(updateTaskStatusController);
};
